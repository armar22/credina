class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String? role;
  final String? regionId;
  final String? cooperativeId;
  final String? profilePhoto;
  final DateTime? lastLogin;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    this.role,
    this.regionId,
    this.cooperativeId,
    this.profilePhoto,
    this.lastLogin,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String?,
      role: json['role'] as String?,
      regionId: json['region_id'] as String?,
      cooperativeId: json['cooperative_id'] as String?,
      profilePhoto: json['profile_photo'] as String?,
      lastLogin: json['last_login'] != null 
          ? DateTime.parse(json['last_login'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'role': role,
      'region_id': regionId,
      'cooperative_id': cooperativeId,
      'profile_photo': profilePhoto,
      'last_login': lastLogin?.toIso8601String(),
    };
  }
}
