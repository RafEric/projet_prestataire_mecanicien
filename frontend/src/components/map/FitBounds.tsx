import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface FitBoundsProps {
  positions: [number, number][];
  padding?: [number, number];
}

export default function FitBounds({ positions, padding = [50, 50] }: FitBoundsProps) {
  const map = useMap();

  const positionsKey = positions.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (positions.length === 0) return;

    if (positions.length === 1) {
      map.setView(positions[0], 14, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding, animate: true, maxZoom: 15 });
  }, [positionsKey, padding, map, positions]);

  return null;
}