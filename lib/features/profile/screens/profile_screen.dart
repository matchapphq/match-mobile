import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Profile screen (Design 23)
class ProfileScreen extends StatelessWidget {
  final VoidCallback? onGlobeTap;
  final VoidCallback? onReservationsTap;
  final VoidCallback? onNotificationsTap;
  final VoidCallback? onReviewsTap;
  final VoidCallback? onFavoritesTap;
  final VoidCallback? onInfoTap;
  final VoidCallback? onPreferencesTap;
  final VoidCallback? onLogout;

  const ProfileScreen({
    super.key,
    this.onGlobeTap,
    this.onReservationsTap,
    this.onNotificationsTap,
    this.onReviewsTap,
    this.onFavoritesTap,
    this.onInfoTap,
    this.onPreferencesTap,
    this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return GradientBackground(
      colors: const [Colors.white, Colors.white],
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            children: [
              // App bar
              MatchAppBar(onGlobeTap: onGlobeTap, onProfileTap: () {}),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      const SizedBox(height: 16),

                      // Greeting
                      Text(
                        'Bonjour _______',
                        style: AppTypography.headlineLarge.copyWith(
                          color: AppColors.textDark,
                          fontWeight: FontWeight.w800,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Avatar
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppColors.primary,
                            width: 3,
                          ),
                        ),
                        child: ClipOval(
                          child: Container(
                            color: Colors.grey[200],
                            child: const Icon(
                              Icons.person,
                              size: 50,
                              color: Colors.grey,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Social Sport Level
                      Text(
                        'Niveau Social Sport',
                        style: AppTypography.labelLarge.copyWith(
                          color: AppColors.textDark,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 32),

                      // Menu items
                      _MenuItem(
                        icon: Icons.emoji_events_outlined,
                        label: 'Mon niveau',
                        onTap: () {},
                      ),
                      _MenuItem(
                        icon: Icons.calendar_today_outlined,
                        label: 'Mes réservations',
                        onTap: onReservationsTap,
                      ),
                      _MenuItem(
                        icon: Icons.notifications_outlined,
                        label: 'Notifications',
                        onTap: onNotificationsTap,
                      ),
                      _MenuItem(
                        icon: Icons.flag_outlined,
                        label: 'Mes avis',
                        onTap: onReviewsTap,
                      ),
                      _MenuItem(
                        icon: Icons.favorite_outline,
                        label: 'Coups de coeur',
                        onTap: onFavoritesTap,
                      ),
                      _MenuItem(
                        icon: Icons.info_outline,
                        label: 'Mes infos',
                        onTap: onInfoTap,
                      ),
                      _MenuItem(
                        icon: Icons.settings_outlined,
                        label: 'Préférences sportives',
                        onTap: onPreferencesTap,
                      ),

                      const SizedBox(height: 24),

                      // Logout button
                      MatchButton(
                        text: 'Déconnexion',
                        onPressed: onLogout,
                        variant: MatchButtonVariant.secondary,
                        size: MatchButtonSize.medium,
                      ),

                      const SizedBox(height: 24),

                      // Propose a venue link
                      GestureDetector(
                        onTap: () {},
                        child: Column(
                          children: [
                            const Icon(
                              Icons.open_in_new,
                              color: AppColors.textMuted,
                              size: 20,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Proposer un lieu\nsur Match',
                              textAlign: TextAlign.center,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const _MenuItem({required this.icon, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: AppColors.secondary, size: 24),
            const SizedBox(width: 16),
            Text(
              label,
              style: AppTypography.bodyLarge.copyWith(
                color: AppColors.secondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
