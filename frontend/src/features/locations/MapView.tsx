import { useEffect, useMemo, useRef } from "react";
import * as L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import type { LocationItem } from "./locationTypes";

// Leaflet expects marker image files at default paths.
// With bundlers, those paths are different, so we set them here explicitly.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

interface MapViewProps {
  locations: LocationItem[];
  selectedLocationId: number | null;
  onSelectLocation: (location: LocationItem) => void;
}

function FlyToSelected({ location }: { location: LocationItem | null }) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo([location.latitude, location.longitude], 14, { duration: 1.1 });
  }, [location, map]);

  return null;
}

function OpenPopupForSelected({
  selectedLocationId,
  markerRefs,
}: {
  selectedLocationId: number | null;
  markerRefs: React.MutableRefObject<Record<number, L.Marker | null>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocationId) {
      map.closePopup();
      return;
    }

    const marker = markerRefs.current[selectedLocationId];
    if (!marker) {
      return;
    }

    // Close any open popup first to avoid stale or duplicate popups during selection changes.
    map.closePopup();
    marker.openPopup();
  }, [map, markerRefs, selectedLocationId]);

  return null;
}

export function MapView({
  locations,
  selectedLocationId,
  onSelectLocation,
}: MapViewProps) {
  const markerRefs = useRef<Record<number, L.Marker | null>>({});
  const selectedLocation = useMemo(
    () =>
      locations.find((location) => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  );

  return (
    <div className="map-shell">
      <MapContainer
        center={[6.9271, 79.8612]}
        zoom={12}
        scrollWheelZoom
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelected location={selectedLocation} />
        <OpenPopupForSelected
          selectedLocationId={selectedLocationId}
          markerRefs={markerRefs}
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            ref={(instance) => {
              markerRefs.current[location.id] = instance;
            }}
            position={[location.latitude, location.longitude]}
            eventHandlers={{ click: () => onSelectLocation(location) }}
          >
            <Popup>
              <strong>{location.name}</strong>
              <div>{location.description}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
