import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';

class RegionModel {
  final String id;
  final String regionId;
  final String regionName;
  final String? city;
  final String? province;
  final String? description;
  final bool isActive;

  RegionModel({
    required this.id,
    required this.regionId,
    required this.regionName,
    this.city,
    this.province,
    this.description,
    this.isActive = true,
  });

  factory RegionModel.fromJson(Map<String, dynamic> json) {
    return RegionModel(
      id: json['id'] as String? ?? '',
      regionId: json['region_id'] as String? ?? '',
      regionName: json['region_name'] as String? ?? json['name'] as String? ?? '',
      city: json['city'] as String?,
      province: json['province'] as String?,
      description: json['description'] as String?,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'region_id': regionId,
      'region_name': regionName,
      'city': city,
      'province': province,
      'description': description,
      'is_active': isActive,
    };
  }
}

final regionsListProvider = FutureProvider<List<RegionModel>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get(ApiConstants.regionsEndpoint);
    if (response.data != null) {
      final data = response.data['data'] ?? response.data;
      if (data is List) {
        return data.map((json) => RegionModel.fromJson(json)).toList();
      }
    }
    return [];
  } catch (e) {
    return [];
  }
});

final regionDetailProvider = FutureProvider.family<RegionModel?, String>((ref, id) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('${ApiConstants.regionsEndpoint}/$id');
    if (response.data != null) {
      return RegionModel.fromJson(response.data);
    }
    return null;
  } catch (e) {
    return null;
  }
});

class RegionsNotifier extends StateNotifier<AsyncValue<List<RegionModel>>> {
  final ApiClient _apiClient;

  RegionsNotifier(this._apiClient) : super(const AsyncValue.loading()) {
    fetchRegions();
  }

  Future<void> fetchRegions() async {
    state = const AsyncValue.loading();
    try {
      final response = await _apiClient.get(ApiConstants.regionsEndpoint);
      if (response.data != null) {
        final data = response.data['data'] ?? response.data;
        if (data is List) {
          final regions = data.map((json) => RegionModel.fromJson(json)).toList();
          state = AsyncValue.data(regions);
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

  Future<bool> createRegion(RegionModel region) async {
    try {
      await _apiClient.post(ApiConstants.regionsEndpoint, data: region.toJson());
      await fetchRegions();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateRegion(String regionId, Map<String, dynamic> data) async {
    try {
      await _apiClient.patch('${ApiConstants.regionsEndpoint}/$regionId', data: data);
      await fetchRegions();
      return true;
    } catch (e) {
      return false;
    }
  }
}

final regionsNotifierProvider =
    StateNotifierProvider<RegionsNotifier, AsyncValue<List<RegionModel>>>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return RegionsNotifier(apiClient);
});
