import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Filter modal for map view (Design 10)
class FilterModal extends StatefulWidget {
  final Function(Map<String, List<String>>) onApply;
  final VoidCallback onClose;

  const FilterModal({super.key, required this.onApply, required this.onClose});

  @override
  State<FilterModal> createState() => _FilterModalState();
}

class _FilterModalState extends State<FilterModal> {
  final Set<String> _selectedLieux = {};
  final Set<String> _selectedPrix = {};
  final Set<String> _selectedSports = {};
  final Set<String> _selectedAmbiance = {};
  final Set<String> _selectedFood = {};

  final List<String> _lieuxOptions = ['Bar', 'Fast-Food', 'Chicha'];
  final List<String> _prixOptions = ['-5€', '5-10€', '10-20€', '+20€'];
  final List<String> _sportsOptions = ['Foot', 'Basket', 'Rugby', 'Tennis'];
  final List<String> _ambianceOptions = ['Conviviale', 'Ultra', 'Posée'];
  final List<String> _foodOptions = ['Bière', 'Tacos', 'Pizza', 'Grec'];

  void _toggleSelection(Set<String> set, String value) {
    setState(() {
      if (set.contains(value)) {
        set.remove(value);
      } else {
        set.add(value);
      }
    });
  }

  void _handleApply() {
    widget.onApply({
      'lieux': _selectedLieux.toList(),
      'prix': _selectedPrix.toList(),
      'sports': _selectedSports.toList(),
      'ambiance': _selectedAmbiance.toList(),
      'food': _selectedFood.toList(),
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(20),
      child: MatchCard(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Filtres',
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
                Icon(Icons.tune, color: AppColors.textPrimary, size: 24),
              ],
            ),

            const SizedBox(height: 24),

            // Lieux
            _buildFilterSection('Lieux', _lieuxOptions, _selectedLieux),

            const SizedBox(height: 16),

            // Prix
            _buildFilterSection('Prix', _prixOptions, _selectedPrix),

            const SizedBox(height: 16),

            // Sports
            _buildFilterSection('Sports', _sportsOptions, _selectedSports),

            const SizedBox(height: 16),

            // Ambiance
            _buildFilterSection(
              'Ambiance',
              _ambianceOptions,
              _selectedAmbiance,
            ),

            const SizedBox(height: 16),

            // Food & Drinks
            _buildFilterSection('Food & Drinks', _foodOptions, _selectedFood),

            const SizedBox(height: 24),

            // Apply button
            Center(
              child: MatchButton(
                text: 'VALIDER',
                onPressed: _handleApply,
                size: MatchButtonSize.medium,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterSection(
    String title,
    List<String> options,
    Set<String> selected,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: AppColors.textPrimary,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: AppTypography.labelLarge.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: options.map((option) {
            final isSelected = selected.contains(option);
            return GestureDetector(
              onTap: () => _toggleSelection(selected, option),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.textPrimary.withOpacity(0.5),
                    width: 1.5,
                  ),
                ),
                child: Text(
                  option,
                  style: AppTypography.labelMedium.copyWith(
                    color: isSelected
                        ? AppColors.secondary
                        : AppColors.textPrimary,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
