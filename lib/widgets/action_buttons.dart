import 'package:flutter/material.dart';

class ActionButtons extends StatelessWidget {
  const ActionButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          ActionIcon(icon: Icons.tune),
          ActionIcon(icon: Icons.euro),
          ActionIcon(icon: Icons.memory),
          ActionIcon(icon: Icons.thermostat),
          ActionIcon(icon: Icons.navigation),
        ],
      ),
    );
  }
}

class ActionIcon extends StatelessWidget {
  final IconData icon;
  final double size;
  const ActionIcon({required this.icon, this.size = 28, super.key});

  @override
  Widget build(BuildContext context) {
    return Icon(icon, color: const Color(0xFFB5C100), size: size);
  }
}
