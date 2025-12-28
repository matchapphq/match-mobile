/// App-wide constants
class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Match';
  static const String appTagline =
      'Les meilleurs plans matchs qui vont laisseront sans voix';

  // API
  static const String apiBaseUrl = 'https://api.match.dokploy.app';

  // Storage Keys
  static const String onboardingCompleteKey = 'onboarding_complete';
  static const String userPreferencesKey = 'user_preferences';
  static const String authTokenKey = 'auth_token';

  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 350);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Map Settings
  static const double defaultMapZoom = 14.0;
  static const double defaultLat = 48.8809; // Paris - Gare du Nord
  static const double defaultLng = 2.3553;

  // Pagination
  static const int defaultPageSize = 20;
}
