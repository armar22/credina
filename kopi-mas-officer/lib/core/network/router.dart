import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Core & Auth
import 'package:kopi_mas_officer/shared/main_scaffold.dart';
import 'package:kopi_mas_officer/features/auth/providers/auth_provider.dart';
import 'package:kopi_mas_officer/features/auth/presentation/login_screen.dart';
import 'package:kopi_mas_officer/features/dashboard/presentation/home_screen.dart';

// Members
import 'package:kopi_mas_officer/features/members/presentation/member_list_screen.dart';
import 'package:kopi_mas_officer/features/members/presentation/member_create_screen.dart';
import 'package:kopi_mas_officer/features/members/presentation/member_detail_screen.dart';

// Loans
import 'package:kopi_mas_officer/features/loans/presentation/loan_list_screen.dart';
import 'package:kopi_mas_officer/features/loans/presentation/loan_detail_screen.dart';
import 'package:kopi_mas_officer/features/loans/presentation/loan_create_screen.dart';

// Collections
import 'package:kopi_mas_officer/features/collections/presentation/collections_list_screen.dart';
import 'package:kopi_mas_officer/features/collections/presentation/installments_list_screen.dart';

// Verifications
import 'package:kopi_mas_officer/features/verification/presentation/verification_list_screen.dart';
import 'package:kopi_mas_officer/features/verification/presentation/verification_create_screen.dart';

// Notifications
import 'package:kopi_mas_officer/features/notifications/presentation/notifications_screen.dart';

// Profile
import 'package:kopi_mas_officer/features/profile/presentation/profile_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorHomeKey = GlobalKey<NavigatorState>(debugLabel: 'shellHome');
final _shellNavigatorMembersKey = GlobalKey<NavigatorState>(debugLabel: 'shellMembers');
final _shellNavigatorLoansKey = GlobalKey<NavigatorState>(debugLabel: 'shellLoans');
final _shellNavigatorCollectionsKey = GlobalKey<NavigatorState>(debugLabel: 'shellCollections');
final _shellNavigatorVerificationsKey = GlobalKey<NavigatorState>(debugLabel: 'shellVerifications');

final routerNotifierProvider = ChangeNotifierProvider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;
  RouterNotifier(this._ref) {
    _ref.listen(authProvider, (_, __) => notifyListeners());
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final routerNotifier = ref.read(routerNotifierProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: routerNotifier,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isLoggedIn = authState.isAuthenticated;
      final isLoggingIn = state.uri.toString().startsWith('/login');

      if (!isLoggedIn && !isLoggingIn) return '/login';
      if (isLoggedIn && isLoggingIn) return '/';
      
      return null;
    },
    routes: [
      // ---------------------------------------------------------
      // LOGIN ROUTE (Outside Shell)
      // ---------------------------------------------------------
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // ---------------------------------------------------------
      // BOTTOM NAVIGATION SHELL
      // ---------------------------------------------------------
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainScaffold(navigationShell: navigationShell);
        },
        branches: [
          // BRANCH 1: HOME
          StatefulShellBranch(
            navigatorKey: _shellNavigatorHomeKey,
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),

          // BRANCH 2: MEMBERS
          StatefulShellBranch(
            navigatorKey: _shellNavigatorMembersKey,
            routes: [
              GoRoute(
                path: '/members',
                builder: (context, state) => const MemberListScreen(),
                routes: [
                  GoRoute(
                    path: 'create',
                    parentNavigatorKey: _rootNavigatorKey, 
                    pageBuilder: (context, state) => _buildModalPage(
                      context, state, 
                      const MemberCreateScreen(),
                    ),
                  ),
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) => _buildSlidePage(
                      context, state, 
                      MemberDetailScreen(id: state.pathParameters['id']!),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // BRANCH 3: LOANS
          StatefulShellBranch(
            navigatorKey: _shellNavigatorLoansKey,
            routes: [
              GoRoute(
                path: '/loans',
                builder: (context, state) => const LoanListScreen(),
                routes: [
                  GoRoute(
                    path: 'create',
                    parentNavigatorKey: _rootNavigatorKey,
                    pageBuilder: (context, state) => _buildModalPage(
                      context, state,
                      const LoanApplicationCreateScreen(),
                    ),
                  ),
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) => _buildSlidePage(
                      context, state, 
                      LoanDetailScreen(id: state.pathParameters['id']!),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // BRANCH 4: COLLECTIONS
          StatefulShellBranch(
            navigatorKey: _shellNavigatorCollectionsKey,
            routes: [
              GoRoute(
                path: '/collections',
                builder: (context, state) => const CollectionsListScreen(),
                routes: [
                  GoRoute(
                    path: 'installments',
                    pageBuilder: (context, state) => _buildSlidePage(
                      context, state, 
                      const InstallmentsListScreen(),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // BRANCH 5: VERIFICATIONS
          StatefulShellBranch(
            navigatorKey: _shellNavigatorVerificationsKey,
            routes: [
              GoRoute(
                path: '/verifications',
                builder: (context, state) => const VerificationListScreen(),
                routes: [
                  GoRoute(
                    path: 'create',
                    parentNavigatorKey: _rootNavigatorKey,
                    pageBuilder: (context, state) {
                      final loanId = state.uri.queryParameters['loanId'];
                      return _buildModalPage(
                        context, state,
                        VerificationCreateScreen(loanApplicationId: loanId),
                      );
                    },
                  ),
                  GoRoute(
                    path: 'create/:loanId',
                    parentNavigatorKey: _rootNavigatorKey,
                    pageBuilder: (context, state) => _buildModalPage(
                      context, state,
                      VerificationCreateScreen(loanApplicationId: state.pathParameters['loanId']),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      // ---------------------------------------------------------
      // GLOBAL ROUTES (Outside Bottom Nav)
      // ---------------------------------------------------------
      GoRoute(
        path: '/profile',
        parentNavigatorKey: _rootNavigatorKey,
        pageBuilder: (context, state) => _buildModalPage(
          context, state, 
          const ProfileScreen(),
        ),
      ),
      GoRoute(
        path: '/notifications',
        parentNavigatorKey: _rootNavigatorKey,
        pageBuilder: (context, state) => _buildSlidePage(
          context, state, 
          const NotificationsScreen(),
        ),
      ),
    ],
  );
});

// =====================================================================
// MODERN PAGE TRANSITION HELPERS
// =====================================================================

CustomTransitionPage _buildSlidePage(BuildContext context, GoRouterState state, Widget child) {
  return CustomTransitionPage(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(1.0, 0.0);
      const end = Offset.zero;
      const curve = Curves.easeInOutQuart;
      var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
      return SlideTransition(position: animation.drive(tween), child: child);
    },
  );
}

CustomTransitionPage _buildModalPage(BuildContext context, GoRouterState state, Widget child) {
  return CustomTransitionPage(
    key: state.pageKey,
    child: child,
    fullscreenDialog: true,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(0.0, 1.0);
      const end = Offset.zero;
      const curve = Curves.easeOutCubic;
      var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
      return SlideTransition(position: animation.drive(tween), child: child);
    },
  );
}