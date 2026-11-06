import { useState } from "react";
import { JOBS } from "../data/mockData";
import JobCard from "../components/JobCard";

export default function Jobs() {
  const [radius, setRadius] = useState(50);
  const [q, setQ] = useState("");
  const filtered = JOBS.filter(j => j.distanceKm <= radius && (q === "" || (j.title + j.company + j.required.join(" ")).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.match - a.match);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-4 gap-4">
      <div className="card p-4 h-fit">
        <div className="font-bold">Hyperlocal Filters</div>
        <p className="text-xs text-slate-500">Center: SSTC Junwani, Bhilai</p>
        <label className="text-sm font-semibold mt-4 block">Radius: {radius} km</label>
        <input type="range" min="5" max="50" step="5" value={radius} onChange={e => setRadius(+e.target.value)} />
        <div className="flex gap-1 mt-1">{[5, 15, 50].map(r => <button key={r} onClick={() => setRadius(r)} className={`chip ${radius === r ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>{r}km</button>)}</div>
        <p className="text-xs text-slate-500 mt-2">5km: campus walkables • 15km: Bhilai+Durg • 50km: +Raipur IT Park</p>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search React, Java, Raipur…" className="mt-4 w-full border rounded-xl px-3 py-2 text-sm" />
        <div className="card !bg-slate-50 p-3 mt-4 text-xs">Map (mocked)<br/>📍 SSTC center<br/>🟢 {filtered.length} jobs in {radius}km<br/>Bhilai • Durg • Raipur corridor via GE Road / NH53</div>
      </div>
      <div className="md:col-span-3">
        <div className="font-bold text-lg mb-2">{filtered.length} jobs within {radius}km of SSTC</div>
        <div className="grid md:grid-cols-2 gap-4">{filtered.map(j => <JobCard key={j.id} job={j} />)}</div>
        {filtered.length === 0 && <div className="card p-6 text-center text-sm">No jobs in this radius. Try 50km to include Raipur.</div>}
      </div>
    </div>
  );
}
