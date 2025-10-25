import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart' as mapbox;

class MapWidget extends StatefulWidget {
  final mapbox.CameraOptions? cameraOptions;
  final String styleUri;

  const MapWidget({
    Key? key,
    this.cameraOptions,
    this.styleUri = mapbox.MapboxStyles.MAPBOX_STREETS,
  }) : super(key: key);

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  @override
  Widget build(BuildContext context) {
    return mapbox.MapWidget(
      cameraOptions:
          widget.cameraOptions ??
          mapbox.CameraOptions(
            center: mapbox.Point(
              coordinates: mapbox.Position(2.3553, 48.8809),
            ), // Near Gare du Nord (lng, lat)
            zoom: 14.0,
            bearing: 0,
            pitch: 0,
          ),
      styleUri: widget.styleUri,
      mapOptions: mapbox.MapOptions(
        pixelRatio: MediaQuery.of(context).devicePixelRatio,
        // Gesture configuration is now handled by the GesturesPlugin
        // The default gesture settings are already enabled by default
      ),
    );
  }
}
