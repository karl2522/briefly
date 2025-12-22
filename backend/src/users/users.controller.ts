import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    // Fetch full user data including OAuth providers
    const fullUser = await this.usersService.findById(user.id);
    const userWithProviders = await this.usersService.getUserWithProviders(user.id);
    
    return {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      avatar: fullUser.avatar,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
      canEditProfile: !!(userWithProviders.googleId || userWithProviders.facebookId),
      provider: userWithProviders.googleId ? 'google' : userWithProviders.facebookId ? 'facebook' : 'email',
    };
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: any, @Body() updateDto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, updateDto);
  }
}


