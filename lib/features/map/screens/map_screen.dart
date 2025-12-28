import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart' as mapbox;
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/widgets.dart';
import '../widgets/widgets.dart';

/// Main map screen (Designs 09, 11-15)
class MapScreen extends StatefulWidget {
  final VoidCallback? onProfileTap;
  final VoidCallback? onGlobeTap;

  const MapScreen({super.key, this.onProfileTap, this.onGlobeTap});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final String _accessToken = const String.fromEnvironment(
    'MAPBOX_ACCESS_TOKEN',
  );
  int _bottomBarIndex = 0;
  bool _showFilters = false;
  bool _showVenuePreview = false;

  final mapbox.CameraOptions _cameraOptions = mapbox.CameraOptions(
    center: mapbox.Point(coordinates: mapbox.Position(2.3553, 48.8809)),
    zoom: 14.0,
    bearing: 0,
    pitch: 0,
  );

  @override
  void initState() {
    super.initState();
    if (_accessToken.isNotEmpty) {
      mapbox.MapboxOptions.setAccessToken(_accessToken);
    }
  }

  void _onBottomBarTap(int index) {
    setState(() {
      _bottomBarIndex = index;
      if (index == 2) {
        _showFilters = true;
      }
    });
  }

  void _showVenueDetails() {
    setState(() {
      _showVenuePreview = true;
    });
  }

  void _hideVenuePreview() {
    setState(() {
      _showVenuePreview = false;
    });
  }

  void _applyFilters(Map<String, List<String>> filters) {
    setState(() {
      _showFilters = false;
    });
    // TODO: Apply filters to venues
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map
          _buildMap(),

          // App bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: MatchAppBar(
              onGlobeTap: widget.onGlobeTap,
              onProfileTap: widget.onProfileTap,
            ),
          ),

          // Location pill
          Positioned(
            top: MediaQuery.of(context).padding.top + 70,
            left: 0,
            right: 0,
            child: Center(
              child: LocationPill(
                onTap: () {
                  // TODO: Center on user location
                },
              ),
            ),
          ),

          // Bottom bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: MapBottomBar(
              currentIndex: _bottomBarIndex,
              onTap: _onBottomBarTap,
            ),
          ),

          // Venue preview card
          if (_showVenuePreview)
            Positioned(
              left: 20,
              right: 20,
              bottom: 100,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  VenuePreviewCard(
                    name: 'The Kop Bar',
                    address: 'Bar - 123 Bd Ney, 75018 Paris',
                    distance: '0.9 KM',
                    imageUrl: '',
                    tags: ['Foot', '5-10€', 'Conviviale', 'Bière'],
                    rating: 4.5,
                    onTap: () {
                      // TODO: Navigate to venue details
                    },
                  ),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: _hideVenuePreview,
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        border: Border.all(
                          color: AppColors.secondary,
                          width: 2,
                        ),
                      ),
                      child: const Icon(
                        Icons.close,
                        color: AppColors.secondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Filter modal
          if (_showFilters)
            Positioned.fill(
              child: GestureDetector(
                onTap: () => setState(() => _showFilters = false),
                child: Container(
                  color: Colors.black54,
                  child: Center(
                    child: GestureDetector(
                      onTap: () {}, // Prevent tap from closing
                      child: SingleChildScrollView(
                        child: FilterModal(
                          onApply: _applyFilters,
                          onClose: () => setState(() => _showFilters = false),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMap() {
    if (_accessToken.isEmpty) {
      // Fallback when no Mapbox token
      return Container(
        decoration: BoxDecoration(color: Colors.grey[200]),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.map, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'Map requires MAPBOX_ACCESS_TOKEN',
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 32),
              // Demo button to show venue
              ElevatedButton(
                onPressed: _showVenueDetails,
                child: const Text('Show Demo Venue'),
              ),
            ],
          ),
        ),
      );
    }

    return mapbox.MapWidget(
      cameraOptions: _cameraOptions,
      onMapCreated: (mapbox.MapboxMap map) {
        // Map is ready - add tap gesture
        map.gestures.updateSettings(
          mapbox.GesturesSettings(
            rotateEnabled: true,
            pinchToZoomEnabled: true,
            scrollEnabled: true,
            simultaneousRotateAndPinchToZoomEnabled: true,
            pitchEnabled: true,
            doubleTapToZoomInEnabled: true,
            doubleTouchToZoomOutEnabled: true,
            quickZoomEnabled: true,
          ),
        );
      },
    );
  }
}
