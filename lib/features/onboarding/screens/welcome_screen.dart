import 'package:flutter/material.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Welcome screen (Design 03)
class WelcomeScreen extends StatelessWidget {
  final VoidCallback onStart;

  const WelcomeScreen({super.key, required this.onStart});

  @override
  Widget build(BuildContext context) {
    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              children: [
                const Spacer(flex: 2),

                // Title
                Text(
                  'Bienvenue\nsur Match',
                  textAlign: TextAlign.center,
                  style: AppTypography.displayLarge.copyWith(
                    color: AppColors.primary,
                    height: 1.1,
                  ),
                ),

                const SizedBox(height: 48),

                // Subtitle
                Text(
                  'Trouve en 30 secondes\nles meilleurs spots\npour regarder tes matchs',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyLarge.copyWith(
                    color: AppColors.textPrimary.withOpacity(0.9),
                    fontStyle: FontStyle.italic,
                    height: 1.6,
                  ),
                ),

                const Spacer(flex: 3),

                // CTA Button
                MatchButton(
                  text: 'Commencer',
                  onPressed: onStart,
                  size: MatchButtonSize.large,
                  isFullWidth: true,
                ),

                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
