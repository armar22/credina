import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';
import 'package:kopi_mas_officer/features/installments/models/installment_model.dart';

final installmentsProvider = FutureProvider<List<InstallmentModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get(ApiConstants.installmentsEndpoint);
    if (response.data != null && response.data['data'] != null) {
      return (response.data['data'] as List)
          .map((json) => InstallmentModel.fromJson(json))
          .toList();
    }
    return [];
  } catch (e) {
    return [];
  }
});

final installmentStatsProvider = FutureProvider<InstallmentStats>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.installmentsEndpoint}/stats');
    if (response.data != null) {
      return InstallmentStats.fromJson(response.data);
    }
    return InstallmentStats();
  } catch (e) {
    return InstallmentStats();
  }
});

final overdueInstallmentsProvider = FutureProvider<List<InstallmentModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.installmentsEndpoint}/overdue');
    if (response.data != null) {
      return (response.data as List)
          .map((json) => InstallmentModel.fromJson(json))
          .toList();
    }
    return [];
  } catch (e) {
    return [];
  }
});

final installmentByApplicationProvider = FutureProvider.family<List<InstallmentModel>, String>((ref, applicationId) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.installmentsEndpoint}/application/$applicationId');
    if (response.data != null && response.data['data'] != null) {
      return (response.data['data'] as List)
          .map((json) => InstallmentModel.fromJson(json))
          .toList();
    }
    return [];
  } catch (e) {
    return [];
  }
});

class InstallmentsNotifier extends StateNotifier<AsyncValue<List<InstallmentModel>>> {
  final ApiClient api;
  
  InstallmentsNotifier(this.api) : super(const AsyncValue.loading()) {
    fetchInstallments();
  }

  Future<void> fetchInstallments({String? status, String? memberId}) async {
    state = const AsyncValue.loading();
    try {
      final queryParams = <String, dynamic>{};
      if (status != null && status != 'all') {
        queryParams['status'] = status;
      }
      if (memberId != null) {
        queryParams['member_id'] = memberId;
      }
      
      final response = await api.get(
        ApiConstants.installmentsEndpoint,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      if (response.data != null && response.data['data'] != null) {
        final installments = (response.data['data'] as List)
            .map((json) => InstallmentModel.fromJson(json))
            .toList();
        state = AsyncValue.data(installments);
      } else {
        state = const AsyncValue.data([]);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> recordPayment({
    required String installmentId,
    required double paidAmount,
    String? paymentMethod,
    String? transactionReference,
  }) async {
    try {
      await api.patch('${ApiConstants.installmentsEndpoint}/$installmentId/pay', data: {
        'paidAmount': paidAmount,
        'paymentMethod': paymentMethod,
        'transactionReference': transactionReference,
      });
      await fetchInstallments();
      return true;
    } catch (e) {
      return false;
    }
  }
}

final installmentsNotifierProvider =
    StateNotifierProvider<InstallmentsNotifier, AsyncValue<List<InstallmentModel>>>((ref) {
  final api = ref.read(apiClientProvider);
  return InstallmentsNotifier(api);
});
