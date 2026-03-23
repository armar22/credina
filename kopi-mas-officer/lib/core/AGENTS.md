# Core Layer Guidelines - Kopi Mas Officer App

Hello AI Agent!
You are currently working inside the `lib/core` directory of the Kopi Mas Officer application. This is the **foundational layer** of the app. It contains the global design system, shared UI components, networking, and routing configurations.

When writing or refactoring code in this directory, you must strictly adhere to the following rules to maintain architectural integrity and UI/UX consistency.

***

## 1. The Golden Rule: Feature-Agnosticism (No Circular Dependencies)

* **DO NOT** import anything from `lib/features/` into `lib/core/` (e.g., no `import 'package:kopi_mas_officer/features/members/...'`).
* **Exception:** `lib/core/network/router.dart` is the *only* file allowed to import feature screens, as it must bind the app's routes together.
* The `core` layer exists to serve the features. It must remain completely ignorant of business logic, specific screens, or feature-specific state.

***

## 2. Global UI/UX Components (`lib/core/components/`)

If you are adding or modifying a component here, it must meet our **Premium Fintech / Modern CRM** design standard.

* **Prefixing:** All custom core widgets must be prefixed with `KM` (e.g., `KMButton`, `KMTextField`, `KMCard`).
* **No Default Material Styling:**
  * Never use harsh, default Material elevation shadows.
  * Shadows must be hyper-subtle: `BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: Offset(0, 4))`.
  * Borders should be soft (`Colors.grey.shade200`).
  * Border radii are large and modern (typically `16px` for buttons/inputs, `24px` for cards/surfaces).
* **Reusability:** Components must accept standard Flutter parameters (`VoidCallback? onTap`, `Widget? child`, `bool isLoading`, etc.) to ensure they can be used anywhere in the app without modification.

***

## 3. Theming & Styling (`lib/core/theme/`)

We rely on a strictly defined `AppTheme` using `ColorScheme` and `TextTheme` (Plus Jakarta Sans).

* **No Hardcoded Colors:** Do not hardcode colors like `Colors.blue` or `Colors.red` inside core components.
  * *Correct:* `Theme.of(context).colorScheme.primary`
  * *Correct (for neutral surfaces):* `Colors.grey.shade50`, `Colors.white`, `Colors.grey.shade200`.
* **Typography:** Always rely on `Theme.of(context).textTheme`.
  * For headers: Use `.titleLarge` or `.headlineMedium` with `w800` weight and negative letter spacing (`-0.5`).
  * For subtitles: Use `.bodyMedium` with `Colors.grey.shade600`.

***

## 4. Routing & Navigation (`lib/core/network/router.dart`)

Our app uses `GoRouter` with Riverpod for reactive, auth-guarded routing.

* **Bottom Navigation:** Handled via `StatefulShellRoute.indexedStack`. This preserves the state (scroll position, inputted text) of each tab when the user switches between them.
* **Adding New Routes:**
  * If a route belongs to a bottom tab (e.g., Member Details), nest it under the appropriate `StatefulShellBranch`.
  * If a route should hide the bottom navigation bar (e.g., Profile, Create Member), add `parentNavigatorKey: _rootNavigatorKey` to the route.
* **Transitions:** Always use the custom transition helpers defined at the bottom of `router.dart`:
  * `_buildSlidePage()`: Right-to-left slide (standard for detail screens).
  * `_buildModalPage()`: Bottom-up slide (standard for creation forms or profile settings).
* **Reactivity:** The router rebuilds elegantly on authentication changes using `refreshListenable: routerNotifier`. Do not break this pattern by wrapping the `GoRouter` initialization in a `.watch()` that recreates the entire router instance.

***

## 5. API & Network (If Applicable)

If adding API clients, interceptors, or GraphQL setups to `lib/core/network/`:

* Keep timeout durations standardized.
* Use standard error-handling wrappers that return safe, user-friendly exception messages to the UI layer.
* Pass authentication tokens via secure interceptors, not by manually injecting them into every request.

By following these guidelines, you will ensure the `core` layer remains the robust, beautiful, and scalable foundation the rest of the application relies upon.
