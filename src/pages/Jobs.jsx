import { useState } from "react";
import { JOBS } from "../data/mockData";
import JobCard from "../components/JobCard";
import { useAuth } from "../context/AuthContext";
import { getGap } from "../data/mockData";
import HyperlocalMap from "../components/HyperlocalMap";

export default function Jobs() {
  const { user, setPreferredRadius } = useAuth();
  const [radius, setRadius] = useState(user?.preferredRadius || 50);
  const [q, setQ] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const skills = user?.skills || [];
  const filtered = JOBS
    .filter(j => j.distanceKm <= radius && (q === "" || (j.title + j.company + j.required.join(" ")).toLowerCase().includes(q.toLowerCase())))
    .map((job) => ({ ...job, match: getGap(job.id, skills).matchPercent }))
    .sort((a, b) => b.match - a.match);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-4 gap-4">
      <div className="card p-4 h-fit">
        <div className="font-bold">Hyperlocal Filters</div>
        <p className="text-xs text-slate-500">Center: SSTC Junwani, Bhilai</p>
        <label className="text-sm font-semibold mt-4 block">Radius: {radius} km</label>
        <input type="range" min="5" max="50" step="5" value={radius} onChange={e => { setRadius(+e.target.value); setPreferredRadius(+e.target.value); }} />
        <div className="flex gap-1 mt-1">{[5, 15, 50].map(r => <button key={r} onClick={() => { setRadius(r); setPreferredRadius(r); }} className={`chip ${radius === r ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>{r}km</button>)}</div>
        <p className="text-xs text-slate-500 mt-2">5km: campus walkables • 15km: Bhilai+Durg • 50km: +Raipur IT Park</p>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search React, Java, Raipur…" className="mt-4 w-full border rounded-xl px-3 py-2 text-sm" />
      </div>
      <div className="md:col-span-3">
        <div className="font-bold text-lg mb-2">{filtered.length} jobs within {radius}km of SSTC</div>
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200">
          <HyperlocalMap jobs={filtered} radius={radius} highlightedId={highlightedId} />
        </div>
        <div className="-mt-2 mb-3 text-xs text-slate-500"><b>{filtered.length}</b> employers in {radius}km • Bhilai–Durg–Raipur corridor</div>
        <div className="grid md:grid-cols-2 gap-4">{filtered.map(j => <JobCard key={j.id} job={j} onHover={setHighlightedId} />)}</div>
        {filtered.length === 0 && <div className="card p-6 text-center text-sm">No jobs in this radius. Try 50km to include Raipur.</div>}
      </div>
    </div>
  );
}
