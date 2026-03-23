class CollectionModel {
  final String id;
  final String? memberId;
  final String? memberName;
  final String? memberNik;
  final String? memberPhone;
  final String? applicationId;
  final double? applicationLoanAmount;
  final int? applicationTenureMonths;
  final int installmentNumber;
  final DateTime? dueDate;
  final double dueAmount;
  final double paidAmount;
  final DateTime? paidDate;
  final String collectionStatus;
  final String? collectedByOfficerId;
  final String? notes;
  final DateTime? createdAt;

  CollectionModel({
    required this.id,
    this.memberId,
    this.memberName,
    this.memberNik,
    this.memberPhone,
    this.applicationId,
    this.applicationLoanAmount,
    this.applicationTenureMonths,
    required this.installmentNumber,
    this.dueDate,
    required this.dueAmount,
    required this.paidAmount,
    this.paidDate,
    required this.collectionStatus,
    this.collectedByOfficerId,
    this.notes,
    this.createdAt,
  });

  factory CollectionModel.fromJson(Map<String, dynamic> json) {
    final member = json['member'] as Map<String, dynamic>?;
    final application = json['application'] as Map<String, dynamic>?;
    
    return CollectionModel(
      id: json['id'] as String? ?? '',
      memberId: member?['id'] as String?,
      memberName: member?['name'] as String?,
      memberNik: member?['nik'] as String?,
      memberPhone: member?['phone'] as String?,
      applicationId: application?['id'] as String?,
      applicationLoanAmount: (application?['loanAmount'] as num?)?.toDouble(),
      applicationTenureMonths: application?['loanTenureMonths'] as int?,
      installmentNumber: json['installmentNumber'] as int? ?? 0,
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate'] as String) : null,
      dueAmount: (json['dueAmount'] as num?)?.toDouble() ?? 0,
      paidAmount: (json['paidAmount'] as num?)?.toDouble() ?? 0,
      paidDate: json['paidDate'] != null ? DateTime.parse(json['paidDate'] as String) : null,
      collectionStatus: json['collectionStatus'] as String? ?? 'pending',
      collectedByOfficerId: json['collectedByOfficerId'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
    );
  }
}

class CollectionStats {
  final int totalPending;
  final int totalPaid;
  final int totalOverdue;
  final double totalAmount;
  final double collectedAmount;

  CollectionStats({
    this.totalPending = 0,
    this.totalPaid = 0,
    this.totalOverdue = 0,
    this.totalAmount = 0,
    this.collectedAmount = 0,
  });

  factory CollectionStats.fromJson(dynamic json) {
    if (json == null) return CollectionStats();
    final data = json is Map<String, dynamic> ? json : Map<String, dynamic>.from(json);
    return CollectionStats(
      totalPending: data['totalPending'] as int? ?? 0,
      totalPaid: data['totalPaid'] as int? ?? 0,
      totalOverdue: data['totalOverdue'] as int? ?? 0,
      totalAmount: _parseDouble(data['totalAmount']),
      collectedAmount: _parseDouble(data['collectedAmount']),
    );
  }
}

double _parseDouble(dynamic value) {
  if (value == null) return 0;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}
