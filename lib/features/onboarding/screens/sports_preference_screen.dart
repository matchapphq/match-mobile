import 'package:flutter/material.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Sports preference selection screen (Design 04)
class SportsPreferenceScreen extends StatefulWidget {
  final VoidCallback onContinue;
  final Function(List<String>) onSportsSelected;

  const SportsPreferenceScreen({
    super.key,
    required this.onContinue,
    required this.onSportsSelected,
  });

  @override
  State<SportsPreferenceScreen> createState() => _SportsPreferenceScreenState();
}

class _SportsPreferenceScreenState extends State<SportsPreferenceScreen> {
  final Set<String> _selectedSports = {};

  final List<Map<String, String>> _sports = [
    {'id': 'foot', 'label': 'Foot', 'emoji': '⚽'},
    {'id': 'rugby', 'label': 'Rugby', 'emoji': '🏈'},
    {'id': 'basket', 'label': 'Basket', 'emoji': '🏀'},
    {'id': 'tennis', 'label': 'Tennis', 'emoji': '🎾'},
  ];

  void _toggleSport(String sportId) {
    setState(() {
      if (_selectedSports.contains(sportId)) {
        _selectedSports.remove(sportId);
      } else {
        _selectedSports.add(sportId);
      }
    });
  }

  void _handleContinue() {
    widget.onSportsSelected(_selectedSports.toList());
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
                  "Quels sports t'intéressent ?",
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

                // Sports chips
                ...List.generate(_sports.length, (index) {
                  final sport = _sports[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: MatchChip(
                      label: sport['label']!,
                      emoji: sport['emoji'],
                      isSelected: _selectedSports.contains(sport['id']),
                      onTap: () => _toggleSport(sport['id']!),
                    ),
                  );
                }),

                // Add more button
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: MatchChip(
                    label: 'Ajouter',
                    icon: Icons.add,
                    onTap: () {
                      // TODO: Show more sports
                    },
                  ),
                ),

                const Spacer(),

                // Continue button
                MatchButton(
                  text: 'Continuer',
                  onPressed: _selectedSports.isNotEmpty
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
