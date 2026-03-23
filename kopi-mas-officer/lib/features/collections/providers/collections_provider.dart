import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';
import 'package:kopi_mas_officer/features/collections/models/collection_model.dart';

List<dynamic> _extractListData(dynamic responseData) {
  if (responseData is Map) {
    final data = responseData['data'];
    if (data != null && data is List) {
      return data;
    }
  }
  if (responseData is List) {
    return responseData;
  }
  return [];
}

final collectionsProvider = FutureProvider<List<CollectionModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get(ApiConstants.collectionsEndpoint);
    if (response.data != null) {
      final data = _extractListData(response.data);
      return data.map((json) => CollectionModel.fromJson(json as Map<String, dynamic>)).toList();
    }
    return [];
  } catch (e) {
    return [];
  }
});

final collectionStatsProvider = FutureProvider<CollectionStats>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.collectionsEndpoint}/stats');
    if (response.data != null) {
      final responseData = response.data;
      Map<String, dynamic> data;
      if (responseData is Map) {
        if (responseData['data'] != null && responseData['data'] is Map) {
          data = responseData['data'] as Map<String, dynamic>;
        } else {
          data = responseData as Map<String, dynamic>;
        }
      } else {
        data = {};
      }
      return CollectionStats.fromJson(data);
    }
    return CollectionStats();
  } catch (e) {
    return CollectionStats();
  }
});

final overdueCollectionsProvider = FutureProvider<List<CollectionModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.collectionsEndpoint}/overdue');
    if (response.data != null) {
      final data = _extractListData(response.data);
      return data.map((json) => CollectionModel.fromJson(json as Map<String, dynamic>)).toList();
    }
    return [];
  } catch (e) {
    return [];
  }
});

class CollectionsNotifier extends StateNotifier<AsyncValue<List<CollectionModel>>> {
  final ApiClient api;
  
  CollectionsNotifier(this.api) : super(const AsyncValue.loading()) {
    fetchCollections();
  }

  Future<void> fetchCollections({String? status, String? memberId}) async {
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
        ApiConstants.collectionsEndpoint,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      
      if (response.data != null) {
        final data = _extractListData(response.data);
        
        if (data.isNotEmpty) {
          final collections = data
              .map((json) => CollectionModel.fromJson(json as Map<String, dynamic>))
              .toList();
          state = AsyncValue.data(collections);
        } else {
          state = const AsyncValue.data([]);
        }
      } else {
        state = const AsyncValue.data([]);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> recordPayment({
    required String collectionId,
    required double paidAmount,
    String? officerId,
  }) async {
    try {
      await api.patch('${ApiConstants.collectionsEndpoint}/$collectionId/pay', data: {
        'paidAmount': paidAmount,
        'officerId': officerId,
      });
      await fetchCollections();
      return true;
    } catch (e) {
      return false;
    }
  }
}

final collectionsNotifierProvider =
    StateNotifierProvider<CollectionsNotifier, AsyncValue<List<CollectionModel>>>((ref) {
  final api = ref.read(apiClientProvider);
  return CollectionsNotifier(api);
});
