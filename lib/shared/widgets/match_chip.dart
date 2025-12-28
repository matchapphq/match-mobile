import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Selection chip widget for preferences and filters
class MatchChip extends StatelessWidget {
  final String label;
  final String? emoji;
  final IconData? icon;
  final bool isSelected;
  final VoidCallback? onTap;
  final bool isSmall;

  const MatchChip({
    super.key,
    required this.label,
    this.emoji,
    this.icon,
    this.isSelected = false,
    this.onTap,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          horizontal: isSmall ? 12 : 20,
          vertical: isSmall ? 8 : 12,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : AppColors.primary.withOpacity(0.9),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(
            color: isSelected ? AppColors.primaryDark : Colors.transparent,
            width: 2,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (emoji != null) ...[
              Text(emoji!, style: TextStyle(fontSize: isSmall ? 14 : 18)),
              SizedBox(width: isSmall ? 4 : 8),
            ],
            if (icon != null) ...[
              Icon(icon, size: isSmall ? 16 : 20, color: AppColors.secondary),
              SizedBox(width: isSmall ? 4 : 8),
            ],
            Text(
              label,
              style:
                  (isSmall
                          ? AppTypography.labelMedium
                          : AppTypography.buttonMedium)
                      .copyWith(color: AppColors.secondary),
            ),
          ],
        ),
      ),
    );
  }
}

/// Filter chip for the map filters modal
class MatchFilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback? onTap;

  const MatchFilterChip({
    super.key,
    required this.label,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.secondary,
            width: 1.5,
          ),
        ),
        child: Text(
          label,
          style: AppTypography.labelMedium.copyWith(
            color: isSelected ? AppColors.secondary : AppColors.secondary,
          ),
        ),
      ),
    );
  }
}
