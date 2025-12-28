import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Reviews screen (Design 28)
class ReviewsScreen extends StatelessWidget {
  final VoidCallback? onBack;

  const ReviewsScreen({super.key, this.onBack});

  @override
  Widget build(BuildContext context) {
    final reviews = [
      {'venue': 'The Kop Bar', 'rating': 5},
      {'venue': 'La fumée', 'rating': 4},
      {'venue': 'Le télégraphe', 'rating': 4.5},
    ];

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
                'Mes avis',
                style: AppTypography.headlineLarge.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 24),

              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: MatchWhiteCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Icon
                        Center(
                          child: Icon(
                            Icons.flag_outlined,
                            color: AppColors.secondary,
                            size: 32,
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Section: Reviewed venues
                        Row(
                          children: [
                            Container(
                              width: 4,
                              height: 4,
                              decoration: const BoxDecoration(
                                color: AppColors.textDark,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Liste des lieux vus',
                              style: AppTypography.labelLarge.copyWith(
                                color: AppColors.textDark,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 4),

                        Padding(
                          padding: const EdgeInsets.only(left: 12),
                          child: Text(
                            'Vous avez noté ces lieux',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textDark.withOpacity(0.6),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Review list
                        ...List.generate(reviews.length, (index) {
                          final review = reviews[index];
                          return _ReviewItem(
                            venue: review['venue'] as String,
                            rating: (review['rating'] as num).toDouble(),
                          );
                        }),

                        const SizedBox(height: 24),

                        // Section: Status
                        Row(
                          children: [
                            Container(
                              width: 4,
                              height: 4,
                              decoration: const BoxDecoration(
                                color: AppColors.textDark,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Statut',
                              style: AppTypography.labelLarge.copyWith(
                                color: AppColors.textDark,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Status buttons
                        Row(
                          children: [
                            MatchFilterChip(
                              label: 'Avis publiés',
                              isSelected: true,
                            ),
                            const SizedBox(width: 12),
                            MatchFilterChip(
                              label: 'À rédiger',
                              isSelected: false,
                            ),
                          ],
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

class _ReviewItem extends StatelessWidget {
  final String venue;
  final double rating;

  const _ReviewItem({required this.venue, required this.rating});

  @override
  Widget build(BuildContext context) {
    return MatchCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: 20,
      useGradient: false, // Use solid color as per design
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '$venue -',
            style: AppTypography.labelMedium.copyWith(
              color: AppColors.secondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          Row(
            children: List.generate(5, (index) {
              final isFilled = index < rating.floor();
              final isHalf = index == rating.floor() && rating % 1 != 0;
              return Icon(
                isHalf
                    ? Icons.star_half
                    : (isFilled ? Icons.star : Icons.star_border),
                color: AppColors.secondary,
                size: 18,
              );
            }),
          ),
        ],
      ),
    );
  }
}


