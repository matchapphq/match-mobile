import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Match detail screen (Design 19)
class MatchDetailScreen extends StatelessWidget {
  final String matchId;
  final VoidCallback? onBack;
  final Function(String venueId)? onVenueTap;

  const MatchDetailScreen({
    super.key,
    required this.matchId,
    this.onBack,
    this.onVenueTap,
  });

  @override
  Widget build(BuildContext context) {
    final venues = [
      {
        'id': '1',
        'name': 'The Kop Bar',
        'distance': '0,9 km',
        'price': '5-10€',
        'ambiance': 'Conviviale',
        'food': 'Bière',
      },
      {
        'id': '2',
        'name': 'Le Corner Pub',
        'distance': '1,5 km',
        'price': '+20€',
        'ambiance': 'Posée',
        'food': 'Pizza',
      },
      {
        'id': '3',
        'name': 'Le Délice',
        'distance': '1,7 km',
        'price': '+10€',
        'ambiance': 'Posée',
        'food': 'Fast-food',
      },
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
                "L'affiche",
                style: AppTypography.headlineLarge.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),

              const SizedBox(height: 24),

              // Match header card
              MatchCard(
                useGradient: true,
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(20),
                borderRadius: 20,
                child: Column(
                  children: [
                    // Match images placeholder
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.2),
                          ),
                        ),
                        const SizedBox(width: 24),
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.2),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'PSG / OM',
                      style: AppTypography.displaySmall.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Date and venues header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    Text(
                      '21 Novembre 2025 - 21h',
                      style: AppTypography.labelLarge.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Lieux qui diffusent ce match',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textPrimary.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Venues list
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: venues.length,
                  itemBuilder: (context, index) {
                    final venue = venues[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _VenueListItem(
                        name: venue['name']!,
                        distance: venue['distance']!,
                        price: venue['price']!,
                        ambiance: venue['ambiance']!,
                        food: venue['food']!,
                        onTap: () => onVenueTap?.call(venue['id']!),
                      ),
                    );
                  },
                ),
              ),

              // See more button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: MatchButton(
                  text: 'Voir plus',
                  onPressed: () {},
                  variant: MatchButtonVariant.secondary,
                  size: MatchButtonSize.small,
                ),
              ),

              const SizedBox(height: 16),

              // Follow match button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: MatchButton(
                  text: 'Suivre le match',
                  onPressed: () {},
                  size: MatchButtonSize.medium,
                  isFullWidth: true,
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

class _VenueListItem extends StatelessWidget {
  final String name;
  final String distance;
  final String price;
  final String ambiance;
  final String food;
  final VoidCallback? onTap;

  const _VenueListItem({
    required this.name,
    required this.distance,
    required this.price,
    required this.ambiance,
    required this.food,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: MatchWhiteCard(
        padding: const EdgeInsets.all(16),
        borderRadius: 16,
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$name - $distance',
                    style: AppTypography.labelLarge.copyWith(
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      MatchChip(label: price, isSmall: true),
                      MatchChip(label: ambiance, isSmall: true),
                      MatchChip(label: food, isSmall: true),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: const Icon(
                Icons.visibility_outlined,
                color: AppColors.primary,
                size: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}


