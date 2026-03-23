import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UserHelpersService } from '../services/user-helpers.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private userService: UserHelpersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = req.user;
    if (!user || !user.user_id) {
      throw new Error('User not authenticated');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() body: { 
    name?: string; 
    email?: string; 
    currentPassword?: string;
    newPassword?: string;
  }) {
    const user = req.user;
    if (!user || !user.user_id) {
      throw new Error('User not authenticated');
    }

    const userId = user.user_id;

    const updateData: any = {};
    
    if (body.name) {
      updateData.name = body.name;
    }
    if (body.email) {
      updateData.email = body.email;
    }

    if (body.currentPassword && body.newPassword) {
      const isPasswordValid = await bcrypt.compare(body.currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      updateData.passwordHash = await bcrypt.hash(body.newPassword, 10);
    }

    const updatedUser = await this.userService.update(userId, updateData);
    const { passwordHash, ...result } = updatedUser;
    return { user: result, message: 'Profile updated successfully' };
  }

  @Post()
  @Roles(UserRole.SYSTEM_ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    const currentUser = req.user;
    return this.userService.create(createUserDto, createUserDto.password, currentUser?.user_id, currentUser?.email);
  }

  @Patch(':user_id')
  @Roles(UserRole.SYSTEM_ADMIN)
  async update(@Param('user_id') userId: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    const currentUser = req.user;
    return this.userService.update(userId, updateUserDto, currentUser?.user_id, currentUser?.email);
  }

  @Delete(':user_id')
  @Roles(UserRole.SYSTEM_ADMIN)
  async remove(@Param('user_id') userId: string, @Request() req: any) {
    const currentUser = req.user;
    await this.userService.delete(userId, currentUser?.user_id, currentUser?.email);
    return { message: 'User deleted successfully', success: true };
  }

  @Post(':user_id/reset-password')
  @Roles(UserRole.SYSTEM_ADMIN)
  async resetPassword(@Param('user_id') userId: string, @Body() body: { newPassword: string }, @Request() req: any) {
    const currentUser = req.user;
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    return this.userService.update(userId, { passwordHash: hashedPassword } as any, currentUser?.user_id, currentUser?.email);
  }
}
