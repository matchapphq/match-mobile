# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**match_mobile** is a Flutter application for the Match project. This is a cross-platform mobile app supporting iOS, Android, web, macOS, Linux, and Windows.

- **Package Name**: `match_mobile`
- **Organization**: `com.matchproject`
- **Flutter Version**: 3.35.6
- **Dart Version**: 3.9.2

## Development Commands

### Setup and Installation
```bash
# Install dependencies
flutter pub get

# Check Flutter installation and connected devices
flutter doctor

# List available devices
flutter devices
```

### Running the App
```bash
# Run on default device (with hot reload enabled)
flutter run

# Run on specific device
flutter run -d <device_id>

# Run on iOS simulator
flutter run -d ios

# Run on Android emulator
flutter run -d android

# Run on Chrome (web)
flutter run -d chrome

# Run on macOS
flutter run -d macos

# Run in release mode
flutter run --release
```

### Testing
```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/widget_test.dart

# Run tests with coverage
flutter test --coverage

# View coverage report (requires lcov)
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

### Code Quality
```bash
# Analyze code for issues
flutter analyze

# Format code
dart format .

# Format specific file
dart format lib/main.dart

# Check formatting without making changes
dart format --output=none --set-exit-if-changed .

# Fix common issues automatically
dart fix --apply
```

### Building
```bash
# Build APK (Android)
flutter build apk

# Build app bundle (Android - for Play Store)
flutter build appbundle

# Build iOS app (requires macOS)
flutter build ios

# Build iOS IPA
flutter build ipa

# Build web app
flutter build web

# Build macOS app
flutter build macos

# Build Windows app
flutter build windows

# Build Linux app
flutter build linux
```

### Dependency Management
```bash
# Add a new package
flutter pub add <package_name>

# Add a dev dependency
flutter pub add --dev <package_name>

# Remove a package
flutter pub remove <package_name>

# Update dependencies
flutter pub upgrade

# Check for outdated packages
flutter pub outdated

# Get dependencies without running codegen
flutter pub get --no-example
```

### Cleaning
```bash
# Clean build artifacts
flutter clean

# Clean and reinstall dependencies
flutter clean && flutter pub get
```

### Device/Emulator Management
```bash
# List emulators
flutter emulators

# Launch a specific emulator
flutter emulators --launch <emulator_id>

# iOS simulator management (macOS only)
open -a Simulator
```

## Architecture Overview

### Project Structure
```
match_mobile/
├── lib/                    # Main source code
│   └── main.dart          # Application entry point
├── test/                  # Unit and widget tests
│   └── widget_test.dart   # Sample widget test
├── android/               # Android-specific code
├── ios/                   # iOS-specific code
├── web/                   # Web-specific code
├── macos/                 # macOS-specific code
├── linux/                 # Linux-specific code
├── windows/               # Windows-specific code
├── pubspec.yaml           # Package dependencies and metadata
├── analysis_options.yaml  # Dart analyzer configuration
└── README.md             # Project documentation
```

### Recommended Code Organization

As the app grows, organize code using feature-based or layered architecture:

```
lib/
├── main.dart              # App entry point
├── app/                   # App-level configuration
│   ├── routes.dart        # Route definitions
│   └── theme.dart         # App theme
├── core/                  # Core utilities, constants, base classes
│   ├── constants/
│   ├── utils/
│   └── extensions/
├── features/              # Feature modules
│   ├── auth/
│   │   ├── data/         # Data layer (repositories, DTOs)
│   │   ├── domain/       # Domain layer (entities, use cases)
│   │   └── presentation/ # UI layer (screens, widgets, state)
│   └── matching/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/                # Shared widgets, models
    ├── widgets/
    └── models/
```

### State Management

Consider using one of these popular state management solutions:
- **Provider** - Simple and recommended by Flutter team
- **Riverpod** - Modern evolution of Provider
- **Bloc/Cubit** - Predictable state management with events
- **GetX** - Lightweight with routing and dependency injection
- **MobX** - Reactive state management

### Navigation

Flutter supports:
- **Navigator 1.0** - Imperative navigation (built-in)
- **Navigator 2.0** - Declarative navigation
- **go_router** - Popular declarative routing package
- **auto_route** - Code generation based routing

### Key Packages to Consider

Common packages for Flutter development:
- **http** or **dio** - HTTP client
- **shared_preferences** - Local key-value storage
- **sqflite** or **hive** - Local database
- **firebase_core** - Firebase integration
- **flutter_riverpod** or **provider** - State management
- **go_router** - Routing
- **freezed** - Code generation for data classes
- **flutter_svg** - SVG support
- **cached_network_image** - Image caching
- **intl** - Internationalization

## Platform-Specific Notes

### iOS Development
- Requires Xcode (macOS only)
- Run `pod install` in `ios/` directory when adding plugins
- Configure signing in `ios/Runner.xcworkspace`
- Code signing identity: `rafael.sapaloesteves@icloud.com (98K3X85Z5J)`

### Android Development
- Configure signing in `android/app/build.gradle`
- Update package name in `android/app/src/main/AndroidManifest.xml`
- Minimum SDK version defined in `android/app/build.gradle`

### Web Development
- Web assets in `web/` directory
- Configure `web/index.html` for PWA support
- Run locally: `flutter run -d chrome`

### macOS Development
- Requires macOS
- Enable entitlements in `macos/Runner/DebugProfile.entitlements`
- Configure App Sandbox capabilities as needed

## Development Workflow

### Hot Reload and Hot Restart
- **Hot Reload** (`r` in terminal): Updates code without losing state
- **Hot Restart** (`R` in terminal): Restarts app, resets state
- **Quit** (`q` in terminal): Stops the running app

### Debugging
```bash
# Run with debug logging
flutter run --verbose

# Open DevTools
flutter pub global activate devtools
flutter pub global run devtools

# Debug specific build issues
flutter run --debug
flutter logs
```

### Performance Profiling
```bash
# Run in profile mode (optimized but still debuggable)
flutter run --profile

# Run in release mode (fully optimized)
flutter run --release
```

## CI/CD Considerations

### GitHub Actions
- Use `flutter-action` for CI/CD
- Cache dependencies with `pub-cache`
- Run tests on multiple platforms
- Build and sign apps for distribution

### Fastlane (iOS/Android)
- Automate screenshots
- Manage certificates and provisioning profiles
- Deploy to App Store/Play Store

## Flutter-Specific Best Practices

### Code Generation
When using packages like `freezed`, `json_serializable`, or `build_runner`:
```bash
# Generate code
flutter pub run build_runner build

# Watch for changes and regenerate
flutter pub run build_runner watch

# Delete conflicting outputs and rebuild
flutter pub run build_runner build --delete-conflicting-outputs
```

### Assets and Images
1. Add assets to `pubspec.yaml` under `flutter: assets:`
2. Reference assets: `Image.asset('assets/images/logo.png')`
3. Use different resolutions: `assets/images/2.0x/logo.png`

### Localization
1. Add `flutter_localizations` dependency
2. Create `.arb` files for translations
3. Generate localization code
4. Configure in MaterialApp

## Environment Variables

For sensitive configuration:
- Use `--dart-define` flag: `flutter run --dart-define=API_KEY=value`
- Access in code: `const String.fromEnvironment('API_KEY')`
- Consider using `flutter_dotenv` package for `.env` file support