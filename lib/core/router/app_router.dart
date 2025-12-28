import 'package:go_router/go_router.dart';

import '../../features/onboarding/onboarding.dart';
import '../../features/map/map.dart';
import '../../features/venues/venues.dart';
import '../../features/matches/matches.dart';
import '../../features/profile/profile.dart';

/// App route paths
class AppRoutes {
  static const String splash = '/';
  static const String welcome = '/welcome';
  static const String onboardingSports = '/onboarding/sports';
  static const String onboardingAmbiance = '/onboarding/ambiance';
  static const String onboardingVenueType = '/onboarding/venue-type';
  static const String onboardingBudget = '/onboarding/budget';
  static const String onboardingComplete = '/onboarding/complete';
  static const String home = '/home';
  static const String matches = '/matches';
  static const String matchDetail = '/matches/:id';
  static const String venue = '/venue/:id';
  static const String profile = '/profile';
  static const String reservations = '/profile/reservations';
  static const String notifications = '/profile/notifications';
  static const String reviews = '/profile/reviews';
}

/// App router configuration
class AppRouter {
  // Track if onboarding is complete
  static bool _onboardingComplete = false;

  // User preferences collected during onboarding
  static List<String> selectedSports = [];
  static List<String> selectedAmbiances = [];
  static List<String> selectedVenueTypes = [];
  static String selectedBudget = '';

  static void completeOnboarding() {
    _onboardingComplete = true;
  }

  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.splash,
    routes: [
      // Splash
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => SplashScreen(
          onComplete: () {
            if (_onboardingComplete) {
              context.go(AppRoutes.home);
            } else {
              context.go(AppRoutes.welcome);
            }
          },
        ),
      ),

      // Welcome
      GoRoute(
        path: AppRoutes.welcome,
        builder: (context, state) => WelcomeScreen(
          onStart: () => context.go(AppRoutes.onboardingSports),
        ),
      ),

      // Onboarding - Sports
      GoRoute(
        path: AppRoutes.onboardingSports,
        builder: (context, state) => SportsPreferenceScreen(
          onContinue: () => context.go(AppRoutes.onboardingAmbiance),
          onSportsSelected: (sports) => selectedSports = sports,
        ),
      ),

      // Onboarding - Ambiance
      GoRoute(
        path: AppRoutes.onboardingAmbiance,
        builder: (context, state) => AmbiancePreferenceScreen(
          onContinue: () => context.go(AppRoutes.onboardingVenueType),
          onAmbianceSelected: (ambiances) => selectedAmbiances = ambiances,
        ),
      ),

      // Onboarding - Venue Type
      GoRoute(
        path: AppRoutes.onboardingVenueType,
        builder: (context, state) => VenueTypePreferenceScreen(
          onContinue: () => context.go(AppRoutes.onboardingBudget),
          onVenueTypesSelected: (types) => selectedVenueTypes = types,
        ),
      ),

      // Onboarding - Budget
      GoRoute(
        path: AppRoutes.onboardingBudget,
        builder: (context, state) => BudgetPreferenceScreen(
          onContinue: () => context.go(AppRoutes.onboardingComplete),
          onBudgetSelected: (budget) => selectedBudget = budget,
        ),
      ),

      // Onboarding Complete
      GoRoute(
        path: AppRoutes.onboardingComplete,
        builder: (context, state) => OnboardingCompleteScreen(
          onStart: () {
            completeOnboarding();
            context.go(AppRoutes.home);
          },
        ),
      ),

      // Home (Map)
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => MapScreen(
          onProfileTap: () => context.push(AppRoutes.profile),
          onGlobeTap: () => context.push(AppRoutes.matches),
        ),
      ),

      // Matches List
      GoRoute(
        path: AppRoutes.matches,
        builder: (context, state) => MatchesListScreen(
          onGlobeTap: () => context.pop(),
          onProfileTap: () => context.push(AppRoutes.profile),
          onMatchTap: (matchId) => context.push('/matches/$matchId'),
        ),
      ),

      // Match Detail
      GoRoute(
        path: AppRoutes.matchDetail,
        builder: (context, state) {
          final matchId = state.pathParameters['id'] ?? '';
          return MatchDetailScreen(
            matchId: matchId,
            onBack: () => context.pop(),
            onVenueTap: (venueId) => context.push('/venue/$venueId'),
          );
        },
      ),

      // Venue Detail
      GoRoute(
        path: AppRoutes.venue,
        builder: (context, state) {
          final venueId = state.pathParameters['id'] ?? '';
          return VenueDetailScreen(
            venueId: venueId,
            onBack: () => context.pop(),
            onReserve: () {
              // TODO: Handle reservation
            },
          );
        },
      ),

      // Profile
      GoRoute(
        path: AppRoutes.profile,
        builder: (context, state) => ProfileScreen(
          onGlobeTap: () => context.pop(),
          onReservationsTap: () => context.push(AppRoutes.reservations),
          onNotificationsTap: () => context.push(AppRoutes.notifications),
          onReviewsTap: () => context.push(AppRoutes.reviews),
          onFavoritesTap: () {},
          onInfoTap: () {},
          onPreferencesTap: () {},
          onLogout: () => context.go(AppRoutes.welcome),
        ),
      ),

      // Reservations
      GoRoute(
        path: AppRoutes.reservations,
        builder: (context, state) =>
            ReservationsScreen(onBack: () => context.pop()),
      ),

      // Notifications
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) =>
            NotificationsScreen(onBack: () => context.pop()),
      ),

      // Reviews
      GoRoute(
        path: AppRoutes.reviews,
        builder: (context, state) => ReviewsScreen(onBack: () => context.pop()),
      ),
    ],
  );
}
