import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserWithProviders(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        googleId: true,
        facebookId: true,
      },
    });

    return user || { googleId: null, facebookId: null };
  }

  async updateProfile(id: string, updateDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user has OAuth providers (Google or Facebook)
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        googleId: true,
        facebookId: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Only allow profile updates for OAuth users
    if (!user.googleId && !user.facebookId) {
      throw new BadRequestException('Profile updates are only available for OAuth users');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.avatar !== undefined && { avatar: updateDto.avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}







