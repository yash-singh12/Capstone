import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MOCK_BY_JOB, JOBS } from "../data/mockData";

export default function MockTest() {
  const { jobId } = useParams();
  const mock = MOCK_BY_JOB[jobId] || MOCK_BY_JOB["pixelkraft-fe"];
  const job = JOBS.find(j => j.id === jobId);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const [code, setCode] = useState("");
  const score = mock.mcqs.filter((m, i) => ans[i] === m.ans).length;
  if (done) return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="card p-8 text-center">
        <div className="text-5xl font-extrabold text-indigo-700">{score}/5</div>
        <div className="font-bold mt-1">MCQ Score + code reviewed (mocked)</div>
        <div className="text-sm text-slate-600 mt-2">Strong in React + REST. Gap: TypeScript generics. {code ? "Code submitted ✓" : "Code skipped — practice fetch + loading state."}</div>
        <div className="bg-slate-100 rounded-xl h-3 mt-4"><div className="bg-indigo-600 h-3 rounded-xl" style={{ width: `${(score / 5) * 100}%` }} /></div>
        <p className="text-xs mt-1">Readiness: {Math.round((score / 5) * 100)}% — {score >= 4 ? "Ready to Apply 🚀" : "Continue TypeScript path 📚"}</p>
        <div className="flex gap-2 justify-center mt-4 flex-wrap"><Link to="/learn/TypeScript" className="btn-ghost text-sm">Back to Learning</Link><button className="btn-primary text-sm" onClick={() => alert("Demo: application sent to " + (job?.company || "PixelKraft"))}>Apply Anyway (Demo)</button></div>
      </div>
      <div className="card p-4 mt-4 text-sm">{mock.mcqs.map((m, i) => <div key={i} className="border-b py-2 last:border-0">Q{i + 1}: {m.q}<br/><span className={ans[i] === m.ans ? "text-green-700" : "text-red-600"}>{ans[i] === m.ans ? "✓ Correct" : `✕ Correct: ${m.opts[m.ans]}`} — {m.why}</span></div>)}</div>
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="card p-5">
        <div className="flex justify-between"><b>{mock.title}</b><span className="chip bg-slate-900 text-white">⏱ {mock.time} (mock)</span></div>
        <p className="text-xs text-slate-500">Tailored to {job?.company || "PixelKraft"} JD • Yash Gupta • SSTC</p>
        {mock.mcqs.map((m, i) => (
          <div key={i} className="border-t mt-3 pt-3 text-sm"><b>Q{i + 1}. {m.q}</b>
            {m.opts.map((o, oi) => <label key={oi} className="flex gap-2 mt-1 cursor-pointer"><input type="radio" name={`q${i}`} checked={ans[i] === oi} onChange={() => setAns({ ...ans, [i]: oi })} />{o}</label>)}
          </div>
        ))}
        <div className="border-t mt-3 pt-3 text-sm"><b>Coding (mock):</b><pre className="bg-slate-900 text-green-300 text-xs p-3 rounded-xl mt-1 whitespace-pre-wrap">{mock.code}</pre>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={5} placeholder="function JobList() { ... }" className="w-full border rounded-xl p-2 mt-2 text-sm font-mono" /></div>
        <div className="border-t mt-3 pt-3 text-sm"><b>HR:</b> {mock.hr}<details className="text-xs text-slate-500 mt-1"><summary>View sample answer</summary>{mock.sampleHR}</details></div>
        <button onClick={() => setDone(true)} className="btn-primary w-full mt-4">Submit Mock (Demo)</button>
      </div>
    </div>
  );
}
