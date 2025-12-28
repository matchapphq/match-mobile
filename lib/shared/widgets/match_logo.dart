import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Match logo widget (lightning bolt icon)
class MatchLogo extends StatelessWidget {
  final double size;
  final Color? color;

  const MatchLogo({super.key, this.size = 80, this.color});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size * 1.2),
      painter: _LightningBoltPainter(color: color ?? AppColors.primary),
    );
  }
}

class _LightningBoltPainter extends CustomPainter {
  final Color color;

  _LightningBoltPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();

    // Lightning bolt shape
    path.moveTo(size.width * 0.55, 0);
    path.lineTo(size.width * 0.15, size.height * 0.5);
    path.lineTo(size.width * 0.45, size.height * 0.5);
    path.lineTo(size.width * 0.35, size.height);
    path.lineTo(size.width * 0.85, size.height * 0.4);
    path.lineTo(size.width * 0.55, size.height * 0.4);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Match text logo
class MatchTextLogo extends StatelessWidget {
  final double fontSize;
  final Color? color;

  const MatchTextLogo({super.key, this.fontSize = 48, this.color});

  @override
  Widget build(BuildContext context) {
    return Text(
      'MATCH',
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: FontWeight.w900,
        fontStyle: FontStyle.italic,
        color: color ?? AppColors.primary,
        letterSpacing: 2,
      ),
    );
  }
}
