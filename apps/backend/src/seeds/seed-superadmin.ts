import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SECRET_KEY']!,
);

async function seedSuperadmin() {
  const email = 'superadmin@superadmin.com';
  const password = 'P@ssword1';

  console.log(`Creating superadmin user: ${email}`);

  // Create in Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Super Admin' },
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('User already exists, promoting to superadmin...');
      // Find existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users.find((u) => u.email === email);
      if (existing) {
        await supabase.from('profiles').update({ role: 'superadmin' }).eq('id', existing.id);
        console.log('Done — existing user promoted to superadmin.');
      }
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
    return;
  }

  // Set role in profiles (trigger creates the row, we update it)
  await new Promise((r) => setTimeout(r, 500)); // wait for trigger
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'superadmin' })
    .eq('id', data.user.id);

  if (profileError) {
    console.error('Profile update error:', profileError.message);
    process.exit(1);
  }

  console.log(`Superadmin created: ${email} / ${password}`);
  console.log('Change this password after first login in production!');
}

seedSuperadmin();
