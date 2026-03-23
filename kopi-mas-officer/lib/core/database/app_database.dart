import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/features/members/models/member_model.dart';

class MemberData {
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
  final bool isSynced;
  final DateTime createdAt;
  final DateTime updatedAt;

  MemberData({
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
    required this.status,
    required this.isSynced,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MemberData.fromModel(MemberModel m, {bool synced = false}) {
    final now = DateTime.now();
    return MemberData(
      id: m.id,
      nik: m.nik,
      name: m.name,
      phone: m.phone,
      address: m.address,
      income: m.income,
      email: m.email,
      regionId: m.regionId,
      birthDate: m.birthDate,
      birthPlace: m.birthPlace,
      gender: m.gender,
      occupation: m.occupation,
      status: m.status,
      isSynced: synced,
      createdAt: m.createdAt ?? now,
      updatedAt: m.updatedAt ?? now,
    );
  }

  MemberModel toModel() {
    return MemberModel(
      id: id,
      nik: nik,
      name: name,
      phone: phone,
      address: address,
      income: income,
      email: email,
      regionId: regionId,
      birthDate: birthDate,
      birthPlace: birthPlace,
      gender: gender,
      occupation: occupation,
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  MemberData copyWith({
    String? id,
    String? nik,
    String? name,
    String? phone,
    String? address,
    double? income,
    String? email,
    String? regionId,
    DateTime? birthDate,
    String? birthPlace,
    String? gender,
    String? occupation,
    String? status,
    bool? isSynced,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return MemberData(
      id: id ?? this.id,
      nik: nik ?? this.nik,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      income: income ?? this.income,
      email: email ?? this.email,
      regionId: regionId ?? this.regionId,
      birthDate: birthDate ?? this.birthDate,
      birthPlace: birthPlace ?? this.birthPlace,
      gender: gender ?? this.gender,
      occupation: occupation ?? this.occupation,
      status: status ?? this.status,
      isSynced: isSynced ?? this.isSynced,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class LoanData {
  final String id;
  final String memberId;
  final String loanNumber;
  final double principalAmount;
  final double interestRate;
  final int tenureMonths;
  final double monthlyPayment;
  final String purpose;
  final String status;
  final String? approvalType;
  final DateTime submissionDate;
  final DateTime? approvalDate;
  final DateTime? rejectionDate;
  final String? rejectionReason;
  final DateTime? disbursementDate;
  final String? disbursedBy;
  final bool isSynced;
  final DateTime createdAt;
  final DateTime updatedAt;

  LoanData({
    required this.id,
    required this.memberId,
    required this.loanNumber,
    required this.principalAmount,
    required this.interestRate,
    required this.tenureMonths,
    required this.monthlyPayment,
    required this.purpose,
    required this.status,
    this.approvalType,
    required this.submissionDate,
    this.approvalDate,
    this.rejectionDate,
    this.rejectionReason,
    this.disbursementDate,
    this.disbursedBy,
    required this.isSynced,
    required this.createdAt,
    required this.updatedAt,
  });
}

class VerificationData {
  final String id;
  final String loanId;
  final String officerId;
  final String verificationType;
  final String status;
  final String? photoPath;
  final double? latitude;
  final double? longitude;
  final String? notes;
  final DateTime? verifiedAt;
  final bool isSynced;
  final DateTime createdAt;
  final DateTime updatedAt;

  VerificationData({
    required this.id,
    required this.loanId,
    required this.officerId,
    required this.verificationType,
    required this.status,
    this.photoPath,
    this.latitude,
    this.longitude,
    this.notes,
    this.verifiedAt,
    required this.isSynced,
    required this.createdAt,
    required this.updatedAt,
  });
}

class AppDatabase {
  static final AppDatabase _instance = AppDatabase._internal();
  factory AppDatabase() => _instance;
  AppDatabase._internal();

  final List<MemberData> _members = [];
  final List<LoanData> _loans = [];
  final List<VerificationData> _verifications = [];

  List<MemberData> get members => List.unmodifiable(_members);
  List<LoanData> get loans => List.unmodifiable(_loans);
  List<VerificationData> get verifications => List.unmodifiable(_verifications);

  Future<List<MemberData>> getAllMembers() async => _members;
  Future<MemberData?> getMemberById(String id) async {
    try {
      return _members.firstWhere((m) => m.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<void> insertMember(MemberData member) async {
    _members.add(member);
  }

  Future<void> updateMember(MemberData member) async {
    final index = _members.indexWhere((m) => m.id == member.id);
    if (index != -1) {
      _members[index] = member;
    }
  }

  Future<void> deleteMember(String id) async {
    _members.removeWhere((m) => m.id == id);
  }

  Future<List<LoanData>> getAllLoans() async => _loans;
  Future<LoanData?> getLoanById(String id) async {
    try {
      return _loans.firstWhere((l) => l.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<List<LoanData>> getLoansByMemberId(String memberId) async {
    return _loans.where((l) => l.memberId == memberId).toList();
  }

  Future<void> insertLoan(LoanData loan) async {
    _loans.add(loan);
  }

  Future<void> updateLoan(LoanData loan) async {
    final index = _loans.indexWhere((l) => l.id == loan.id);
    if (index != -1) {
      _loans[index] = loan;
    }
  }

  Future<void> deleteLoan(String id) async {
    _loans.removeWhere((l) => l.id == id);
  }

  Future<List<VerificationData>> getAllVerifications() async => _verifications;
  Future<VerificationData?> getVerificationById(String id) async {
    try {
      return _verifications.firstWhere((v) => v.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<List<VerificationData>> getVerificationsByLoanId(String loanId) async {
    return _verifications.where((v) => v.loanId == loanId).toList();
  }

  Future<void> insertVerification(VerificationData verification) async {
    _verifications.add(verification);
  }

  Future<void> updateVerification(VerificationData verification) async {
    final index = _verifications.indexWhere((v) => v.id == verification.id);
    if (index != -1) {
      _verifications[index] = verification;
    }
  }

  Future<void> deleteVerification(String id) async {
    _verifications.removeWhere((v) => v.id == id);
  }

  Future<List<MemberData>> getUnsyncedMembers() async {
    return _members.where((m) => !m.isSynced).toList();
  }

  Future<List<LoanData>> getUnsyncedLoans() async {
    return _loans.where((l) => !l.isSynced).toList();
  }

  Future<List<VerificationData>> getUnsyncedVerifications() async {
    return _verifications.where((v) => !v.isSynced).toList();
  }

  Future<void> markMemberAsSynced(String id) async {
    final index = _members.indexWhere((m) => m.id == id);
    if (index != -1) {
      _members[index] = _members[index].copyWith(isSynced: true);
    }
  }

  Future<void> markLoanAsSynced(String id) async {
    final index = _loans.indexWhere((l) => l.id == id);
    if (index != -1) {
      _loans[index] = LoanData(
        id: _loans[index].id,
        memberId: _loans[index].memberId,
        loanNumber: _loans[index].loanNumber,
        principalAmount: _loans[index].principalAmount,
        interestRate: _loans[index].interestRate,
        tenureMonths: _loans[index].tenureMonths,
        monthlyPayment: _loans[index].monthlyPayment,
        purpose: _loans[index].purpose,
        status: _loans[index].status,
        approvalType: _loans[index].approvalType,
        submissionDate: _loans[index].submissionDate,
        approvalDate: _loans[index].approvalDate,
        rejectionDate: _loans[index].rejectionDate,
        rejectionReason: _loans[index].rejectionReason,
        disbursementDate: _loans[index].disbursementDate,
        disbursedBy: _loans[index].disbursedBy,
        isSynced: true,
        createdAt: _loans[index].createdAt,
        updatedAt: DateTime.now(),
      );
    }
  }

  Future<void> markVerificationAsSynced(String id) async {
    final index = _verifications.indexWhere((v) => v.id == id);
    if (index != -1) {
      final v = _verifications[index];
      _verifications[index] = VerificationData(
        id: v.id,
        loanId: v.loanId,
        officerId: v.officerId,
        verificationType: v.verificationType,
        status: v.status,
        photoPath: v.photoPath,
        latitude: v.latitude,
        longitude: v.longitude,
        notes: v.notes,
        verifiedAt: v.verifiedAt,
        isSynced: true,
        createdAt: v.createdAt,
        updatedAt: DateTime.now(),
      );
    }
  }
}

final databaseProvider = Provider<AppDatabase>((ref) {
  return AppDatabase();
});
