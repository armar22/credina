import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';

class MemberStats {
  final int total;
  final int active;
  final int inactive;
  final int newThisMonth;

  MemberStats({
    this.total = 0,
    this.active = 0,
    this.inactive = 0,
    this.newThisMonth = 0,
  });

  factory MemberStats.fromJson(Map<String, dynamic>? json) {
    if (json == null) return MemberStats();
    return MemberStats(
      total: json['total'] as int? ?? 0,
      active: json['active'] as int? ?? 0,
      inactive: json['inactive'] as int? ?? 0,
      newThisMonth: json['newThisMonth'] as int? ?? 0,
    );
  }
}

class LoanApplicationStats {
  final int total;
  final int submitted;
  final int underReview;
  final int approved;
  final int rejected;
  final int disbursed;

  LoanApplicationStats({
    this.total = 0,
    this.submitted = 0,
    this.underReview = 0,
    this.approved = 0,
    this.rejected = 0,
    this.disbursed = 0,
  });

  factory LoanApplicationStats.fromJson(Map<String, dynamic>? json) {
    if (json == null) return LoanApplicationStats();
    return LoanApplicationStats(
      total: json['total'] as int? ?? 0,
      submitted: json['submitted'] as int? ?? 0,
      underReview: json['underReview'] as int? ?? 0,
      approved: json['approved'] as int? ?? 0,
      rejected: json['rejected'] as int? ?? 0,
      disbursed: json['disbursed'] as int? ?? 0,
    );
  }
}

class DisbursementStats {
  final int total;
  final int pending;
  final int processing;
  final int completed;
  final int failed;
  final double totalAmount;
  final double disbursedAmount;

  DisbursementStats({
    this.total = 0,
    this.pending = 0,
    this.processing = 0,
    this.completed = 0,
    this.failed = 0,
    this.totalAmount = 0,
    this.disbursedAmount = 0,
  });

  factory DisbursementStats.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DisbursementStats();
    return DisbursementStats(
      total: json['total'] as int? ?? 0,
      pending: json['pending'] as int? ?? 0,
      processing: json['processing'] as int? ?? 0,
      completed: json['completed'] as int? ?? 0,
      failed: json['failed'] as int? ?? 0,
      totalAmount: _parseDouble(json['totalAmount']),
      disbursedAmount: _parseDouble(json['disbursedAmount']),
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

class RecentApplication {
  final String id;
  final String memberName;
  final double loanAmount;
  final String status;
  final DateTime submittedAt;
  final String productName;

  RecentApplication({
    required this.id,
    required this.memberName,
    required this.loanAmount,
    required this.status,
    required this.submittedAt,
    required this.productName,
  });

  factory RecentApplication.fromJson(Map<String, dynamic> json) {
    return RecentApplication(
      id: json['id'] as String? ?? '',
      memberName: json['memberName'] as String? ?? 'Unknown',
      loanAmount: _parseDouble(json['loanAmount']),
      status: json['status'] as String? ?? 'unknown',
      submittedAt: json['submittedAt'] != null 
          ? DateTime.parse(json['submittedAt'] as String)
          : DateTime.now(),
      productName: json['productName'] as String? ?? 'personal',
    );
  }
}

class RecentDisbursement {
  final String id;
  final String memberName;
  final double amount;
  final String status;
  final DateTime? disbursedAt;

  RecentDisbursement({
    required this.id,
    required this.memberName,
    required this.amount,
    required this.status,
    this.disbursedAt,
  });

  factory RecentDisbursement.fromJson(Map<String, dynamic> json) {
    return RecentDisbursement(
      id: json['id'] as String? ?? '',
      memberName: json['memberName'] as String? ?? 'Unknown',
      amount: _parseDouble(json['amount']),
      status: json['status'] as String? ?? 'unknown',
      disbursedAt: json['disbursedAt'] != null 
          ? DateTime.parse(json['disbursedAt'] as String)
          : null,
    );
  }
}

class DashboardStats {
  final MemberStats memberStats;
  final LoanApplicationStats loanApplicationStats;
  final DisbursementStats disbursementStats;
  final CollectionStats collectionStats;
  final List<RecentApplication> recentApplications;
  final List<RecentDisbursement> recentDisbursements;

  DashboardStats({
    MemberStats? memberStats,
    LoanApplicationStats? loanApplicationStats,
    DisbursementStats? disbursementStats,
    CollectionStats? collectionStats,
    List<RecentApplication>? recentApplications,
    List<RecentDisbursement>? recentDisbursements,
  })  : memberStats = memberStats ?? MemberStats(),
        loanApplicationStats = loanApplicationStats ?? LoanApplicationStats(),
        disbursementStats = disbursementStats ?? DisbursementStats(),
        collectionStats = collectionStats ?? CollectionStats(),
        recentApplications = recentApplications ?? [],
        recentDisbursements = recentDisbursements ?? [];

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      memberStats: MemberStats.fromJson(json['memberStats'] as Map<String, dynamic>?),
      loanApplicationStats: LoanApplicationStats.fromJson(json['loanApplicationStats'] as Map<String, dynamic>?),
      disbursementStats: DisbursementStats.fromJson(json['disbursementStats'] as Map<String, dynamic>?),
      collectionStats: CollectionStats.fromJson(json['collectionStats'] as Map<String, dynamic>?),
      recentApplications: (json['recentApplications'] as List<dynamic>?)
              ?.map((e) => RecentApplication.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      recentDisbursements: (json['recentDisbursements'] as List<dynamic>?)
              ?.map((e) => RecentDisbursement.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.dashboardEndpoint}/stats');
    debugPrint('Dashboard raw response: ${response.data}');
    if (response.data != null) {
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return DashboardStats.fromJson(data);
      } else if (data is Map && data['data'] != null) {
        return DashboardStats.fromJson(data['data'] as Map<String, dynamic>);
      }
    }
    return DashboardStats();
  } catch (e) {
    debugPrint('Dashboard API Error: $e');
    rethrow;
  }
});

class DashboardNotifier extends StateNotifier<AsyncValue<DashboardStats>> {
  final ApiClient _apiClient;

  DashboardNotifier(this._apiClient) : super(const AsyncValue.loading()) {
    fetchStats();
  }

  Future<void> fetchStats() async {
    state = const AsyncValue.loading();
    try {
      debugPrint('Fetching dashboard stats from: ${ApiConstants.dashboardEndpoint}/stats');
      final response = await _apiClient.get('${ApiConstants.dashboardEndpoint}/stats');
      debugPrint('Dashboard response: ${response.data}');
      if (response.data != null) {
        final data = response.data;
        if (data is Map<String, dynamic>) {
          state = AsyncValue.data(DashboardStats.fromJson(data));
        } else if (data is Map && data['data'] != null) {
          state = AsyncValue.data(DashboardStats.fromJson(data['data'] as Map<String, dynamic>));
        } else {
          state = AsyncValue.data(DashboardStats());
        }
      } else {
        state = AsyncValue.data(DashboardStats());
      }
    } catch (e, st) {
      debugPrint('Dashboard fetch error: $e');
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await fetchStats();
  }
}

final dashboardNotifierProvider =
    StateNotifierProvider<DashboardNotifier, AsyncValue<DashboardStats>>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return DashboardNotifier(apiClient);
});