# Kopi Mas Officer App - Master AI Agent Guidelines

Hello AI Agent!
You are working on the **Kopi Mas Officer** Flutter application. This app is used by field officers for a cooperative/fintech company to manage members, loans, field verifications, and collections.

This document outlines the strict UI/UX paradigms, architectural patterns, and coding standards you must follow.

***

## ⚠️ CRITICAL INSTRUCTION: DIRECTORY-SPECIFIC AGENTS

This project uses a strict, layered Feature-First architecture. **Before you modify, create, or review any code in a specific directory, you MUST read the `AGENTS.md` file located inside that directory.**

* If working inside `lib/core/` ➡️ **READ `lib/core/AGENTS.md`** first.
* If working inside `lib/shared/` ➡️ **READ `lib/shared/AGENTS.md`** first.
* If working inside `lib/features/` ➡️ **READ `lib/features/AGENTS.md`** first.

*Failure to read the specific directory guidelines will result in architectural violations (e.g., circular dependencies or breaking the UI paradigm).*

***

## 1. Tech Stack & Architecture Overview

* **Framework**: Flutter (Dart)
* **State Management**: Riverpod (2.x syntax: `Notifier`, `AsyncNotifier`, `ConsumerWidget`)
* **Routing**: GoRouter (using `StatefulShellRoute` for bottom navigation)
* **Architecture**: Feature-first (Domain-Driven Design inspired)

### Folder Structure

Maintain this strict structure:

```text
lib/
 ├── core/          # Foundation: Theme, Network, Routing, Base UI Components (Agnostic)
 │   └── AGENTS.md
 ├── shared/        # Cross-Feature Domain: Currency formatters, Shared Badges, Enums
 │   └── AGENTS.md
 ├── features/      # Business Logic: Auth, Members, Loans, Collections
 │   └── AGENTS.md
 └── main.dart
```

***

## 2. UI/UX & Design Language (GLOBAL RULES)

This app strictly uses a **Premium Fintech / Modern CRM** aesthetic. **DO NOT** use default Material 3 defaults like heavy purple tints, harsh drop shadows, or blocky un-styled cards.

### Global Design Rules

1. **Surfaces & Cards**:
    * Never use the default Flutter `Card()` widget.
    * Use our custom `KMCard` (from `lib/core/components/`) or build containers with a white background, `24px` border radius, `1px` `Colors.grey.shade200` border, and a hyper-subtle shadow: `BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: Offset(0, 4))`.
2. **Icons & Badges**:
    * Wrap icons in soft, tinted circular or rounded-rectangular containers.
    * Example: `Container(color: Colors.blue.shade50, child: Icon(Icons.person, color: Colors.blue.shade600))`
3. **Typography**:
    * Font family: **Plus Jakarta Sans** (or a clean geometric sans-serif).
    * Headers should be bold (`w800`), with negative letter spacing (`letterSpacing: -0.5`).
    * Subtitles and hints should use `Colors.grey.shade500` or `.shade600` with `w500` or `w600` weight.
4. **Forms**:
    * Use `KMTextField` for inputs.
    * Inputs should have a `12px` to `16px` border radius, `Colors.grey.shade200` border, and a white background. No heavy underline styles.
    * Group form fields inside white segmented cards on a slightly off-white scaffold background (`Colors.grey.shade50` or `Color(0xFFF8FAFC)`).
5. **App Bars**:
    * Always use `scrolledUnderElevation: 0` to prevent ugly shadows when scrolling.
    * Background must match the scaffold surface.

***

## 3. Core Component Library Usage

Always use these shared components from `lib/core/components/` before writing a custom widget from scratch:

* **`KMButton`**: Replaces `FilledButton` and `OutlinedButton`. Handles its own loading state.
* **`KMTextField`**: Replaces `TextFormField`. Pre-styled for the app.
* **`KMCard`**: Replaces `Card`. Has the correct 24px radius and soft 2% shadow.
* **`KMLoading`**: Standardized circular loading spinner with optional text.
* **`KMEmptyState`**: Beautiful empty states with tinted icons and optional actions.

***

## 4. State Management (Riverpod 2.x)

1. **Modern Syntax**: Use `Notifier`, `AsyncNotifier`, and `@riverpod` generator (if applicable). Do not use the legacy `StateNotifier` unless explicitly asked.
2. **Async Data Handling**: Always use `.when()` to handle loading, data, and error states gracefully.

    ```dart
    final dataAsync = ref.watch(myProvider);
    return dataAsync.when(
      data: (data) => _buildData(data),
      loading: () => const KMLoading(),
      error: (e, st) => KMEmptyState(title: 'Error', subtitle: e.toString()),
    );
    ```

***

## 5. Routing (GoRouter)

1. **Shell Routes**: Bottom navigation is handled via `StatefulShellRoute.indexedStack`.
2. **Transitions**: Use the helpers provided in `lib/core/network/router.dart`.
    * Use `_buildSlidePage` for normal detail screens (right-to-left iOS style).
    * Use `_buildModalPage` for creation screens (e.g., Add Member) or Profile pages (bottom-up slide, full-screen dialog).

***

## 6. Code Style & Conventions

* **Separation of Concerns**: Keep UI files clean. Move complex logic, API calls, and heavy data transformations to Riverpod Providers/Notifiers.
* **Private Widgets**: If a widget is only used in one file, make it private (e.g., `class _ProfileHeader extends StatelessWidget`) and place it at the bottom of the file to keep the main `build` method clean and readable.
* **SnackBars**: When showing feedback, use modern floating SnackBars with rounded corners (`16px`), icons, and margins. Avoid the default bottom-attached blocky SnackBars.

By following these rules—and consulting the specific sub-directory `AGENTS.md` files—you will maintain the high-end, professional, and robust nature of the Kopi Mas Officer application.
