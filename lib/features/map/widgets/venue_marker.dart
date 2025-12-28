import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

/// Custom venue marker for map (Design 11)
class VenueMarker extends StatelessWidget {
  final bool isSelected;
  final VoidCallback? onTap;

  const VenueMarker({super.key, this.isSelected = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: isSelected ? 40 : 32,
        height: isSelected ? 48 : 40,
        child: Stack(
          alignment: Alignment.topCenter,
          children: [
            // Pin shape
            CustomPaint(
              size: Size(isSelected ? 40 : 32, isSelected ? 48 : 40),
              painter: _MarkerPainter(
                color: AppColors.primary,
                isSelected: isSelected,
              ),
            ),
            // Inner circle
            Positioned(
              top: isSelected ? 6 : 4,
              child: Container(
                width: isSelected ? 20 : 16,
                height: isSelected ? 20 : 16,
                decoration: BoxDecoration(
                  color: AppColors.secondary,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MarkerPainter extends CustomPainter {
  final Color color;
  final bool isSelected;

  _MarkerPainter({required this.color, required this.isSelected});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();

    // Create pin shape
    final centerX = size.width / 2;
    final radius = size.width / 2;
    final bottomY = size.height;
    final circleY = radius;

    // Draw circle at top
    path.addOval(
      Rect.fromCircle(center: Offset(centerX, circleY), radius: radius),
    );

    // Draw triangle pointing down
    path.moveTo(centerX - radius * 0.6, circleY + radius * 0.4);
    path.lineTo(centerX, bottomY);
    path.lineTo(centerX + radius * 0.6, circleY + radius * 0.4);
    path.close();

    canvas.drawPath(path, paint);

    // Add shadow if selected
    if (isSelected) {
      final shadowPaint = Paint()
        ..color = color.withOpacity(0.3)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
      canvas.drawPath(path, shadowPaint);
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
