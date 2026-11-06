import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { COURSES_BY_SKILL } from "../data/mockData";
import { Play, FileText, CheckCircle } from "lucide-react";

export default function LearningPath() {
  const { skill = "TypeScript" } = useParams();
  const skills = Object.keys(COURSES_BY_SKILL);
  const cur = COURSES_BY_SKILL[skill] || COURSES_BY_SKILL.TypeScript;
  const [done, setDone] = useState([]);
  const toggle = (t) => setDone(d => d.includes(t) ? d.filter(x => x !== t) : [...d, t]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold">Adaptive Upskilling — Yash Gupta</h1>
      <p className="text-sm text-slate-500">Missing-skill pathways for PixelKraft Frontend Intern • Progress {done.length}/{(cur.videos.length + 1)}</p>
      <div className="flex gap-2 mt-3 flex-wrap">{skills.map(s => <Link key={s} to={`/learn/${s}`} className={`chip !px-4 !py-1.5 ${s === skill ? "!bg-indigo-600 text-white" : "bg-white border"}`}>{s}</Link>)}</div>
      <div className="card p-5 mt-4">
        <div className="flex justify-between flex-wrap gap-2"><div className="font-bold text-lg">{skill} • {cur.hours} • {cur.level}</div><Link to="/mock/pixelkraft-fe" className="btn-primary text-sm">Done? Take Mock →</Link></div>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {cur.videos.map(v => (
            <div key={v.title} className="border rounded-2xl p-3 flex gap-3">
              <div className="w-24 h-14 bg-slate-900 text-white rounded-xl grid place-items-center shrink-0"><Play size={20}/></div>
              <div className="text-sm"><b>{v.title}</b><div className="text-xs text-slate-500">{v.channel} • {v.duration} • {v.tag}</div>
              <div className="flex gap-2 mt-1"><a href={v.url} target="_blank" className="text-indigo-600 text-xs font-semibold">Watch →</a><button onClick={() => toggle(v.title)} className="text-xs flex items-center gap-1 text-green-700"><CheckCircle size={13}/> {done.includes(v.title) ? "Done ✓" : "Mark complete"}</button></div></div>
            </div>
          ))}
        </div>
        <div className="border rounded-2xl p-3 mt-3 text-sm flex items-center gap-2"><FileText size={16} className="text-indigo-600"/><a className="font-semibold text-indigo-700" href={cur.docs[0].url} target="_blank">{cur.docs[0].title} →</a><button onClick={() => toggle("docs")} className="ml-auto text-xs text-green-700">{done.includes("docs") ? "Done ✓" : "Mark complete"}</button></div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl mt-3 text-sm"><b>Hands-on task:</b> {cur.task}</div>
      </div>
    </div>
  );
}
