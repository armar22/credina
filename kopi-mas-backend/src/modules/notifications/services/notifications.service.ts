import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from '../entities/notification.entity';

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async findAll(userId: string, options?: { limit?: number; unreadOnly?: boolean }): Promise<Notification[]> {
    const where: any = { userId };
    if (options?.unreadOnly) {
      where.isRead = false;
    }
    
    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: options?.limit || 20,
    });
  }

  async findOne(notificationId: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { notification_id: notificationId },
    });
  }

  async create(createDto: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(createDto);
    return this.notificationRepository.save(notification);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    await this.notificationRepository.update(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
    return this.findOne(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async delete(notificationId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }

  async getStats(userId: string): Promise<NotificationStats> {
    const [total, unread, all] = await Promise.all([
      this.notificationRepository.count({ where: { userId } }),
      this.notificationRepository.count({ where: { userId, isRead: false } }),
      this.notificationRepository.find({ where: { userId } }),
    ]);

    const byType: Record<string, number> = {};
    all.forEach((n) => {
      byType[n.notificationType] = (byType[n.notificationType] || 0) + 1;
    });

    return { total, unread, byType };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    entityType?: string;
    entityId?: string;
    actionUrl?: string;
  }): Promise<Notification> {
    return this.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      notificationType: data.type,
      priority: data.priority || NotificationPriority.MEDIUM,
      entityType: data.entityType,
      entityId: data.entityId,
      actionUrl: data.actionUrl,
      isRead: false,
    });
  }
}
