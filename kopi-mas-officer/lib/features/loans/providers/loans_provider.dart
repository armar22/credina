import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';

class LoanApplicationModel {
  final String id;
  final String memberId;
  final String? memberName;
  final String? memberNik;
  final String? memberPhone;
  final String? agentId;
  final String? agentName;
  final String? loanProductId;
  final String? loanProductName;
  final String? loanProductType;
  final String loanProductTypeStr;
  final double loanAmount;
  final int loanTenureMonths;
  final double interestRate;
  final String interestRateType;
  final String? purposeDescription;
  final String incomeSource;
  final double monthlyIncome;
  final double? debtToIncomeRatio;
  final String applicationStatus;
  final DateTime submittedAt;
  final String? reviewedBy;
  final DateTime? reviewedAt;
  final String? rejectionReason;
  final int? creditScore;
  final String? aiRecommendation;
  final String? approvedBy;
  final DateTime? approvedAt;
  final String? branchId;
  final String? branchCode;
  final String? branchName;
  final bool disbursedByAgent;
  final DateTime? agentDisbursementDate;
  final DateTime? createdAt;

  LoanApplicationModel({
    required this.id,
    required this.memberId,
    this.memberName,
    this.memberNik,
    this.memberPhone,
    this.agentId,
    this.agentName,
    this.loanProductId,
    this.loanProductName,
    this.loanProductType,
    required this.loanProductTypeStr,
    required this.loanAmount,
    required this.loanTenureMonths,
    required this.interestRate,
    required this.interestRateType,
    this.purposeDescription,
    required this.incomeSource,
    required this.monthlyIncome,
    this.debtToIncomeRatio,
    required this.applicationStatus,
    required this.submittedAt,
    this.reviewedBy,
    this.reviewedAt,
    this.rejectionReason,
    this.creditScore,
    this.aiRecommendation,
    this.approvedBy,
    this.approvedAt,
    this.branchId,
    this.branchCode,
    this.branchName,
    this.disbursedByAgent = false,
    this.agentDisbursementDate,
    this.createdAt,
  });

  factory LoanApplicationModel.fromJson(Map<String, dynamic> json) {
    final member = json['member'] as Map<String, dynamic>?;
    final loanProduct = json['loanProduct'] as Map<String, dynamic>?;
    final branch = json['branch'] as Map<String, dynamic>?;
    
    return LoanApplicationModel(
      id: json['id'] as String? ?? '',
      memberId: member?['id'] as String? ?? json['memberId'] as String? ?? '',
      memberName: member?['name'] as String?,
      memberNik: member?['nik'] as String?,
      memberPhone: member?['phone'] as String?,
      agentId: json['agentId'] as String?,
      agentName: json['agentName'] as String?,
      loanProductId: loanProduct?['id'] as String?,
      loanProductName: loanProduct?['productName'] as String?,
      loanProductType: loanProduct?['productType'] as String?,
      loanProductTypeStr: json['loanProductType'] as String? ?? loanProduct?['productType'] as String? ?? 'personal',
      loanAmount: (json['loanAmount'] as num?)?.toDouble() ?? 0,
      loanTenureMonths: json['loanTenureMonths'] as int? ?? 0,
      interestRate: (json['interestRate'] as num?)?.toDouble() ?? 0,
      interestRateType: json['interestRateType'] as String? ?? 'fixed',
      purposeDescription: json['purposeDescription'] as String?,
      incomeSource: json['incomeSource'] as String? ?? 'employed',
      monthlyIncome: (json['monthlyIncome'] as num?)?.toDouble() ?? 0,
      debtToIncomeRatio: (json['debtToIncomeRatio'] as num?)?.toDouble(),
      applicationStatus: json['applicationStatus'] as String? ?? json['application_status'] as String? ?? 'submitted',
      submittedAt: json['submittedAt'] != null 
          ? DateTime.parse(json['submittedAt'] as String)
          : DateTime.now(),
      reviewedBy: json['reviewedBy'] as String?,
      reviewedAt: json['reviewedAt'] != null 
          ? DateTime.parse(json['reviewedAt'] as String)
          : null,
      rejectionReason: json['rejectionReason'] as String?,
      creditScore: json['creditScore'] as int?,
      aiRecommendation: json['aiRecommendation'] as String?,
      approvedBy: json['approvedBy'] as String?,
      approvedAt: json['approvedAt'] != null 
          ? DateTime.parse(json['approvedAt'] as String)
          : null,
      branchId: branch?['id'] as String?,
      branchCode: branch?['branchCode'] as String?,
      branchName: branch?['branchName'] as String?,
      disbursedByAgent: json['disbursedByAgent'] as bool? ?? false,
      agentDisbursementDate: json['agentDisbursementDate'] != null 
          ? DateTime.parse(json['agentDisbursementDate'] as String)
          : null,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'member_id': memberId,
      'loan_product_id': loanProductId,
      'loan_product_type': loanProductTypeStr,
      'loan_amount': loanAmount,
      'loan_tenure_months': loanTenureMonths,
      'interest_rate': interestRate,
      'interest_rate_type': interestRateType,
      'purpose_description': purposeDescription,
      'income_source': incomeSource,
      'monthly_income': monthlyIncome,
      'debt_to_income_ratio': debtToIncomeRatio,
      'application_status': applicationStatus,
      'submitted_at': submittedAt.toIso8601String(),
    };
  }
}

