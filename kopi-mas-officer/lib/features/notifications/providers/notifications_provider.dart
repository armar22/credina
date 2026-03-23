import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';

class NotificationModel {
  final String? notification_id;
  final String? userId;
  final String? title;
  final String? message;
  final String? notificationType;
  final String? priority;
  final String? entityType;
  final String? entityId;
  final bool isRead;
  final String? readAt;
  final String? actionUrl;
  final String? createdAt;

  NotificationModel({
    this.notification_id,
    this.userId,
    this.title,
    this.message,
    this.notificationType,
    this.priority,
    this.entityType,
    this.entityId,
    this.isRead = false,
    this.readAt,
    this.actionUrl,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      notification_id: json['notification_id'],
      userId: json['userId'],
      title: json['title'],
      message: json['message'],
      notificationType: json['notificationType'],
      priority: json['priority'],
      entityType: json['entityType'],
      entityId: json['entityId'],
      isRead: json['isRead'] ?? false,
      readAt: json['readAt'],
      actionUrl: json['actionUrl'],
      createdAt: json['createdAt'],
    );
  }
}

final notificationsProvider = FutureProvider<List<NotificationModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get(ApiConstants.notificationsEndpoint);
    if (response.data != null && response.data is List) {
      return (response.data as List)
          .map((json) => NotificationModel.fromJson(json))
          .toList();
    }
    return [];
  } catch (e) {
    return [];
  }
});

final unreadCountProvider = FutureProvider<int>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.notificationsEndpoint}/unread-count');
    if (response.data != null && response.data['count'] != null) {
      return response.data['count'];
    }
    return 0;
  } catch (e) {
    return 0;
  }
});

class NotificationsNotifier extends StateNotifier<AsyncValue<List<NotificationModel>>> {
  final ApiClient api;
  
  NotificationsNotifier(this.api) : super(const AsyncValue.loading()) {
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    state = const AsyncValue.loading();
    try {
      final response = await api.get(ApiConstants.notificationsEndpoint);
      if (response.data != null && response.data is List) {
        final notifications = (response.data as List)
            .map((json) => NotificationModel.fromJson(json))
            .toList();
        state = AsyncValue.data(notifications);
      } else {
        state = const AsyncValue.data([]);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await api.patch('${ApiConstants.notificationsEndpoint}/$notificationId/read');
      await fetchNotifications();
    } catch (e) {
      // Handle error
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await api.patch('${ApiConstants.notificationsEndpoint}/read-all');
      await fetchNotifications();
    } catch (e) {
      // Handle error
    }
  }
}

final notificationsNotifierProvider =
    StateNotifierProvider<NotificationsNotifier, AsyncValue<List<NotificationModel>>>((ref) {
  final api = ref.read(apiClientProvider);
  return NotificationsNotifier(api);
});
