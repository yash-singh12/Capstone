import { Link } from "react-router-dom";
import { DEMO_STUDENT, JOBS, SSTC_COLLEGE } from "../data/mockData";
import MatchRing from "../components/MatchRing";
import JobCard from "../components/JobCard";

export default function Dashboard() {
  const top = [...JOBS].sort((a, b) => b.match - a.match).slice(0, 3);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
      <div className="card p-5 md:col-span-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white grid place-items-center font-bold">{DEMO_STUDENT.avatar}</div>
          <div><div className="font-bold">{DEMO_STUDENT.name}</div><div className="text-xs text-slate-500">{DEMO_STUDENT.branch} • {DEMO_STUDENT.roll}<br/>{SSTC_COLLEGE.name}</div></div>
        </div>
        <div className="text-xs text-slate-500 mt-2">{DEMO_STUDENT.home} • {DEMO_STUDENT.commute} • CGPA {DEMO_STUDENT.cgpa}</div>
        <div className="flex flex-wrap gap-1 mt-3">{DEMO_STUDENT.skills.map(s => <span key={s} className="chip bg-indigo-50 text-indigo-700">{s}</span>)}</div>
        <Link to="/resume" className="btn-ghost block text-center mt-4 text-sm">Upload / Re-parse Resume</Link>
      </div>
      <div className="card p-5 flex items-center gap-5">
        <MatchRing value={DEMO_STUDENT.employability} />
        <div><div className="font-bold">Employability Score</div><p className="text-sm text-slate-600">Based on 10 Bhilai/Durg/Raipur jobs. +5% if you finish TypeScript path.</p>
        <div className="flex gap-4 mt-2 text-sm"><span><b>12</b> matches</span><span><b>3</b> skills missing</span><span><b>2</b> mocks done</span></div></div>
      </div>
      <div className="card p-5">
        <div className="font-bold mb-2">Recent activity</div>
        {DEMO_STUDENT.activity.map(a => <div key={a} className="text-sm text-slate-600 border-b py-1.5 last:border-0">• {a}</div>)}
      </div>
      <div className="md:col-span-3"><h2 className="font-bold text-lg mb-2">Top hyperlocal matches for Yash</h2>
        <div className="grid md:grid-cols-3 gap-4">{top.map(j => <JobCard key={j.id} job={j} />)}</div>
        <Link to="/jobs" className="btn-ghost inline-block mt-4">View all 10 jobs →</Link>
      </div>
    </div>
  );
}
