import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';

class ProfileModel {
  final String? user_id;
  final String? name;
  final String? email;
  final String? role;
  final String? branchId;
  final String? branchName;
  final String? phone;
  final String? createdAt;

  ProfileModel({
    this.user_id,
    this.name,
    this.email,
    this.role,
    this.branchId,
    this.branchName,
    this.phone,
    this.createdAt,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      user_id: json['user_id'],
      name: json['fullName'] ?? json['name'],
      email: json['email'],
      role: json['role'],
      branchId: json['branchId'],
      branchName: json['branchName'],
      phone: json['phone'],
      createdAt: json['createdAt'],
    );
  }
}

final profileProvider = FutureProvider<ProfileModel>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get(ApiConstants.profileEndpoint);
    if (response.data != null) {
      return ProfileModel.fromJson(response.data);
    }
    return ProfileModel();
  } catch (e) {
    return ProfileModel();
  }
});

class ProfileNotifier extends StateNotifier<AsyncValue<ProfileModel>> {
  final ApiClient api;
  
  ProfileNotifier(this.api) : super(const AsyncValue.loading()) {
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    state = const AsyncValue.loading();
    try {
      final response = await api.get(ApiConstants.profileEndpoint);
      if (response.data != null) {
        state = AsyncValue.data(ProfileModel.fromJson(response.data));
      } else {
        state = AsyncValue.data(ProfileModel());
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> updateProfile({String? name, String? email, String? currentPassword, String? newPassword}) async {
    try {
      await api.patch(ApiConstants.profileEndpoint, data: {
        if (name != null) 'fullName': name,
        if (email != null) 'email': email,
        if (currentPassword != null && newPassword != null) ...{
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      });
      await fetchProfile();
      return true;
    } catch (e) {
      return false;
    }
  }
}

final profileNotifierProvider = StateNotifierProvider<ProfileNotifier, AsyncValue<ProfileModel>>((ref) {
  final api = ref.read(apiClientProvider);
  return ProfileNotifier(api);
});
