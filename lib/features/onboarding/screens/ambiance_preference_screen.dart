import 'package:flutter/material.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Ambiance preference selection screen (Design 05)
class AmbiancePreferenceScreen extends StatefulWidget {
  final VoidCallback onContinue;
  final Function(List<String>) onAmbianceSelected;

  const AmbiancePreferenceScreen({
    super.key,
    required this.onContinue,
    required this.onAmbianceSelected,
  });

  @override
  State<AmbiancePreferenceScreen> createState() =>
      _AmbiancePreferenceScreenState();
}

class _AmbiancePreferenceScreenState extends State<AmbiancePreferenceScreen> {
  final Set<String> _selectedAmbiances = {};

  final List<Map<String, String>> _ambiances = [
    {'id': 'posee', 'label': 'Posée', 'emoji': '😌'},
    {'id': 'ultra', 'label': 'Ultra / Ambiance chaude', 'emoji': '🔥'},
    {'id': 'conviviale', 'label': 'Conviviale', 'emoji': '🥳'},
  ];

  void _toggleAmbiance(String ambianceId) {
    setState(() {
      if (_selectedAmbiances.contains(ambianceId)) {
        _selectedAmbiances.remove(ambianceId);
      } else {
        _selectedAmbiances.add(ambianceId);
      }
    });
  }

  void _handleContinue() {
    widget.onAmbianceSelected(_selectedAmbiances.toList());
    widget.onContinue();
  }

  @override
  Widget build(BuildContext context) {
    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              children: [
                const SizedBox(height: 40),

                // Logo
                const MatchLogo(size: 80),

                const Spacer(),

                // Title
                Text(
                  'Quelle ambiance préfères-tu',
                  textAlign: TextAlign.center,
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.primary,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  'Sélectionne 1 ou plusieurs',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textPrimary.withOpacity(0.7),
                    fontStyle: FontStyle.italic,
                  ),
                ),

                const SizedBox(height: 40),

                // Ambiance chips
                ...List.generate(_ambiances.length, (index) {
                  final ambiance = _ambiances[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: MatchChip(
                      label: ambiance['label']!,
                      emoji: ambiance['emoji'],
                      isSelected: _selectedAmbiances.contains(ambiance['id']),
                      onTap: () => _toggleAmbiance(ambiance['id']!),
                    ),
                  );
                }),

                const Spacer(),

                // Continue button
                MatchButton(
                  text: 'Continuer',
                  onPressed: _selectedAmbiances.isNotEmpty
                      ? _handleContinue
                      : null,
                  size: MatchButtonSize.medium,
                ),

                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
