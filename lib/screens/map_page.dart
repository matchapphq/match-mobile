import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart' as mapbox;
import '../widgets/map_widget.dart';
import '../widgets/search_bar.dart';
import '../widgets/action_buttons.dart';
import '../widgets/bottom_nav_bar.dart';
import 'tickets_page.dart';
import 'favorites_page.dart';
import 'profile_page.dart';

class MapPage extends StatefulWidget {
  const MapPage({super.key});

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  final String accessToken = const String.fromEnvironment('MAPBOX_ACCESS_TOKEN');
  int _currentIndex = 0;
  final mapbox.CameraOptions cameraOptions = mapbox.CameraOptions(
    center: mapbox.Point(coordinates: mapbox.Position(2.3553, 48.8809)), // Near Gare du Nord (lng, lat)
    zoom: 14.0,
    bearing: 0,
    pitch: 0,
  );

  @override
  void initState() {
    super.initState();
    mapbox.MapboxOptions.setAccessToken(accessToken);
  }

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
          cameraOptions: cameraOptions,
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
