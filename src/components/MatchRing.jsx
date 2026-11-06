export default function MatchRing({ value, size = 110 }) {
  const r = 45, c = 2 * Math.PI * r;
  const col = value >= 80 ? "#16a34a" : value >= 60 ? "#d97706" : "#dc2626";
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
      <circle cx="55" cy="55" r={r} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} transform="rotate(-90 55 55)"/>
      <text x="55" y="60" textAnchor="middle" fontWeight="800" fontSize="20" fill="#1e293b">{value}%</text>
    </svg>
  );
}
