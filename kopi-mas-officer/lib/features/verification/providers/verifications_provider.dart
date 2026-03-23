import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';

double _parseDouble(dynamic value) {
  if (value == null) return 0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}

class VerificationModel {
  final String id;
  final String applicationId;
  final String officerId;
  final String verificationType;
  final String verificationStatus;
  final String? photoUrl;
  final double? latitude;
  final double? longitude;
  final String? notes;
  final DateTime? verificationDate;
  final bool? addressVerified;
  final bool? checklistCompleted;
  final Map<String, dynamic>? checklistData;
  final String? signatureUrl;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  VerificationModel({
    required this.id,
    required this.applicationId,
    required this.officerId,
    required this.verificationType,
    required this.verificationStatus,
    this.photoUrl,
    this.latitude,
    this.longitude,
    this.notes,
    this.verificationDate,
    this.addressVerified,
    this.checklistCompleted,
    this.checklistData,
    this.signatureUrl,
    this.createdAt,
    this.updatedAt,
  });

  factory VerificationModel.fromJson(Map<String, dynamic> json) {
    return VerificationModel(
      id: json['verification_id'] as String? ?? json['id'] as String? ?? '',
      applicationId: json['applicationId'] as String? ?? json['application_id'] as String? ?? '',
      officerId: json['officerId'] as String? ?? json['officer_id'] as String? ?? '',
      verificationType: json['verificationType'] as String? ?? json['verification_type'] as String? ?? 'residence',
      verificationStatus: json['verificationStatus'] as String? ?? json['verification_status'] as String? ?? 'pending',
      photoUrl: json['photoUrl'] as String? ?? json['photo_url'] as String? ?? json['signatureUrl'] as String?,
      latitude: _parseDouble(json['gpsLatitude'] ?? json['gps_latitude'] ?? json['latitude']),
      longitude: _parseDouble(json['gpsLongitude'] ?? json['gps_longitude'] ?? json['longitude']),
      notes: json['notes'] as String?,
      verificationDate: json['verificationDate'] != null
          ? DateTime.parse(json['verificationDate'] as String)
          : (json['verification_date'] != null ? DateTime.parse(json['verification_date'] as String) : null),
      addressVerified: json['addressVerified'] as bool? ?? json['address_verified'] as bool?,
      checklistCompleted: json['checklistCompleted'] as bool? ?? json['checklist_completed'] as bool?,
      checklistData: json['checklistData'] as Map<String, dynamic>? ?? json['checklist_data'] as Map<String, dynamic>?,
      signatureUrl: json['signatureUrl'] as String? ?? json['signature_url'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : (json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : (json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'verification_id': id,
      'application_id': applicationId,
      'officer_id': officerId,
      'verification_type': verificationType,
      'verification_status': verificationStatus,
      'photo_url': photoUrl,
      'gps_latitude': latitude,
      'gps_longitude': longitude,
      'notes': notes,
      'verification_date': verificationDate?.toIso8601String(),
      'address_verified': addressVerified,
      'checklist_completed': checklistCompleted,
      'checklist_data': checklistData,
      'signature_url': signatureUrl,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}

class VerificationStats {
  final int total;
  final int pending;
  final int passed;
  final int failed;

  VerificationStats({
    this.total = 0,
    this.pending = 0,
    this.passed = 0,
    this.failed = 0,
  });

  factory VerificationStats.fromJson(Map<String, dynamic> json) {
    return VerificationStats(
      total: json['total'] as int? ?? 0,
      pending: json['pending'] as int? ?? 0,
      passed: json['passed'] as int? ?? 0,
      failed: json['failed'] as int? ?? 0,
    );
  }
}

final verificationsListProvider = FutureProvider<List<VerificationModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get(ApiConstants.verificationsEndpoint);
    debugPrint('Verifications response: ${response.data}');
    if (response.data != null) {
      List<dynamic> data;
      if (response.data is List) {
        data = response.data as List<dynamic>;
      } else if (response.data is Map && response.data['data'] != null) {
        data = response.data['data'] as List<dynamic>;
      } else {
        return [];
      }
      return data.map((json) => VerificationModel.fromJson(json as Map<String, dynamic>)).toList();
    }
    return [];
  } catch (e) {
    debugPrint('Verifications error: $e');
    return [];
  }
});

final verificationStatsProvider = FutureProvider<VerificationStats>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.verificationsEndpoint}/stats/summary');
    if (response.data != null) {
      return VerificationStats.fromJson(response.data);
    }
    return VerificationStats();
  } catch (e) {
    return VerificationStats();
  }
});

final verificationDetailProvider = FutureProvider.family<VerificationModel?, String>((ref, id) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.verificationsEndpoint}/$id');
    if (response.data != null) {
      return VerificationModel.fromJson(response.data);
    }
    return null;
  } catch (e) {
    return null;
  }
});

class VerificationsNotifier extends StateNotifier<AsyncValue<List<VerificationModel>>> {
  final ApiClient _apiClient;

  VerificationsNotifier(this._apiClient) : super(const AsyncValue.loading()) {
    fetchVerifications();
  }

  Future<void> fetchVerifications({String? applicationId}) async {
    state = const AsyncValue.loading();
    try {
      final queryParams = applicationId != null ? {'application_id': applicationId} : null;
      final response = await _apiClient.get(
        ApiConstants.verificationsEndpoint,
        queryParameters: queryParams,
      );
      debugPrint('Verifications fetch response: ${response.data}');
      if (response.data != null) {
        List<dynamic> data;
        if (response.data is List) {
          data = response.data as List<dynamic>;
        } else if (response.data is Map && response.data['data'] != null) {
          data = response.data['data'] as List<dynamic>;
        } else {
          state = const AsyncValue.data([]);
          return;
        }
        final verifications = data.map((json) => VerificationModel.fromJson(json as Map<String, dynamic>)).toList();
        state = AsyncValue.data(verifications);
      } else {
        state = const AsyncValue.data([]);
      }
    } catch (e, st) {
      debugPrint('Verifications fetch error: $e');
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createVerification({
    required String applicationId,
    required String verificationType,
    String? photoUrl,
    double? latitude,
    double? longitude,
    String? notes,
  }) async {
    try {
      await _apiClient.post(
        ApiConstants.verificationsEndpoint,
        data: {
          'application_id': applicationId,
          'verification_type': verificationType,
          'photo_url': photoUrl,
          'latitude': latitude,
          'longitude': longitude,
          'notes': notes,
          'verification_status': 'pending',
        },
      );
      await fetchVerifications();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateVerificationStatus({
    required String verificationId,
    required String status,
    String? notes,
  }) async {
    try {
      await _apiClient.patch(
        '${ApiConstants.verificationsEndpoint}/$verificationId',
        data: {
          'verification_status': status,
          'notes': notes,
        },
      );
      await fetchVerifications();
      return true;
    } catch (e) {
      return false;
    }
  }
}

final verificationsNotifierProvider =
    StateNotifierProvider<VerificationsNotifier, AsyncValue<List<VerificationModel>>>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return VerificationsNotifier(apiClient);
});
