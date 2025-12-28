import 'package:flutter/material.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Budget preference selection screen (Design 07)
class BudgetPreferenceScreen extends StatefulWidget {
  final VoidCallback onContinue;
  final Function(String) onBudgetSelected;

  const BudgetPreferenceScreen({
    super.key,
    required this.onContinue,
    required this.onBudgetSelected,
  });

  @override
  State<BudgetPreferenceScreen> createState() => _BudgetPreferenceScreenState();
}

class _BudgetPreferenceScreenState extends State<BudgetPreferenceScreen> {
  String? _selectedBudget;

  final List<Map<String, String>> _budgets = [
    {'id': '5-10', 'label': '5-10 €'},
    {'id': '10-20', 'label': '10-20 €'},
    {'id': '20+', 'label': '+20 €'},
  ];

  void _selectBudget(String budgetId) {
    setState(() {
      _selectedBudget = budgetId;
    });
  }

  void _handleContinue() {
    if (_selectedBudget != null) {
      widget.onBudgetSelected(_selectedBudget!);
      widget.onContinue();
    }
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
                  'Ton budget habituel ?',
                  textAlign: TextAlign.center,
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.primary,
                  ),
                ),

                const SizedBox(height: 40),

                // Budget chips
                ...List.generate(_budgets.length, (index) {
                  final budget = _budgets[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: MatchChip(
                      label: budget['label']!,
                      isSelected: _selectedBudget == budget['id'],
                      onTap: () => _selectBudget(budget['id']!),
                    ),
                  );
                }),

                const Spacer(),

                // Continue button
                MatchButton(
                  text: 'Continuer',
                  onPressed: _selectedBudget != null ? _handleContinue : null,
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
