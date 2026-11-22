export function matchColor(score) {
  const value = Number(score) || 0;
  if (value >= 80) return "bg-green-100 text-green-700";
  if (value >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export function matchHex(score) {
  const value = Number(score) || 0;
  if (value >= 80) return "#16a34a";
  if (value >= 60) return "#d97706";
  return "#dc2626";
}

export function formatCurrency(value) {
  if (typeof value === "number") {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)} LPA`;
    }
    if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
    return `₹${value.toLocaleString("en-IN")}`;
  }
  return String(value || "").trim();
}

export function formatDistance(km, commuteMin) {
  const distance = Number(km);
  let distanceText = `${distance.toFixed(distance >= 10 ? 1 : 1).replace(".0", "")} km`;
  if (distance === 0) distanceText = "Walkable";

  if (!commuteMin) return distanceText;
  const minutes = Number(commuteMin);
  const mode = distance <= 1.5 ? "walk" : minutes <= 12 ? "auto" : "auto/bus";
  return `${distanceText} • ${minutes} min ${mode}`;
}
