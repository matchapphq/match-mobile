import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

/// Bottom navigation bar for map view (Design 09)
class MapBottomBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const MapBottomBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(40),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _BottomBarItem(
            icon: Icons.format_list_bulleted,
            isSelected: currentIndex == 0,
            onTap: () => onTap(0),
          ),
          _BottomBarItem(
            icon: Icons.search,
            isSelected: currentIndex == 1,
            onTap: () => onTap(1),
          ),
          _BottomBarItem(
            icon: Icons.tune,
            isSelected: currentIndex == 2,
            onTap: () => onTap(2),
          ),
        ],
      ),
    );
  }
}

class _BottomBarItem extends StatelessWidget {
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _BottomBarItem({
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        child: Icon(
          icon,
          size: 28,
          color: isSelected
              ? AppColors.secondary
              : AppColors.secondary.withOpacity(0.5),
        ),
      ),
    );
  }
}
