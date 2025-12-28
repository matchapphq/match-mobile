import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Search screen (Design 22)
class SearchScreen extends StatefulWidget {
  final VoidCallback? onClose;
  final Function(String query)? onSearch;

  const SearchScreen({super.key, this.onClose, this.onSearch});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  final List<String> _searchHistory = [
    '"Bars avec terrasse"',
    '"Happy hour"',
    '"NBA ce soir"',
    '"Match du moment"',
  ];

  final List<String> _trending = [
    'PSG vs OM',
    'Rolland Garros',
    'Final ATP',
    'Premier League',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    if (_searchController.text.isNotEmpty) {
      widget.onSearch?.call(_searchController.text);
    }
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
              children: [
                Text(
                  'Recherche',
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Icon(Icons.search, color: AppColors.textPrimary, size: 24),
              ],
            ),

            const SizedBox(height: 24),

            // Search input
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.3)),
              ),
              child: TextField(
                controller: _searchController,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: 'Rechercher...',
                  hintStyle: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textPrimary.withOpacity(0.5),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onSubmitted: (_) => _handleSearch(),
              ),
            ),

            const SizedBox(height: 24),

            // Divider
            Container(height: 1, color: Colors.white.withOpacity(0.2)),

            const SizedBox(height: 24),

            // History section
            Row(
              children: [
                Icon(Icons.history, color: AppColors.primary, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Historique',
                  style: AppTypography.labelLarge.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // History items
            ...List.generate(_searchHistory.length, (index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GestureDetector(
                  onTap: () {
                    _searchController.text = _searchHistory[index].replaceAll(
                      '"',
                      '',
                    );
                    _handleSearch();
                  },
                  child: Text(
                    _searchHistory[index],
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textPrimary.withOpacity(0.8),
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Trending section
            Row(
              children: [
                Icon(Icons.trending_up, color: AppColors.primary, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Tendances',
                  style: AppTypography.labelLarge.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Trending items
            ...List.generate(_trending.length, (index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GestureDetector(
                  onTap: () {
                    _searchController.text = _trending[index];
                    _handleSearch();
                  },
                  child: Text(
                    _trending[index],
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textPrimary.withOpacity(0.8),
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Validate button
            Center(
              child: MatchButton(
                text: 'VALIDER',
                onPressed: _handleSearch,
                size: MatchButtonSize.medium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
