import 'package:flutter/material.dart';
import 'package:match_mobile/constants/app_colors.dart';

class ActionIcon extends StatelessWidget {
  final IconData icon;
  final double size;
  final Color color;

  const ActionIcon({
    super.key,
    required this.icon,
    this.size = 28,
    this.color = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Icon(icon, color: color, size: size),
    );
  }
}
