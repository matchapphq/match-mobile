import 'package:flutter/material.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Onboarding complete screen (Design 08)
class OnboardingCompleteScreen extends StatelessWidget {
  final VoidCallback onStart;

  const OnboardingCompleteScreen({super.key, required this.onStart});

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

                // Logo
                const MatchLogo(size: 100),

                const SizedBox(height: 48),

                // Title
                Text(
                  "C'est parti !",
                  textAlign: TextAlign.center,
                  style: AppTypography.displayLarge.copyWith(
                    color: AppColors.primary,
                  ),
                ),

                const SizedBox(height: 32),

                // Subtitle
                Text(
                  'Merci ! On te propose maintenant\nles meilleurs spots selon tes goûts',
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
