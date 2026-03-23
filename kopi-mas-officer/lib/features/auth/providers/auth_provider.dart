import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kopi_mas_officer/core/constants/app_constants.dart';
import 'package:kopi_mas_officer/core/network/dio_client.dart';
import 'package:kopi_mas_officer/shared/models/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? token;
  final String? refreshToken;
  final UserModel? user;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.token,
    this.refreshToken,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? token,
    String? refreshToken,
    UserModel? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
      refreshToken: refreshToken ?? this.refreshToken,
      user: user ?? this.user,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final SharedPreferences _prefs;
  final Ref _ref;
  bool _initialized = false;

  AuthNotifier(this._apiClient, this._prefs, this._ref) : super(const AuthState()) {
    // Don't call _loadFromStorage here - it will be called separately
  }

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;
    
    final token = _prefs.getString(StorageKeys.accessToken);
    final refreshToken = _prefs.getString(StorageKeys.refreshToken);
    final userData = _prefs.getString(StorageKeys.userData);

    if (token != null && userData != null) {
      _ref.read(authTokenProvider.notifier).state = token;
      state = state.copyWith(
        isAuthenticated: true,
        token: token,
        refreshToken: refreshToken,
      );
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.post(
        ApiConstants.loginEndpoint,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        
        String? token;
        String? refreshToken;
        UserModel? user;
        
        if (data is Map) {
          token = data['accessToken']?.toString() 
              ?? data['access_token']?.toString()
              ?? data['token']?.toString();
          refreshToken = data['refreshToken']?.toString()
              ?? data['refresh_token']?.toString();
          
          final userData = data['user'];
          if (userData is Map) {
            String role = userData['role']?.toString() ?? '';
            if (role == 'system_admin') {
              role = 'ADMIN';
            }
            
            final userId = userData['user_id'] ?? userData['id'] ?? '';
            final mappedUser = {
              'id': userId.toString(),
              'email': userData['email']?.toString() ?? '',
              'name': userData['fullName']?.toString() ?? userData['name']?.toString() ?? 'User',
              'role': role,
            };
            user = UserModel.fromJson(mappedUser);
          }
        }
        
        if (token == null) {
          state = state.copyWith(
            isLoading: false,
            error: 'Invalid response: no token found',
          );
          return false;
        }

        await _prefs.setString(StorageKeys.accessToken, token.toString());
        if (refreshToken != null) {
          await _prefs.setString(StorageKeys.refreshToken, refreshToken.toString());
        }
        if (user != null) {
          await _prefs.setString(StorageKeys.userData, user.toJson().toString());
        }

        // Update the StateProvider with the token
        _ref.read(authTokenProvider.notifier).state = token.toString();

        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          token: token.toString(),
          refreshToken: refreshToken?.toString(),
          user: user,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Login failed: ${response.statusCode}',
        );
        return false;
      }
    } on ApiException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Error: $e',
      );
      return false;
    }
  }

  Future<bool> refreshToken() async {
    try {
      final refreshToken = state.refreshToken;
      if (refreshToken == null) return false;

      final response = await _apiClient.post(
        ApiConstants.refreshTokenEndpoint,
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final newToken = data['access_token'];
        final newRefreshToken = data['refresh_token'];

        await _prefs.setString(StorageKeys.accessToken, newToken);
        if (newRefreshToken != null) {
          await _prefs.setString(StorageKeys.refreshToken, newRefreshToken);
        }

        _ref.read(authTokenProvider.notifier).state = newToken;
        
        state = state.copyWith(
          token: newToken,
          refreshToken: newRefreshToken,
        );
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _prefs.remove(StorageKeys.accessToken);
    await _prefs.remove(StorageKeys.refreshToken);
    await _prefs.remove(StorageKeys.userData);
    
    _ref.read(authTokenProvider.notifier).state = null;
    
    state = const AuthState();
  }
}

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden');
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final prefs = ref.watch(sharedPreferencesProvider);
  return AuthNotifier(apiClient, prefs, ref);
});

// Provider to initialize auth state from storage
final initializeAuthProvider = FutureProvider<void>((ref) async {
  final authNotifier = ref.read(authProvider.notifier);
  await authNotifier.initialize();
});
