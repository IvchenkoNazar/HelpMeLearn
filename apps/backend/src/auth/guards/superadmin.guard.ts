import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SuperadminGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) throw new ForbiddenException('Not authenticated');

    const { data } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (data?.role !== 'superadmin') {
      throw new ForbiddenException('Superadmin access required');
    }

    return true;
  }
}
