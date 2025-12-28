import 'package:flutter/material.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Venue type preference selection screen (Design 06)
class VenueTypePreferenceScreen extends StatefulWidget {
  final VoidCallback onContinue;
  final Function(List<String>) onVenueTypesSelected;

  const VenueTypePreferenceScreen({
    super.key,
    required this.onContinue,
    required this.onVenueTypesSelected,
  });

  @override
  State<VenueTypePreferenceScreen> createState() =>
      _VenueTypePreferenceScreenState();
}

class _VenueTypePreferenceScreenState extends State<VenueTypePreferenceScreen> {
  final Set<String> _selectedTypes = {};

  final List<Map<String, String>> _venueTypes = [
    {'id': 'restaurant', 'label': 'Restaurant', 'emoji': '🍽️'},
    {'id': 'bars', 'label': 'Bars / Pubs', 'emoji': '🍺'},
    {'id': 'fastfood', 'label': 'Fast-foods', 'emoji': '🍔'},
  ];

  void _toggleType(String typeId) {
    setState(() {
      if (_selectedTypes.contains(typeId)) {
        _selectedTypes.remove(typeId);
      } else {
        _selectedTypes.add(typeId);
      }
    });
  }

  void _handleContinue() {
    widget.onVenueTypesSelected(_selectedTypes.toList());
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
                  'Plutôt bar ou fast-food ?',
                  textAlign: TextAlign.center,
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.primary,
                  ),
                ),

                const SizedBox(height: 40),

                // Venue type chips
                ...List.generate(_venueTypes.length, (index) {
                  final type = _venueTypes[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: MatchChip(
                      label: type['label']!,
                      emoji: type['emoji'],
                      isSelected: _selectedTypes.contains(type['id']),
                      onTap: () => _toggleType(type['id']!),
                    ),
                  );
                }),

                const Spacer(),

                // Continue button
                MatchButton(
                  text: 'Continuer',
                  onPressed: _selectedTypes.isNotEmpty ? _handleContinue : null,
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
