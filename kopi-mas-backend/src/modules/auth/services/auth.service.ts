import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserHelpersService } from '../../users/services/user-helpers.service';
import { User } from '../../users/entities/user.entity';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AuditAction } from '../../audit-logs/entities/audit-log.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserHelpersService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (user && await this.userService.validatePassword(user, password)) {
      return user;
    }
    return null;
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      await this.auditLogsService.create({
        action: AuditAction.LOGIN,
        userEmail: email,
        isSuccess: false,
        errorMessage: 'Invalid credentials',
        description: `Failed login attempt for email: ${email}`,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.user_id, email: user.email, role: user.role };
    
    await this.userService.update(user.user_id, { lastLogin: new Date() });

    await this.auditLogsService.create({
      action: AuditAction.LOGIN,
      userId: user.user_id,
      userEmail: user.email,
      userRole: user.role,
      isSuccess: true,
      description: `User logged in: ${user.email}`,
    });
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        user_id: user.user_id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const newPayload: JwtPayload = { sub: payload.sub, email: payload.email, role: payload.role };
      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
