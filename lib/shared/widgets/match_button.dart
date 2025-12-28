import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

enum MatchButtonVariant { primary, secondary, outline, text }

enum MatchButtonSize { small, medium, large }

/// Custom button widget following Match design system
class MatchButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final MatchButtonVariant variant;
  final MatchButtonSize size;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final String? emoji;

  const MatchButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = MatchButtonVariant.primary,
    this.size = MatchButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.emoji,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: _getHeight(),
      child: _buildButton(),
    );
  }

  double _getHeight() {
    switch (size) {
      case MatchButtonSize.small:
        return 40;
      case MatchButtonSize.medium:
        return 50;
      case MatchButtonSize.large:
        return 60;
    }
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case MatchButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
      case MatchButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 12);
      case MatchButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 32, vertical: 16);
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case MatchButtonSize.small:
        return AppTypography.buttonSmall;
      case MatchButtonSize.medium:
        return AppTypography.buttonMedium;
      case MatchButtonSize.large:
        return AppTypography.buttonLarge;
    }
  }

  Widget _buildButton() {
    switch (variant) {
      case MatchButtonVariant.primary:
        return _buildPrimaryButton();
      case MatchButtonVariant.secondary:
        return _buildSecondaryButton();
      case MatchButtonVariant.outline:
        return _buildOutlineButton();
      case MatchButtonVariant.text:
        return _buildTextButton();
    }
  }

  Widget _buildPrimaryButton() {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.secondary,
        padding: _getPadding(),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        elevation: 0,
      ),
      child: _buildContent(AppColors.secondary),
    );
  }

  Widget _buildSecondaryButton() {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.secondary,
        foregroundColor: AppColors.primary,
        padding: _getPadding(),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        elevation: 0,
      ),
      child: _buildContent(AppColors.primary),
    );
  }

  Widget _buildOutlineButton() {
    return OutlinedButton(
      onPressed: isLoading ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        padding: _getPadding(),
        side: const BorderSide(color: AppColors.primary, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      ),
      child: _buildContent(AppColors.primary),
    );
  }

  Widget _buildTextButton() {
    return TextButton(
      onPressed: isLoading ? null : onPressed,
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        padding: _getPadding(),
      ),
      child: _buildContent(AppColors.primary),
    );
  }

  Widget _buildContent(Color color) {
    if (isLoading) {
      return SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      );
    }

    final List<Widget> children = [];

    if (emoji != null) {
      children.add(Text(emoji!, style: const TextStyle(fontSize: 18)));
      children.add(const SizedBox(width: 8));
    }

    if (icon != null) {
      children.add(Icon(icon, size: 20));
      children.add(const SizedBox(width: 8));
    }

    children.add(Text(text, style: _getTextStyle().copyWith(color: color)));

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
  }
}
