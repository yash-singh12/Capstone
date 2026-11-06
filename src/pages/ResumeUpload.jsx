import { useState } from "react";
import { Link } from "react-router-dom";
import { DEMO_STUDENT } from "../data/mockData";

export default function ResumeUpload() {
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const start = () => { setParsing(true); setParsed(false); setTimeout(() => { setParsing(false); setParsed(true); }, 1800); };
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold">Resume Parsing — Semantic (mocked)</h1>
      <div className="card p-8 mt-3 text-center border-dashed">
        <div className="text-4xl">📄</div>
        <p className="font-bold mt-2">{DEMO_STUDENT.resumeFile}</p>
        <p className="text-xs text-slate-500">PDF / DOCX • FastAPI + Sentence-Transformers (simulated)</p>
        <button onClick={start} className="btn-primary mt-4 text-sm">{parsing ? "Parsing vectors… ⏳" : "Parse Resume (Demo)"}</button>
      </div>
      {parsed && (
        <div className="card p-5 mt-4">
          <div className="font-bold text-green-700">✓ Parsed for Yash Gupta, SSTC Bhilai</div>
          <div className="flex flex-wrap gap-1 mt-2">{DEMO_STUDENT.skills.map(s => <span key={s} className="chip bg-indigo-50 text-indigo-700">{s}</span>)}</div>
          <div className="text-sm mt-2">Projects: Next.js mess-menu app • Node fleet API • SQL reports for MSME</div>
          <div className="flex gap-2 mt-3"><Link to="/jobs" className="btn-primary text-sm">Find My Bhilai Matches →</Link></div>
        </div>
      )}
    </div>
  );
}
