import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Gradient background widget used throughout the app
class GradientBackground extends StatelessWidget {
  final Widget child;
  final List<Color>? colors;
  final AlignmentGeometry begin;
  final AlignmentGeometry end;

  const GradientBackground({
    super.key,
    required this.child,
    this.colors,
    this.begin = Alignment.topCenter,
    this.end = Alignment.bottomCenter,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: begin,
          end: end,
          colors:
              colors ??
              [
                AppColors.gradientStart,
                AppColors.gradientMiddle,
                AppColors.gradientEnd,
              ],
          stops: colors != null ? null : const [0.0, 0.5, 1.0],
        ),
      ),
      child: child,
    );
  }
}
