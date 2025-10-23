import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class SearchBarWidget extends StatelessWidget {
  final TextEditingController? controller;
  final String hintText;
  final String buttonText;
  final Function()? onSearchPressed;
  final Function(String)? onChanged;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;

  const SearchBarWidget({
    Key? key,
    this.controller,
    this.hintText = 'Search...',
    this.buttonText = 'SEARCH',
    this.onSearchPressed,
    this.onChanged,
    this.borderRadius = 25.0,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Search Bar
        Container(
          padding: padding ?? const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(borderRadius),
            boxShadow: [
              BoxShadow(
                color: AppColors.black.withOpacity(0.1),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextField(
            controller: controller,
            onChanged: onChanged,
            decoration: InputDecoration(
              icon: const Icon(Icons.search, color: AppColors.primary),
              hintText: hintText,
              hintStyle: TextStyle(color: Colors.grey[500]),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        
        if (buttonText.isNotEmpty) ...[  
          const SizedBox(height: 10),
          // Action Button
          ElevatedButton(
            onPressed: onSearchPressed ?? () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(borderRadius),
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 32,
                vertical: 12,
              ),
              elevation: 2,
            ),
            child: Text(
              buttonText,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
