import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/database/app_database.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';
import 'package:kopi_mas_officer/features/members/models/member_model.dart';

final membersListProvider = FutureProvider<List<MemberModel>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final db = ref.watch(databaseProvider);

  try {
    final response = await apiClient.get(ApiConstants.membersEndpoint);
    final List<dynamic> data = response.data['data'] ?? [];
    
    final members = data.map((json) => MemberModel.fromJson(json)).toList();
    
    for (final member in members) {
      await db.insertMember(MemberData.fromModel(member, synced: true));
    }
    
    return members;
  } catch (e) {
    final localMembers = await db.getAllMembers();
    return localMembers.map((m) => m.toModel()).toList();
  }
});

final memberDetailProvider = FutureProvider.family<MemberModel?, String>((ref, id) async {
  final apiClient = ref.watch(apiClientProvider);
  final db = ref.watch(databaseProvider);

  try {
    final response = await apiClient.get('${ApiConstants.membersEndpoint}/$id');
    return MemberModel.fromJson(response.data['data']);
  } catch (e) {
    final localMember = await db.getMemberById(id);
    return localMember?.toModel();
  }
});

class MembersNotifier extends StateNotifier<AsyncValue<List<MemberModel>>> {
  final ApiClient _apiClient;
  final AppDatabase _db;

  MembersNotifier(this._apiClient, this._db) : super(const AsyncValue.loading()) {
    loadMembers();
  }

  Future<void> loadMembers() async {
    state = const AsyncValue.loading();
    try {
      final response = await _apiClient.get(ApiConstants.membersEndpoint);
      final List<dynamic> data = response.data['data'] ?? [];
      final members = data.map((json) => MemberModel.fromJson(json)).toList();
      
      for (final member in members) {
        await _db.insertMember(MemberData.fromModel(member, synced: true));
      }
      
      state = AsyncValue.data(members);
    } catch (e, st) {
      final localMembers = await _db.getAllMembers();
      if (localMembers.isNotEmpty) {
        state = AsyncValue.data(localMembers.map((m) => m.toModel()).toList());
      } else {
        state = AsyncValue.error(e, st);
      }
    }
  }

  Future<bool> createMember(MemberModel member) async {
    try {
      await _apiClient.post(ApiConstants.membersEndpoint, data: member.toJson());
      await loadMembers();
      return true;
    } catch (e) {
      await _db.insertMember(MemberData.fromModel(member, synced: false));
      await loadMembers();
      return true;
    }
  }

  Future<bool> updateMember(MemberModel member) async {
    try {
      await _apiClient.put('${ApiConstants.membersEndpoint}/${member.id}', data: member.toJson());
      await loadMembers();
      return true;
    } catch (e) {
      await _db.updateMember(MemberData.fromModel(member, synced: false));
      await loadMembers();
      return true;
    }
  }
}

final membersNotifierProvider = StateNotifierProvider<MembersNotifier, AsyncValue<List<MemberModel>>>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final db = ref.watch(databaseProvider);
  return MembersNotifier(apiClient, db);
});
