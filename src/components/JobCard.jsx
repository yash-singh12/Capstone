import { Link } from "react-router-dom";
import { MapPin, Bus } from "lucide-react";

export function matchColor(m) { return m >= 80 ? "bg-green-100 text-green-700" : m >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"; }

export default function JobCard({ job }) {
  return (
    <div className="card p-4 flex flex-col gap-2 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold">{job.title}</div>
          <div className="text-sm text-slate-500">{job.company} • <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{job.tag}</span></div>
        </div>
        <span className={`chip ${matchColor(job.match)}`}>{job.match}% match</span>
      </div>
      <div className="text-sm text-slate-600 flex items-center gap-1"><MapPin size={14}/> {job.address} • {job.distanceKm}km • {job.commuteMin}min</div>
      <div className="text-xs text-slate-500 flex items-center gap-1"><Bus size={13}/> {job.busRoute}</div>
      <div className="text-sm font-medium text-indigo-700">{job.salary}</div>
      <div className="flex flex-wrap gap-1">{job.required.slice(0,5).map(s => <span key={s} className="chip bg-slate-100 text-slate-600">{s}</span>)}</div>
      <div className="flex gap-2 mt-1">
        <Link to={`/jobs/${job.id}`} className="btn-primary text-sm !px-4 !py-1.5">View + Skill Gap</Link>
        <Link to={`/mock/${job.id}`} className="btn-ghost">Mock Test</Link>
      </div>
    </div>
  );
}
