import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: CurrentUserData) {
    return this.profilesService.getProfile(user.userId);
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { fullName?: string; avatarUrl?: string; dailyGoal?: number },
  ) {
    return this.profilesService.updateProfile(user.userId, body);
  }
}
