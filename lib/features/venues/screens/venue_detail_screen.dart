import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Venue detail screen (Design 20)
class VenueDetailScreen extends StatelessWidget {
  final String venueId;
  final VoidCallback? onBack;
  final VoidCallback? onReserve;

  const VenueDetailScreen({
    super.key,
    required this.venueId,
    this.onBack,
    this.onReserve,
  });

  @override
  Widget build(BuildContext context) {
    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            children: [
              // App bar
              MatchAppBar(onGlobeTap: onBack, onProfileTap: () {}),

              const SizedBox(height: 16),

              // Title
              Text(
                'Le lieu',
                style: AppTypography.headlineLarge.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),

              const SizedBox(height: 24),

              // Content card
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: MatchWhiteCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'THE KOP BAR',
                                    style: AppTypography.headlineMedium
                                        .copyWith(
                                          color: AppColors.secondary,
                                          fontWeight: FontWeight.w800,
                                        ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Bar - 123 Bd Ney, 75018 Paris',
                                    style: AppTypography.bodySmall.copyWith(
                                      color: AppColors.textDark.withOpacity(
                                        0.7,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '0.9 Km',
                                style: AppTypography.labelMedium.copyWith(
                                  color: AppColors.secondary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Image & actions
                        Row(
                          children: [
                            // Image
                            Expanded(
                              child: Container(
                                height: 100,
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.image,
                                    color: Colors.grey,
                                    size: 40,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Action buttons
                            Column(
                              children: [
                                _ActionButton(
                                  icon: Icons.ios_share,
                                  onTap: () {},
                                ),
                                const SizedBox(height: 8),
                                _ActionButton(icon: Icons.link, onTap: () {}),
                                const SizedBox(height: 8),
                                _ActionButton(
                                  icon: Icons.favorite_border,
                                  onTap: () {},
                                ),
                              ],
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Tags
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            MatchChip(label: 'Foot', isSmall: false),
                            MatchChip(label: '5-10€', isSmall: false),
                            MatchChip(label: 'Conviviale', isSmall: false),
                            MatchChip(label: 'Bière', isSmall: false),
                            MatchChip(label: '+4,5', icon: Icons.star, isSmall: false),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // Recommendations Match
                        _InfoSection(
                          title: 'Recommandations Match',
                          content: 'Dans ton budget habituel',
                        ),

                        const SizedBox(height: 16),

                        // Matchs diffusés ici
                        _InfoSection(
                          title: 'Matchs diffusés ici',
                          content: 'PSG / OM - 21h\nReal Madrid / Barça - 16h',
                        ),

                        const SizedBox(height: 16),

                        // Informations Pratiques
                        Row(
                          children: [
                            Expanded(
                              child: _InfoSection(
                                title: 'Informations Pratiques',
                                content:
                                    'Horraires : 11h / 01h\nMétro à proximité',
                              ),
                            ),
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: AppColors.secondary,
                                  width: 2,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  '12',
                                  style: AppTypography.labelSmall.copyWith(
                                    color: AppColors.secondary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // Action buttons row
                        Row(
                          children: [
                            Expanded(
                              child: MatchButton(
                                text: 'Voir les avis',
                                onPressed: () {},
                                variant: MatchButtonVariant.outline,
                                size: MatchButtonSize.medium,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: MatchButton(
                                text: 'Voir les matchs',
                                onPressed: () {},
                                variant: MatchButtonVariant.outline,
                                size: MatchButtonSize.medium,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Reserve button
                        Center(
                          child: MatchButton(
                            text: 'Réserver',
                            onPressed: onReserve,
                            size: MatchButtonSize.medium,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Close button
              GestureDetector(
                onTap: onBack,
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.transparent,
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  child: const Icon(Icons.close, color: AppColors.primary),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _ActionButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.primary, width: 2),
        ),
        child: Icon(icon, color: AppColors.primary, size: 18),
      ),
    );
  }
}



class _InfoSection extends StatelessWidget {
  final String title;
  final String content;

  const _InfoSection({required this.title, required this.content});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: AppColors.textDark,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: AppTypography.labelLarge.copyWith(
                color: AppColors.textDark,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Padding(
          padding: const EdgeInsets.only(left: 14),
          child: Text(
            content,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textDark.withOpacity(0.7),
            ),
          ),
        ),
      ],
    );
  }
}
