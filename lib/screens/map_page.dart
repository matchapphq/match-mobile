import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../widgets/map_widget.dart';
import '../widgets/search_bar.dart';
import '../widgets/action_buttons.dart';
import '../widgets/bottom_nav_bar.dart';
import '../constants/app_colors.dart';
import 'tickets_page.dart';
import 'favorites_page.dart';
import 'profile_page.dart';

class MapPage extends StatefulWidget {
  const MapPage({super.key});

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  final MapController _mapController = MapController();
  int _currentIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  Widget _buildMapContent(BuildContext context) {
    return Stack(
      children: [
        // --- MAP BACKGROUND ---
        MapWidget(
          controller: _mapController,
          initialPosition: const LatLng(48.8809, 2.3553), // Near Gare du Nord
        ),

        // --- SEARCH BAR & "DANS LE COIN" BUTTON ---
        Positioned(
          top: MediaQuery.of(context).padding.top + 16,
          left: 16,
          right: 16,
          child: const SearchBarWidget(
            hintText: 'Match, bars, restaurants ?',
            buttonText: 'DANS LE COIN',
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          ),
        ),

        // --- FLOATING VERTICAL ACTION BUTTONS ---
        const Positioned(right: 16, top: 200, child: ActionButtons()),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildMapContent(context),
      const TicketsPage(),
      const FavoritesPage(),
      const ProfilePage(),
    ];

    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}
