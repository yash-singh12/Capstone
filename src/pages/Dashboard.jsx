import { Link } from "react-router-dom";
import { useState } from "react";
import { JOBS, SSTC_COLLEGE, getGap } from "../data/mockData";
import MatchRing from "../components/MatchRing";
import JobCard from "../components/JobCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, updateUser, addActivity } = useAuth();
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const radius = user?.preferredRadius || 50;
  const skills = user?.skills || [];
  const corridorJobs = JOBS.map((job) => ({
    ...job,
    liveMatch: getGap(job.id, skills).matchPercent,
  })).filter((job) => job.distanceKm <= radius);
  const top = [...corridorJobs].sort((a, b) => b.liveMatch - a.liveMatch).slice(0, 3);
  const missingSkills = [...new Set(top.flatMap((job) => getGap(job.id, skills).missing.map((item) => item.skill)))];
  const averageMatch = corridorJobs.length
    ? Math.round(corridorJobs.reduce((sum, job) => sum + job.liveMatch, 0) / corridorJobs.length)
    : 0;
  const completedSkills = Array.isArray(user?.completedSkills) ? user.completedSkills : [];
  const moduleCount = completedSkills.length;
  const employability = Math.min(100, averageMatch + (moduleCount * 5));
  const mockCount = Array.isArray(user?.mockHistory) ? user.mockHistory.length : 0;
  const activity = Array.isArray(user?.activity) ? user.activity : [];
  const topJobsForCards = top.map((job) => ({ ...job, match: job.liveMatch }));
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "ST";
  const addSkill = (event) => {
    event.preventDefault();
    const skill = newSkill.trim();
    if (!skill || skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    updateUser({ skills: [...skills, skill] });
    addActivity(`Added ${skill} to verified skills`, "success");
    setNewSkill("");
    setAddingSkill(false);
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
      <div className="card p-5 md:col-span-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white grid place-items-center font-bold">{initials}</div>
          <div><div className="font-bold">{user?.name}</div><div className="text-xs text-slate-500">{user?.branch} • {user?.roll}<br/>{user?.college || SSTC_COLLEGE.name}</div></div>
        </div>
        <div className="text-xs text-slate-500 mt-2">{user?.home} • {user?.commute} • CGPA {user?.cgpa}</div>
        <div className="flex flex-wrap gap-1 mt-3">
          {skills.map(s => <span key={s} className="chip bg-indigo-50 text-indigo-700">{s}</span>)}
          {addingSkill ? (
            <form onSubmit={addSkill} className="flex items-center gap-1">
              <input autoFocus value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skill name" className="w-28 rounded-full border border-indigo-200 px-2 py-1 text-xs" />
              <button type="submit" className="chip bg-indigo-600 text-white">Add</button>
            </form>
          ) : (
            <button type="button" onClick={() => setAddingSkill(true)} className="chip border border-dashed border-indigo-300 text-indigo-700">+ Add Skill</button>
          )}
        </div>
        <Link to="/resume" className="btn-ghost block text-center mt-4 text-sm">Upload / Re-parse Resume</Link>
      </div>
      <div className="card p-5 flex items-center gap-5">
        <MatchRing value={employability} />
        <div><div className="font-bold">Employability Score</div><p className="text-sm text-slate-600">Live corridor average +5% per completed module ({moduleCount}).</p>
        <div className="flex gap-4 mt-2 text-sm"><span><b>{corridorJobs.length}</b> matches</span><span><b>{missingSkills.length}</b> skills missing</span><span><b>{mockCount}</b> mocks done</span></div></div>
      </div>
      <div className="card p-5">
        <div className="font-bold mb-2">Recent activity</div>
        {activity.length ? activity.map((item) => <div key={item.id} className="text-sm text-slate-600 border-b py-1.5 last:border-0">• {item.message}</div>) : <div className="text-sm text-slate-500">No recent activity yet.</div>}
      </div>
      <div className="md:col-span-3"><h2 className="font-bold text-lg mb-2">Top hyperlocal matches for {user?.name?.split(" ")[0] || "you"}</h2>
        <div className="grid md:grid-cols-3 gap-4">{topJobsForCards.map(j => <JobCard key={j.id} job={j} />)}</div>
        <Link to="/jobs" className="btn-ghost inline-block mt-4">View all 10 jobs →</Link>
      </div>
    </div>
  );
}
