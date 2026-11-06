import { useParams, Link } from "react-router-dom";
import { JOBS, getGap } from "../data/mockData";
import MatchRing from "../components/MatchRing";
import { MapPin, Bus, ArrowRight } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const job = JOBS.find(j => j.id === id) || JOBS[0];
  const gap = getGap(job.id);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 card p-6">
        <span className="chip bg-slate-100">{job.tag}</span>
        <h1 className="text-2xl font-extrabold mt-1">{job.title} @ {job.company}</h1>
        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1"><MapPin size={14}/> {job.address} • {job.distanceKm}km • {job.commuteMin}min</p>
        <p className="text-xs text-slate-500 flex items-center gap-1"><Bus size={13}/> {job.busRoute}</p>
        <p className="text-sm mt-3">{job.desc}</p>
        <p className="font-bold mt-4">Required skills</p>
        <div className="flex flex-wrap gap-1 mt-1">{job.required.map(s => <span key={s} className="chip bg-slate-100">{s}</span>)}</div>
        <div className="flex gap-2 mt-5 flex-wrap">
          <Link to={`/learn/TypeScript`} className="btn-primary text-sm">Start Upskilling Path <ArrowRight size={14} className="inline"/></Link>
          <Link to={`/mock/${job.id}`} className="btn-ghost text-sm">Take Job-Tailored Mock</Link>
        </div>
      </div>
      <div className="card p-5">
        <div className="font-bold">Skill-Gap Matrix (semantic)</div>
        <div className="flex justify-center my-2"><MatchRing value={gap.matchPercent} /></div>
        <p className="text-xs bg-indigo-50 text-indigo-700 p-2 rounded-xl">💡 {gap.semanticNote}</p>
        <p className="font-semibold text-sm mt-3 text-green-700">Matched ({gap.matched.length})</p>
        <div className="flex flex-wrap gap-1">{gap.matched.map(s => <span key={s} className="chip bg-green-100 text-green-700">✓ {s}</span>)}</div>
        <p className="font-semibold text-sm mt-3 text-red-700">Missing ({gap.missing.length})</p>
        {gap.missing.map(m => (
          <div key={m.skill} className="border rounded-xl p-2 mt-1 text-sm">
            <div className="flex justify-between"><b>✕ {m.skill}</b><span className="chip bg-amber-100 text-amber-700 text-xs">{m.importance}</span></div>
            <div className="text-xs text-slate-500">{m.reason}</div>
            <Link to={`/learn/${m.skill}`} className="text-indigo-600 text-xs font-semibold">Learn {m.skill} →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