class LoanApplicationsNotifier extends StateNotifier<AsyncValue<List<LoanApplicationModel>>> {
  final ApiClient _apiClient;

  LoanApplicationsNotifier(this._apiClient) : super(const AsyncValue.loading()) {
    loadLoanApplications();
  }

  Future<void> loadLoanApplications({String? status, String? search}) async {
    state = const AsyncValue.loading();
    try {
      final queryParams = <String, dynamic>{};
      if (status != null && status != 'all') {
        queryParams['status'] = status;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      
      final response = await _apiClient.get(
        ApiConstants.loanApplicationsEndpoint,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      
      List<dynamic> data = [];
      if (response.data != null) {
        final responseData = response.data;
        if (responseData is Map) {
          if (responseData['data'] != null && responseData['data'] is List) {
            data = responseData['data'] as List;
          } else if (responseData is List) {
            data = responseData as List;
        }
        } else if (responseData is List) {
          data = responseData as List;
        }
      }
      
      final loans = data.map((json) => LoanApplicationModel.fromJson(json as Map<String, dynamic>)).toList();
      state = AsyncValue.data(loans);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createLoanApplication(LoanApplicationModel loan) async {
    try {
      await _apiClient.post(ApiConstants.loanApplicationsEndpoint, data: loan.toJson());
      await loadLoanApplications();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateApplicationStatus({
    required String applicationId,
    required String status,
    String? reviewedBy,
  }) async {
    try {
      await _apiClient.patch(
        '${ApiConstants.loanApplicationsEndpoint}/$applicationId/status',
        data: {
          'status': status,
          'reviewed_by': reviewedBy,
        },
      );
      await loadLoanApplications();
      return true;
    } catch (e) {
      return false;
    }
  }
}

final loanApplicationsNotifierProvider = 
    StateNotifierProvider<LoanApplicationsNotifier, AsyncValue<List<LoanApplicationModel>>>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return LoanApplicationsNotifier(apiClient);
});

final loanApplicationDetailProvider = FutureProvider.family<LoanApplicationModel?, String>((ref, id) async {
  final apiClient = ref.watch(apiClientProvider);
  try {
    final response = await apiClient.get('${ApiConstants.loanApplicationsEndpoint}/$id');
    if (response.data != null) {
      return LoanApplicationModel.fromJson(response.data);
    }
    return null;
  } catch (e) {
    return null;
  }
});
