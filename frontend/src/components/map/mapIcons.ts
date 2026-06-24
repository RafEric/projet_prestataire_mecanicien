import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const clientIcon = L.divIcon({
  className: "map-marker map-marker-client",
  html: `<div class="map-marker-inner client" title="Votre position">
    <span class="map-marker-pulse"></span>
    <span class="map-marker-dot"></span>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function createMechanicIcon(rating: string) {
  return L.divIcon({
    className: "map-marker map-marker-mechanic",
    html: `<div class="map-marker-inner mechanic" title="Mécanicien">
      <div class="map-marker-pin">🔧</div>
      <span class="map-marker-label">⭐ ${rating}</span>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 40],
  });
}