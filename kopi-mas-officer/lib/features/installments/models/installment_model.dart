class InstallmentModel {
  final String? installment_id;
  final String? applicationId;
  final String? memberId;
  final String? disbursementId;
  final int installmentNumber;
  final double principalAmount;
  final double interestAmount;
  final double totalAmount;
  final double paidAmount;
  final String? dueDate;
  final String? paidDate;
  final String installmentStatus;
  final double penaltyAmount;
  final String? paidByOfficerId;
  final String? paymentMethod;
  final String? transactionReference;
  final String? notes;
  final String? createdAt;
  final String? updatedAt;

  InstallmentModel({
    this.installment_id,
    this.applicationId,
    this.memberId,
    this.disbursementId,
    this.installmentNumber = 0,
    this.principalAmount = 0,
    this.interestAmount = 0,
    this.totalAmount = 0,
    this.paidAmount = 0,
    this.dueDate,
    this.paidDate,
    this.installmentStatus = 'pending',
    this.penaltyAmount = 0,
    this.paidByOfficerId,
    this.paymentMethod,
    this.transactionReference,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory InstallmentModel.fromJson(Map<String, dynamic> json) {
    return InstallmentModel(
      installment_id: json['installment_id'],
      applicationId: json['applicationId'],
      memberId: json['memberId'],
      disbursementId: json['disbursementId'],
      installmentNumber: json['installmentNumber'] ?? 0,
      principalAmount: (json['principalAmount'] ?? 0).toDouble(),
      interestAmount: (json['interestAmount'] ?? 0).toDouble(),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      paidAmount: (json['paidAmount'] ?? 0).toDouble(),
      dueDate: json['dueDate'],
      paidDate: json['paidDate'],
      installmentStatus: json['installmentStatus'] ?? 'pending',
      penaltyAmount: (json['penaltyAmount'] ?? 0).toDouble(),
      paidByOfficerId: json['paidByOfficerId'],
      paymentMethod: json['paymentMethod'],
      transactionReference: json['transactionReference'],
      notes: json['notes'],
      createdAt: json['createdAt'],
      updatedAt: json['updatedAt'],
    );
  }

  double get remainingAmount => totalAmount - paidAmount;
}

class InstallmentStats {
  final int totalInstallments;
  final int pendingCount;
  final int paidCount;
  final int overdueCount;
  final double totalDueAmount;
  final double totalPaidAmount;

  InstallmentStats({
    this.totalInstallments = 0,
    this.pendingCount = 0,
    this.paidCount = 0,
    this.overdueCount = 0,
    this.totalDueAmount = 0,
    this.totalPaidAmount = 0,
  });

  factory InstallmentStats.fromJson(Map<String, dynamic> json) {
    return InstallmentStats(
      totalInstallments: json['totalInstallments'] ?? 0,
      pendingCount: json['pendingCount'] ?? 0,
      paidCount: json['paidCount'] ?? 0,
      overdueCount: json['overdueCount'] ?? 0,
      totalDueAmount: (json['totalDueAmount'] ?? 0).toDouble(),
      totalPaidAmount: (json['totalPaidAmount'] ?? 0).toDouble(),
    );
  }
}
