import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Matches list screen (Designs 16, 18)
class MatchesListScreen extends StatelessWidget {
  final VoidCallback? onGlobeTap;
  final VoidCallback? onProfileTap;
  final Function(String matchId)? onMatchTap;

  const MatchesListScreen({
    super.key,
    this.onGlobeTap,
    this.onProfileTap,
    this.onMatchTap,
  });

  @override
  Widget build(BuildContext context) {
    final matches = [
      {
        'id': '1',
        'title': 'PSG / OM',
        'date': '28 Novembre 2025 - 21h',
        'sport': 'football',
      },
      {
        'id': '2',
        'title': 'RMA / FCB',
        'date': '31 Novembre 2025 - 16h',
        'sport': 'football',
      },
      {
        'id': '3',
        'title': 'Nets / Knicks',
        'date': '1 Décembre 2025 - 01h',
        'sport': 'basketball',
      },
    ];

    return GradientBackground(
      colors: const [Colors.white, Colors.white],
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            children: [
              // App bar
              MatchAppBar(onGlobeTap: onGlobeTap, onProfileTap: onProfileTap),

              const SizedBox(height: 16),

              // Title
              Text(
                'Prochains Matchs',
                style: AppTypography.headlineLarge.copyWith(
                  color: AppColors.textDark,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 24),

              // Filter chips
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    MatchFilterChip(label: 'Sports', isSelected: true),
                    const SizedBox(width: 12),
                    MatchFilterChip(label: 'Date', isSelected: false),
                    const SizedBox(width: 12),
                    MatchFilterChip(label: 'À proximité', isSelected: false),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Matches list
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: matches.length,
                  itemBuilder: (context, index) {
                    final match = matches[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _MatchCard(
                        title: match['title']!,
                        date: match['date']!,
                        sport: match['sport']!,
                        onTap: () => onMatchTap?.call(match['id']!),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}



class _MatchCard extends StatelessWidget {
  final String title;
  final String date;
  final String sport;
  final VoidCallback? onTap;

  const _MatchCard({
    required this.title,
    required this.date,
    required this.sport,
    this.onTap,
  });

  IconData get _sportIcon {
    switch (sport) {
      case 'football':
        return Icons.sports_soccer;
      case 'basketball':
        return Icons.sports_basketball;
      case 'rugby':
        return Icons.sports_rugby;
      case 'tennis':
        return Icons.sports_tennis;
      default:
        return Icons.sports;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MatchCard(
      useGradient: true,
      padding: EdgeInsets.zero,
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Container(
          height: 160,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.secondary.withOpacity(0.8),
                AppColors.secondaryDark,
              ],
            ),
          ),
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              style: AppTypography.headlineMedium.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              date,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textPrimary.withOpacity(0.8),
                              ),
                            ),
                          ],
                        ),
                        GestureDetector(
                          onTap: onTap,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'Voir le match',
                              style: AppTypography.labelSmall.copyWith(
                                color: AppColors.secondary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.2),
                  ),
                  child: Icon(_sportIcon, color: Colors.white, size: 18),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
