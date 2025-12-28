import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Custom app bar with globe icon and profile avatar
class MatchAppBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onGlobeTap;
  final VoidCallback? onProfileTap;
  final bool showGlobe;
  final bool showProfile;

  const MatchAppBar({
    super.key,
    this.onGlobeTap,
    this.onProfileTap,
    this.showGlobe = true,
    this.showProfile = true,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            if (showGlobe)
              GestureDetector(
                onTap: onGlobeTap,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  child: const Icon(
                    Icons.public,
                    color: AppColors.primary,
                    size: 24,
                  ),
                ),
              )
            else
              const SizedBox(width: 44),

            if (showProfile)
              GestureDetector(
                onTap: onProfileTap,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 2),
                    color: AppColors.primary.withOpacity(0.2),
                  ),
                  child: ClipOval(
                    child: Container(
                      color: Colors.grey[300],
                      child: const Icon(
                        Icons.person,
                        color: Colors.grey,
                        size: 28,
                      ),
                    ),
                  ),
                ),
              )
            else
              const SizedBox(width: 44),
          ],
        ),
      ),
    );
  }
}

/// Simple header with back button and title
class MatchHeader extends StatelessWidget {
  final String? title;
  final VoidCallback? onBack;
  final Widget? trailing;

  const MatchHeader({super.key, this.title, this.onBack, this.trailing});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            if (onBack != null)
              GestureDetector(
                onTap: onBack,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.surface.withOpacity(0.2),
                  ),
                  child: const Icon(
                    Icons.arrow_back_ios_new,
                    color: AppColors.textPrimary,
                    size: 18,
                  ),
                ),
              ),
            if (title != null) ...[
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title!,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              ),
            ] else
              const Spacer(),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}
