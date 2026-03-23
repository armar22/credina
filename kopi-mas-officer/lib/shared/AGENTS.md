# Shared Layer Guidelines - Kopi Mas Officer App

Hello AI Agent!
You are currently working inside the `lib/shared` directory of the Kopi Mas Officer application.

This directory is the home for **Cross-Feature Domain Components and Utilities**. Unlike `lib/core` (which is completely ignorant of the app's business logic), `lib/shared` knows about the business domain (e.g., Members, Loans, Currency) but contains items that must be shared across *multiple* features.

When writing or refactoring code in this directory, you must strictly adhere to the following architectural and design rules.

***

## 1. Scope & Boundaries (Core vs. Shared vs. Features)

To prevent spaghetti code and circular dependencies, follow this strict dependency graph:

* **`shared` CAN import** from `lib/core` (e.g., `KMButton`, `AppTheme`).
* **`shared` CANNOT import** from `lib/features`. (If you import a feature into shared, and that feature imports shared, you create a circular dependency).
* **`features` CAN import** from `lib/shared`.

**What belongs here?**

* `MemberStatusBadge` (Used in both the Members feature and Loans feature).
* Currency formatting utilities (`Rp 1.000.000`).
* Global domain Enums (`LoanStatus`, `VerificationState`).
* Shared pagination models or base response classes.

***

## 2. Shared Widgets (`lib/shared/widgets/`)

When building business-specific UI components used across multiple screens, maintain the **Premium Fintech / Modern CRM** aesthetic.

* **Semantic Badges:**
    Fintech apps require clear status indicators. Use soft backgrounds with bold, tinted text.
  * *Success/Active:* `color: Colors.green.shade700`, `bg: Colors.green.shade50`
  * *Pending/Warning:* `color: Colors.amber.shade800`, `bg: Colors.amber.shade50`
  * *Error/Overdue:* `color: Colors.red.shade700`, `bg: Colors.red.shade50`
  * *Typography:* `fontSize: 11`, `fontWeight: FontWeight.w800`, `letterSpacing: 0.5`.
* **Domain Specific Tiles:**
    If creating a `SharedMemberListTile`, wrap the avatar in a tinted circular container (e.g., `colorScheme.primary.withOpacity(0.1)`) and use the custom `KMCard` from the core layer as the base.
* **Consistency:** Never revert to default Material 3 elevations or blocky components. Keep border radii soft (`16px` to `24px`) and borders clean (`Colors.grey.shade200`).

***

## 3. Utilities & Formatters (`lib/shared/utils/`)

Because this is a financial and management application, data formatting must be flawless and standardized.

* **Currency Formatters:** Always use `intl` to format Indonesian Rupiah.
  * Format: `Rp 5.000.000` (Locale: `id_ID`, zero decimal digits).
* **Date Formatters:** Standardize dates to be human-readable.
  * *Example:* `12 Oct 2023` or `12 October 2023, 14:30`.
* **Validators:** Place shared form validators here (e.g., `NIKValidator` ensuring 16 digits, `PhoneValidator` ensuring correct Indonesian prefixes).

***

## 4. Shared Models & Constants (`lib/shared/models/` & `lib/shared/constants/`)

* **Enums:** If an Enum is used by multiple features (like `PaymentMethod` or `UserRole`), put it here.
* **Constants:** Shared business constants go here. Do *not* put UI constants (like padding sizes or colors) here; those belong in `lib/core/theme/`. Put things like `maxLoanAmount`, `defaultInterestRate`, or `apiEndpoints` here.

***

## 5. State Management (Riverpod)

* **Shared Providers:** If you create a provider here (e.g., a globally accessible `currencyConfigProvider` or a `sharedAppConfigProvider`), ensure it does not hold state specific to a single feature.
* Use Riverpod 2.x syntax (`@riverpod` or explicitly typed `Notifier`/`Provider`).

By following these rules, you will ensure the `shared` layer successfully acts as a clean, reusable bridge between the foundational `core` and the highly specific `features`, without compromising the app's premium aesthetic or architecture.
