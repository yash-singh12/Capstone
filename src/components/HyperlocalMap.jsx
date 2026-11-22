import { useEffect, useRef } from "react";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { SSTC_COLLEGE } from "../data/mockData";
import { formatDistance, matchColor } from "../utils/formatters";

function MapView({ radius }) {
  const map = useMap();
  useEffect(() => {
    const zoom = radius >= 50 ? 10 : radius >= 15 ? 11 : 13;
    map.setView([SSTC_COLLEGE.lat, SSTC_COLLEGE.lng], zoom, { animate: true });
  }, [map, radius]);
  return null;
}

function employerIcon(tag, highlighted = false) {
  let color = "#2563eb";
  if (tag.includes("Startup")) color = "#4f46e5";
  if (tag.includes("MSME")) color = "#d97706";
  return L.divIcon({
    className: "",
    html: `<div style="width:${highlighted ? 24 : 18}px;height:${highlighted ? 24 : 18}px;border-radius:50% 50% 50% 0;background:${color};border:${highlighted ? 4 : 3}px solid white;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(15,23,42,.35);"></div>`,
    iconSize: [highlighted ? 24 : 18, highlighted ? 24 : 18],
    iconAnchor: [highlighted ? 12 : 9, highlighted ? 24 : 18],
  });
}

const campusIcon = L.divIcon({
  className: "",
  html: '<div style="display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#1e293b;color:white;border:4px solid white;box-shadow:0 4px 12px rgba(15,23,42,.35);font-size:16px;">S</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

export default function HyperlocalMap({ jobs, radius, highlightedId }) {
  const markerRefs = useRef({});
  const corridor = [
    [21.208, 81.355],
    [21.195, 81.363],
    [21.170, 81.329],
    [21.193, 81.299],
    [21.168, 81.290],
    [21.244, 81.648],
  ];

  useEffect(() => {
    const marker = markerRefs.current[highlightedId];
    if (marker) marker.openPopup();
  }, [highlightedId]);

  return (
    <MapContainer
      center={[SSTC_COLLEGE.lat, SSTC_COLLEGE.lng]}
      zoom={radius >= 50 ? 10 : radius >= 15 ? 11 : 13}
      scrollWheelZoom
      className="h-[360px] w-full rounded-2xl md:h-[420px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapView radius={radius} />
      <Circle
        center={[SSTC_COLLEGE.lat, SSTC_COLLEGE.lng]}
        radius={radius * 1000}
        pathOptions={{ color: "#4f46e5", fillColor: "#818cf8", fillOpacity: 0.08, weight: 2, dashArray: "6 6" }}
      />
      <Polyline positions={corridor} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.72, dashArray: "10 8" }} />
      <Marker position={[SSTC_COLLEGE.lat, SSTC_COLLEGE.lng]} icon={campusIcon}>
        <Popup>
          <div className="text-sm"><b>SSTC, Junwani</b><br />Campus and map anchor</div>
        </Popup>
      </Marker>
      {jobs.map((job) => (
        <Marker
          key={job.id}
          position={[job.lat, job.lng]}
          icon={employerIcon(job.tag, highlightedId === job.id)}
          ref={(ref) => { if (ref) markerRefs.current[job.id] = ref; else delete markerRefs.current[job.id]; }}
        >
          <Popup>
            <div className="min-w-44 text-sm">
              <b>{job.title}</b><br />
              <span className="text-slate-600">{job.company}</span>
              <div className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${matchColor(job.match)}`}>{job.match}% match</div>
              <div className="mt-2 text-xs">{formatDistance(job.distanceKm, job.commuteMin)}</div>
              <Link to={`/jobs/${job.id}`} className="mt-2 block font-semibold text-indigo-700">View job details →</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
