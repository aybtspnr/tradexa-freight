import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue with bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

interface MapRouteProps {
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  height?: string;
}

// Approximate coordinates for Brazilian capitals (fallback when exact coords unavailable)
const KNOWN_COORDS: Record<string, [number, number]> = {
  "SP": [-23.5505, -46.6333],
  "RJ": [-22.9068, -43.1729],
  "MG": [-19.9167, -43.9345],
  "RS": [-30.0346, -51.2177],
  "PR": [-25.4290, -49.2671],
  "SC": [-27.5954, -48.5482],
  "BA": [-12.9714, -38.5014],
  "DF": [-15.7975, -47.8919],
  "GO": [-16.6799, -49.2550],
  "PE": [-8.0476, -34.8770],
  "CE": [-3.7319, -38.5267],
  "ES": [-20.2976, -40.2958],
  "MT": [-15.6039, -56.0973],
  "MS": [-20.4697, -54.6201],
  "AM": [-3.1190, -60.0217],
  "PA": [-1.4558, -48.4901],
  "MA": [-2.5380, -44.2824],
  "RN": [-5.7945, -35.2110],
  "PB": [-7.1216, -34.8820],
  "AL": [-9.6660, -35.7350],
  "SE": [-10.9472, -37.0731],
  "PI": [-5.0919, -42.8034],
  "RO": [-8.7608, -63.8997],
  "TO": [-10.1846, -48.3336],
  "AC": [-9.9747, -67.8243],
  "AP": [-0.0356, -51.0705],
  "RR": [2.8199, -60.6730],
};

export function MapRoute({
  originCity, originState, destCity, destState,
  originLat, originLng, destLat, destLng,
  height = "300px",
}: MapRouteProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);
  const markerIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;

    const oLat = originLat ?? KNOWN_COORDS[originState]?.[0];
    const oLng = originLng ?? KNOWN_COORDS[originState]?.[1];
    const dLat = destLat ?? KNOWN_COORDS[destState]?.[0];
    const dLng = destLng ?? KNOWN_COORDS[destState]?.[1];

    if (!oLat || !oLng || !dLat || !dLng) {
      // Fallback: show Brazil overview
      const map = L.map(mapRef.current).setView([-14.2350, -51.9253], 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.marker([KNOWN_COORDS[originState]?.[0] ?? -15.7975, KNOWN_COORDS[originState]?.[1] ?? -47.8919], { icon: markerIcon })
        .addTo(map).bindPopup(`${originCity}/${originState}`);
      L.marker([KNOWN_COORDS[destState]?.[0] ?? -23.5505, KNOWN_COORDS[destState]?.[1] ?? -46.6333], { icon: markerIcon })
        .addTo(map).bindPopup(`${destCity}/${destState}`);
      instanceRef.current = map;
      return;
    }

    const map = L.map(mapRef.current).setView([(oLat + dLat) / 2, (oLng + dLng) / 2], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const originMarker = L.marker([oLat, oLng], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`📍 <b>Origem</b><br/>${originCity}/${originState}`);

    const destMarker = L.marker([dLat, dLng], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`📦 <b>Destino</b><br/>${destCity}/${destState}`);

    // Draw polyline between points
    const polyline = L.polyline([[oLat, oLng], [dLat, dLng]], {
      color: "#2563EB",
      weight: 3,
      opacity: 0.7,
      dashArray: "10, 10",
    }).addTo(map);

    // Fit bounds
    const group = L.featureGroup([originMarker, destMarker, polyline]);
    map.fitBounds(group.getBounds().pad(0.2));

    instanceRef.current = map;

    return () => {
      map.remove();
      instanceRef.current = null;
    };
  }, [originCity, originState, destCity, destState, originLat, originLng, destLat, destLng]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
      className="border border-border shadow-sm"
    />
  );
}
