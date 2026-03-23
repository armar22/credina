class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'http://localhost:3001';
  
  // Auth
  static const String loginEndpoint = '/api/v1/auth/login';
  static const String refreshTokenEndpoint = '/api/v1/auth/refresh';
  
  // Core
  static const String membersEndpoint = '/api/v1/members';
  static const String regionsEndpoint = '/api/v1/regions';
  static const String branchesEndpoint = '/api/v1/branches';
  
  // Loans
  static const String loanApplicationsEndpoint = '/api/v1/loan-applications';
  static const String loanProductsEndpoint = '/api/v1/loan-products';
  static const String disbursementsEndpoint = '/api/v1/disbursements';
  
  // Collections
  static const String installmentsEndpoint = '/api/v1/installments';
  static const String collectionsEndpoint = '/api/v1/collections';
  
  // Verifications
  static const String verificationsEndpoint = '/api/v1/field-verifications';
  
  // Dashboard & Reports
  static const String dashboardEndpoint = '/api/v1/dashboard';
  static const String reportsEndpoint = '/api/v1/reports';
  
  // User
  static const String usersEndpoint = '/api/v1/users';
  static const String profileEndpoint = '/api/v1/users/profile';
  
  // Notifications
  static const String notificationsEndpoint = '/api/v1/notifications';

  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}

class StorageKeys {
  StorageKeys._();

  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userData = 'user_data';
  static const String lastSyncTime = 'last_sync_time';
  static const String offlineMode = 'offline_mode';
}

class AppConstants {
  AppConstants._();

  static const String appName = 'Credina';
  static const String appTagline = 'Micro Loan & Financing';
  static const String appVersion = '1.0.0';
  static const int maxOfflineRecords = 1000;
  static const int syncIntervalMinutes = 15;
}