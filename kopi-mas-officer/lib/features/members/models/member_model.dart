class MemberModel {
  final String id;
  final String nik;
  final String name;
  final String phone;
  final String address;
  final double income;
  final String? email;
  final String? regionId;
  final DateTime? birthDate;
  final String? birthPlace;
  final String? gender;
  final String? occupation;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const MemberModel({
    required this.id,
    required this.nik,
    required this.name,
    required this.phone,
    required this.address,
    required this.income,
    this.email,
    this.regionId,
    this.birthDate,
    this.birthPlace,
    this.gender,
    this.occupation,
    this.status = 'active',
    this.createdAt,
    this.updatedAt,
  });

  factory MemberModel.fromJson(Map<String, dynamic> json) {
    return MemberModel(
      id: json['member_id'] as String? ?? json['id'] as String? ?? '',
      nik: json['nik'] as String? ?? '',
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      address: json['address'] as String? ?? '',
      income: (json['income'] as num?)?.toDouble() ?? 0,
      email: json['email'] as String?,
      regionId: json['region_id'] as String?,
      birthDate: json['dob'] != null 
          ? DateTime.parse(json['dob'] as String) 
          : (json['birth_date'] != null ? DateTime.parse(json['birth_date'] as String) : null),
      birthPlace: json['birth_place'] as String?,
      gender: json['gender'] as String?,
      occupation: json['occupation'] as String?,
      status: json['status'] as String? ?? 'active',
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
      'id': id,
      'nik': nik,
      'name': name,
      'phone': phone,
      'address': address,
      'income': income,
      'email': email,
      'region_id': regionId,
      'birth_date': birthDate?.toIso8601String(),
      'birth_place': birthPlace,
      'gender': gender,
      'occupation': occupation,
      'status': status,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}
