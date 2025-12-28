import 'package:flutter/material.dart';
import 'core/core.dart';

class MatchApp extends StatelessWidget {
  const MatchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Match',
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
    );
  }
}
