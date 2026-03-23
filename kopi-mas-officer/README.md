# Kopi Mas Officer App (Flutter Version)

Mobile application for Kopi Mas field officers to manage members, loans, and verifications.

## Tech Stack

- **Framework:** Flutter (Stable)
- **Language:** Dart
- **UI Library:** Material Design 3
- **State Management:** Flutter Riverpod
- **Networking:** Dio
- **Navigation:** GoRouter
- **Offline Database:** Drift (SQLite)

## Project Structure

```
lib/
├── core/
│   ├── constants/      # API endpoints, storage keys
│   ├── database/       # Drift SQLite database
│   ├── network/        # Dio client, GoRouter
│   └── theme/         # Material 3 theme
├── features/
│   ├── auth/           # Login, dashboard
│   ├── members/        # Member management
│   ├── loans/          # Loan management
│   └── verification/   # Photo capture, GPS verification
├── shared/
│   ├── models/         # Domain models (Freezed)
│   └── widgets/        # Reusable UI components
└── main.dart           # App entry point
```

## Features

- **Authentication:** Login with JWT tokens, secure storage
- **Member Management:** Create, view, search members with offline support
- **Loan Management:** View loan applications and status
- **Verification:** Camera capture for residence/business verification with GPS location
- **Offline Support:** Local SQLite database for offline data sync

## Getting Started

### Prerequisites

- Flutter SDK 3.4.0+
- Dart SDK 3.4.0+

### Installation

```bash
# Install dependencies
flutter pub get

# Generate code (Freezed, Drift, Riverpod)
dart run build_runner build

# Run the app
flutter run
```

### Build APK

```bash
flutter build apk --debug
flutter build apk --release
```

## Dependencies

- `flutter_riverpod: ^2.5.1` - State management
- `go_router: ^14.2.0` - Navigation
- `dio: ^5.4.3` - HTTP client
- `drift: ^2.16.0` - SQLite database
- `image_picker: ^1.1.2` - Camera/gallery
- `geolocator: ^12.0.0` - GPS location
- `flutter_secure_storage: ^9.0.0` - Secure storage
- `freezed_annotation: ^2.4.1` - Immutable models

## API Configuration

Update the base URL in `lib/core/constants/app_constants.dart`:

```dart
static const String baseUrl = 'https://api.kopimas.id/v1';
```

## Permissions

The app requires the following permissions:
- Internet
- Camera
- Location (Fine & Coarse)
- Storage

Configured in `android/app/src/main/AndroidManifest.xml`.

## Generated Files

After running `build_runner`, the following files will be generated:
- `*.freezed.dart` - Immutable model classes
- `*.g.dart` - JSON serialization
- `app_database.g.dart` - Drift database code

## License

Proprietary - Kopi Mas
