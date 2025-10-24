import 'package:flutter/material.dart';

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.only(bottom: 100),
          child: Column(
            children: [
              SizedBox(height: MediaQuery.of(context).padding.top + 60),
              Icon(
                Icons.construction_outlined,
                size: 64,
                color: Colors.green[700],
              ),
              const SizedBox(height: 24),
              Text(
                'Favorites',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: Colors.black87,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              Text(
                'Under Maintenance',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: 40),
              // Demo scrollable content
              ...List.generate(
                10,
                (index) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.favorite, color: Colors.green[700]),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Favorite Item ${index + 1}',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
