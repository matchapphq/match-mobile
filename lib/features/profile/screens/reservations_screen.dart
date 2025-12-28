import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Reservations screen (Design 24)
class ReservationsScreen extends StatelessWidget {
  final VoidCallback? onBack;

  const ReservationsScreen({super.key, this.onBack});

  @override
  Widget build(BuildContext context) {
    final reservations = [
      {
        'venue': 'The Kop Bar',
        'date': "Aujourd'hui",
        'details': [
          'Heure du match / table',
          'Nombre de personnes',
          'Conditions\n(arriver avant X min, annulation, etc.)',
        ],
      },
      {
        'venue': 'La fumée',
        'date': '07/12/2025',
        'details': [
          'Heure du match / table',
          'Nombre de personnes',
          'Conditions\n(arriver avant X min, annulation, etc.)',
        ],
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
                'Mes réservations',
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
                      children: [
                        // Header
                        Icon(
                          Icons.calendar_today_outlined,
                          color: AppColors.secondary,
                          size: 32,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Vous avez ${reservations.length} réservations',
                          style: AppTypography.labelLarge.copyWith(
                            color: AppColors.secondary,
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Reservations list
                        ...List.generate(reservations.length, (index) {
                          final reservation = reservations[index];
                          return _ReservationItem(
                            venue: reservation['venue'] as String,
                            date: reservation['date'] as String,
                            details: reservation['details'] as List<String>,
                            onCancel: () {},
                            onContact: () {},
                          );
                        }),
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

class _ReservationItem extends StatelessWidget {
  final String venue;
  final String date;
  final List<String> details;
  final VoidCallback? onCancel;
  final VoidCallback? onContact;

  const _ReservationItem({
    required this.venue,
    required this.date,
    required this.details,
    this.onCancel,
    this.onContact,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.secondary, width: 2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$venue - $date',
            style: AppTypography.labelLarge.copyWith(
              color: AppColors.secondary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          ...List.generate(details.length, (index) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 4,
                    height: 4,
                    margin: const EdgeInsets.only(top: 6),
                    decoration: const BoxDecoration(
                      color: AppColors.textDark,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      details[index],
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textDark,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: MatchButton(
                  text: 'Annuler la réservation',
                  onPressed: onCancel,
                  variant: MatchButtonVariant.primary,
                  size: MatchButtonSize.small,
                  isFullWidth: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: MatchButton(
                  text: 'Contacter le bar',
                  onPressed: onContact,
                  variant: MatchButtonVariant.primary,
                  size: MatchButtonSize.small,
                  isFullWidth: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}


