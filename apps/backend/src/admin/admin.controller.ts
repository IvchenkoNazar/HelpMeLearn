import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminGuard } from '../auth/guards/superadmin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, SuperadminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('users/:id')
  getUserStats(@Param('id') id: string) {
    return this.adminService.getUserStats(id);
  }

  @Patch('users/:id/tier')
  updateTier(
    @Param('id') id: string,
    @Body('tier') tier: 'free' | 'premium',
  ) {
    return this.adminService.updateUserTier(id, tier);
  }
}
