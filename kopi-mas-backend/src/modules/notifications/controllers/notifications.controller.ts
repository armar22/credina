import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('stats')
  async getStats(@Request() req: any) {
    const userId = req.user?.user_id;
    return this.notificationsService.getStats(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user?.user_id;
    return { count: await this.notificationsService.getUnreadCount(userId) };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    const userId = req.user?.user_id;
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('unread') unread?: string,
  ) {
    const userId = req.user?.user_id;
    return this.notificationsService.findAll(userId, { limit, unreadOnly: unread === 'true' });
  }

  @Get(':notification_id')
  async findOne(@Param('notification_id') notificationId: string) {
    return this.notificationsService.findOne(notificationId);
  }

  @Patch(':notification_id/read')
  async markAsRead(@Param('notification_id') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId);
  }

  @Delete(':notification_id')
  async delete(@Param('notification_id') notificationId: string) {
    await this.notificationsService.delete(notificationId);
    return { message: 'Notification deleted' };
  }
}
