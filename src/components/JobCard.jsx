import { Link } from "react-router-dom";
import { MapPin, Bus } from "lucide-react";
import { formatCurrency, formatDistance, matchColor } from "../utils/formatters";

export default function JobCard({ job, onHover }) {
  return (
    <div
      className="card p-4 flex flex-col gap-2 hover:shadow-md transition"
      onMouseEnter={() => onHover?.(job.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(job.id)}
      onBlur={() => onHover?.(null)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold">{job.title}</div>
          <div className="text-sm text-slate-500">{job.company} • <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{job.tag}</span></div>
        </div>
        <span className={`chip ${matchColor(job.match)}`}>{job.match}% match</span>
      </div>
      <div className="text-sm text-slate-600 flex items-center gap-1"><MapPin size={14}/> {job.address} • {formatDistance(job.distanceKm, job.commuteMin)}</div>
      <div className="text-xs text-slate-500 flex items-center gap-1"><Bus size={13}/> {job.busRoute}</div>
      <div className="text-sm font-medium text-indigo-700">{formatCurrency(job.salary)}</div>
      <div className="flex flex-wrap gap-1">{job.required.slice(0,5).map(s => <span key={s} className="chip bg-slate-100 text-slate-600">{s}</span>)}</div>
      <div className="flex gap-2 mt-1">
        <Link to={`/jobs/${job.id}`} className="btn-primary text-sm !px-4 !py-1.5">View + Skill Gap</Link>
        <Link to={`/mock/${job.id}`} className="btn-ghost">Mock Test</Link>
      </div>
    </div>
  );
}
