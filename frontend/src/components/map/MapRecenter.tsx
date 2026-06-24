import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapRecenterProps {
  center: [number, number];
  zoom: number;
}

export default function MapRecenter({ center, zoom }: MapRecenterProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}