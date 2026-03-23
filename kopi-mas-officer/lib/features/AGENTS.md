# Features Layer Guidelines - Kopi Mas Officer App

Hello AI Agent!
You are currently working inside the `lib/features` directory of the Kopi Mas Officer application. This directory contains the actual business logic, screens, and state management for the app.

When generating, refactoring, or reviewing code in this directory, you must strictly adhere to the following rules to ensure the app remains modular, scalable, and visually premium.

***

## 1. Feature-First Architecture

Every domain of the app (e.g., Auth, Members, Loans, Collections) gets its own isolated folder.

**Folder Structure per Feature:**

```text
lib/features/feature_name/
 ├── models/          # Data classes (Freezed/JsonSerializable preferred)
 ├── providers/       # Riverpod Notifiers, AsyncNotifiers, and Providers
 ├── repositories/    # API calls, local storage abstractions
 └── presentation/    # Screens, local widgets, and UI layout
```

* **Rule of Isolation:** Features should rarely import from other features. If `loans` needs member data, it should read it via a shared provider or a core service, not by deeply coupling to `members/presentation`.
* **Always Import Core:** You must utilize the foundational widgets from `lib/core/components/` (e.g., `KMButton`, `KMCard`, `KMTextField`) to build screens.

***

## 2. State Management (Riverpod)

We use Riverpod 2.x for all state management.

1. **Modern Syntax:** Use `@riverpod` code generation or explicitly defined `Notifier`/`AsyncNotifier` classes. Do not use legacy `StateNotifier`.
2. **Async State Handling:**
    * Never manually track `isLoading` or `isError` booleans in your providers if fetching data.
    * Always expose an `AsyncValue<T>` and handle it in the UI using `.when()`.

    ```dart
    // CORRECT UI USAGE:
    final dataAsync = ref.watch(myFeatureProvider);
    return dataAsync.when(
      data: (data) => _buildSuccess(data),
      loading: () => const KMLoading(),
      error: (err, stack) => KMEmptyState(title: 'Error', subtitle: err.toString()),
    );
    ```

3. **Form State:** For forms (like "Create Member" or "Login"), use standard Flutter `TextEditingController`s with a `GlobalKey<FormState>`, but manage the *submission state* (loading, success, failure) via a Riverpod method call that returns a `Future<bool>`.

***

## 3. UI/UX & Presentation Rules (CRITICAL)

This app demands a **Premium Fintech / Modern CRM** aesthetic. You must never default to basic Material 3 styles (no heavy purple tints, blocky cards, or harsh shadows).

### Building Screens

1. **Scaffolds & AppBars:**
    * AppBars must have `scrolledUnderElevation: 0` to prevent ugly drop shadows on scroll.
    * Scaffold backgrounds should be a soft off-white (`Colors.grey.shade50` or `Theme.of(context).colorScheme.surface`).
2. **Cards & Surfaces:**
    * Never use `Card()`. Use `KMCard` from `lib/core/components/`.
    * If building a custom container, it must have:
        * `color: Colors.white`
        * `borderRadius: BorderRadius.circular(24)`
        * `border: Border.all(color: Colors.grey.shade200)`
        * `boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: Offset(0, 4))]`
3. **Typography & Hierarchy:**
    * Headers (`titleLarge`, `headlineMedium`) must be bold (`FontWeight.w800`) with tight letter spacing (`-0.5`).
    * Labels and subtext should use `Colors.grey.shade500` or `.shade600` with `w500` or `w600` weight.
4. **Icons:**
    * Never leave icons bare if they represent a major action or category.
    * Wrap them in a soft, tinted container (e.g., `Container(color: Colors.blue.shade50, child: Icon(Icons.person, color: Colors.blue.shade600))`).
5. **Bottom Action Bars (Sticky Buttons):**
    * For forms or detail screens with main actions, place the `KMButton` inside the Scaffold's `bottomNavigationBar` or `floatingActionButton`.
    * Wrap the button in a white `Container` with a top border (`Colors.grey.shade200`) and a `SafeArea` to ensure it looks like a modern iOS/banking app sticky footer.

***

## 4. Local Widgets

If a screen has complex parts (e.g., a "Profile Header" or a "Segmented Form Card"), **do not** write one massive `build` method.

* Extract them into private stateless widgets (`class _ProfileHeader extends StatelessWidget`) at the bottom of the same file.
* This keeps the main `build` method declarative and easy to read.

***

## 5. Feedback & SnackBars

Never use basic, unstyled SnackBars. If a form fails or succeeds, use a modern floating SnackBar:

```dart
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(
    content: Row(
      children: [
        Icon(isError ? Icons.error_rounded : Icons.check_circle_rounded, color: Colors.white),
        const SizedBox(width: 12),
        Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600))),
      ],
    ),
    backgroundColor: isError ? Theme.of(context).colorScheme.error : Colors.green.shade600,
    behavior: SnackBarBehavior.floating,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    margin: const EdgeInsets.all(20),
  ),
);
```

By adhering to these feature-level guidelines, you ensure that business logic remains clean, state management remains predictable, and the UI remains consistently premium across every screen of the Kopi Mas Officer app.
