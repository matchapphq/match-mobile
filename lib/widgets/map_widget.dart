import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../constants/app_colors.dart';

class MapWidget extends StatelessWidget {
  final MapController controller;
  final LatLng initialPosition;
  final double initialZoom;
  final List<Marker> markers;
  
  const MapWidget({
    Key? key,
    required this.controller,
    this.initialPosition = const LatLng(48.8809, 2.3553), // Near Gare du Nord
    this.initialZoom = 14.0,
    this.markers = const [],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: controller,
      options: MapOptions(
        initialCenter: initialPosition,
        initialZoom: initialZoom,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: const ['a', 'b', 'c'],
          userAgentPackageName: 'com.example.matchapp',
        ),
        MarkerLayer(
          markers: markers.isNotEmpty 
              ? markers 
              : [
                  Marker(
                    point: initialPosition,
                    width: 40,
                    height: 40,
                    child: const Icon(
                      Icons.location_on,
                      color: AppColors.secondary,
                      size: 40,
                    ),
                  ),
                ],
        ),
      ],
    );
  }
}
