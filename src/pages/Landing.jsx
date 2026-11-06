import { Link } from "react-router-dom";
import { MapPin, Brain, GraduationCap, ClipboardCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-indigo-600 to-violet-600 !border-0 text-white">
        <p className="text-sm opacity-80">SSTC Bhilai • CSVTU • Chhattisgarh Demo</p>
        <h1 className="!text-white text-4xl md:text-5xl font-extrabold mt-2">Hyperlocal Placements for<br/>SSTC Bhilai Students</h1>
        <p className="mt-3 opacity-90 max-w-2xl mx-auto">Semantic resume matching within 50km of Junwani campus → skill-gap diagnosis → YouTube + docs upskilling → job-tailored mock tests. No more ATS black holes.</p>
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <Link to="/dashboard" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl">Enter Student Demo — Yash Gupta</Link>
          <Link to="/jobs" className="border border-white/40 px-6 py-3 rounded-xl font-semibold">Browse Bhilai Jobs</Link>
        </div>
        <div className="flex gap-6 justify-center mt-6 text-sm opacity-90"><span>10 live demo jobs</span><span>•</span><span>Bhilai • Durg • Raipur</span><span>•</span><span>100% mocked</span></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {[
          [MapPin, "Hyperlocal Engine", "Radius 5/15/50km from SSTC. Supela 2.9km to Raipur IT Park 38km. Bus routes + commute times."],
          [Brain, "Semantic Skill-Gap Matrix", "Vector match React≈Next.js. Matched vs Missing with importance + reason, not keyword filter."],
          [GraduationCap, "Upskilling + Mock Suite", "Hindi + English YouTube, official docs, tasks. Job-specific mock test before Apply."],
        ].map(([Icon, t, d]) => (
          <div key={t} className="card p-5"><Icon className="text-indigo-600" /><div className="font-bold mt-2">{t}</div><p className="text-sm text-slate-600 mt-1">{d}</p></div>
        ))}
      </div>
      <div className="card p-5 mt-4 flex items-center gap-3 flex-wrap">
        <ClipboardCheck className="text-green-600" />
        <p className="text-sm"><b>Demo script (3 min):</b> Dashboard → Upload Resume → Jobs (move radius slider) → PixelKraft Job Detail (gap) → Learn TypeScript → Mock Test → Result. All data is dummy for SSTC.</p>
      </div>
    </div>
  );
}
