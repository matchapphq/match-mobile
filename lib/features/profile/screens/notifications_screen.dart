import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

/// Notifications settings screen (Design 26)
class NotificationsScreen extends StatefulWidget {
  final VoidCallback? onBack;

  const NotificationsScreen({super.key, this.onBack});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _matchsSuivis = true;
  bool _grosMatchs = true;
  bool _promos = false;
  bool _nouveauxBars = true;
  bool _rappels = false;

  @override
  Widget build(BuildContext context) {
    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            children: [
              // App bar
              MatchAppBar(onGlobeTap: widget.onBack, onProfileTap: () {}),

              const SizedBox(height: 16),

              // Title
              Text(
                'Notifications',
                style: AppTypography.headlineLarge.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 24),

              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: MatchWhiteCard(
                    child: Column(
                      children: [
                        // Icon
                        const Icon(
                          Icons.notifications_outlined,
                          color: AppColors.secondary,
                          size: 32,
                        ),

                        const SizedBox(height: 24),

                        // Notification options
                        _NotificationOption(
                          title: 'Matchs Suivis',
                          subtitle:
                              'Notification 30 min avant\nNotification quand un bar proche diffuse le match',
                          isEnabled: _matchsSuivis,
                          onChanged: (value) =>
                              setState(() => _matchsSuivis = value),
                        ),

                        _NotificationOption(
                          title: 'Gros matchs',
                          subtitle:
                              'Alerte type\n"PSG / OM : forte affluence — pense à réserver !"',
                          isEnabled: _grosMatchs,
                          onChanged: (value) =>
                              setState(() => _grosMatchs = value),
                        ),

                        _NotificationOption(
                          title: 'Promos & Happy Hour',
                          subtitle:
                              'Bars, restaurants et fast food\navec offres limitées / évènements',
                          isEnabled: _promos,
                          onChanged: (value) => setState(() => _promos = value),
                        ),

                        _NotificationOption(
                          title: 'Nouveaux bars ajoutés\nautour de moi',
                          subtitle: null,
                          isEnabled: _nouveauxBars,
                          onChanged: (value) =>
                              setState(() => _nouveauxBars = value),
                        ),

                        _NotificationOption(
                          title: 'Rappels de réservation',
                          subtitle: null,
                          isEnabled: _rappels,
                          onChanged: (value) =>
                              setState(() => _rappels = value),
                        ),

                        const SizedBox(height: 24),

                        // Validate button
                        MatchButton(
                          text: 'VALIDER',
                          onPressed: widget.onBack,
                          size: MatchButtonSize.medium,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Close button
              GestureDetector(
                onTap: widget.onBack,
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  child: const Icon(Icons.close, color: AppColors.primary),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _NotificationOption extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool isEnabled;
  final Function(bool) onChanged;

  const _NotificationOption({
    required this.title,
    this.subtitle,
    required this.isEnabled,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: AppColors.textDark,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: AppTypography.labelLarge.copyWith(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              _ToggleButton(isEnabled: isEnabled, onChanged: onChanged),
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.only(left: 12),
              child: Text(
                subtitle!,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textDark.withOpacity(0.6),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ToggleButton extends StatelessWidget {
  final bool isEnabled;
  final Function(bool) onChanged;

  const _ToggleButton({required this.isEnabled, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!isEnabled),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.primary, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isEnabled ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'ON',
                style: AppTypography.labelSmall.copyWith(
                  color: isEnabled ? AppColors.secondary : AppColors.textMuted,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: !isEnabled ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'OFF',
                style: AppTypography.labelSmall.copyWith(
                  color: !isEnabled ? AppColors.secondary : AppColors.textMuted,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
