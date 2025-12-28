import 'package:flutter/material.dart';

/// Match App Color Palette based on designs
/// Purple/Lime green color scheme
class AppColors {
  AppColors._();

  // Primary Colors
  static const Color primary = Color(0xFFB5FF00); // Lime green
  static const Color primaryDark = Color(0xFF9EE000);

  // Secondary Colors
  static const Color secondary = Color(0xFF7B2CBF); // Purple
  static const Color secondaryDark = Color(0xFF5A189A);
  static const Color secondaryLight = Color(0xFF9D4EDD);

  // Background Gradients
  static const Color gradientStart = Color(0xFF1A0533); // Dark purple
  static const Color gradientMiddle = Color(0xFF3C096C); // Mid purple
  static const Color gradientEnd = Color(0xFF7B2CBF); // Light purple

  // Text Colors
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFFB5FF00);
  static const Color textMuted = Color(0xFFAAAAAA);
  static const Color textDark = Color(0xFF1A1A1A);

  // Surface Colors
  static const Color surface = Colors.white;
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  static const Color cardBackground = Colors.white;

  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFF9800);
  static const Color info = Color(0xFF2196F3);

  // Utility Colors
  static const Color divider = Color(0xFFE0E0E0);
  static const Color disabled = Color(0xFFBDBDBD);
  static const Color overlay = Color(0x80000000);

  // Tag Colors
  static const Color tagBackground = Color(0xFFB5FF00);
  static const Color tagText = Color(0xFF5A189A);

  // Gradient definitions
  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [gradientStart, gradientMiddle, gradientEnd],
    stops: [0.0, 0.5, 1.0],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [secondary, secondaryDark],
  );
}
