import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: MatchMapPage(),
    );
  }
}

class MatchMapPage extends StatelessWidget {
  const MatchMapPage({super.key});

  @override
  Widget build(BuildContext context) {
    final mapController = MapController();

    return Scaffold(
      body: Stack(
        children: [
          // --- MAP BACKGROUND ---
          FlutterMap(
            mapController: mapController,
            options: const MapOptions(
              initialCenter: LatLng(48.8809, 2.3553), // Near Gare du Nord
              initialZoom: 14,
            ),
            children: [
              TileLayer(
                urlTemplate:
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                subdomains: const ['a', 'b', 'c'],
                userAgentPackageName: 'com.example.matchapp',
              ),
              const MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(48.8809, 2.3553),
                    width: 40,
                    height: 40,
                    child: Icon(
                      Icons.location_on,
                      color: Colors.blue,
                      size: 40,
                    ),
                  ),
                ],
              ),
            ],
          ),

          // --- SEARCH BAR & "DANS LE COIN" BUTTON ---
          Positioned(
            top: 60,
            left: 16,
            right: 16,
            child: Column(
              children: [
                // Search Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(25),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const TextField(
                    decoration: InputDecoration(
                      icon: Icon(Icons.search),
                      hintText: 'Match, bars, restaurants ?',
                      border: InputBorder.none,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                // "Dans le coin" Button
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFB5C100), // Lime/olive
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 12,
                    ),
                  ),
                  child: const Text(
                    'DANS LE COIN',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // --- FLOATING VERTICAL ACTION BUTTONS ---
          Positioned(
            right: 16,
            top: 220,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: const [
                  _ActionIcon(icon: Icons.tune),
                  _ActionIcon(icon: Icons.euro),
                  _ActionIcon(icon: Icons.memory),
                  _ActionIcon(icon: Icons.thermostat),
                  _ActionIcon(icon: Icons.navigation),
                ],
              ),
            ),
          ),
        ],
      ),

      // --- BOTTOM NAVIGATION BAR ---
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFFB5C100),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.wifi_tethering), label: ''),
          BottomNavigationBarItem(
            icon: Icon(Icons.confirmation_number),
            label: '',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: ''),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: ''),
        ],
      ),
    );
  }
}

class _ActionIcon extends StatelessWidget {
  final IconData icon;
  const _ActionIcon({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Icon(icon, color: Color(0xFFB5C100), size: 28),
    );
  }
}
