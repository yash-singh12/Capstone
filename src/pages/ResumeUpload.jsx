import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResumeUpload() {
  const { user, updateUser } = useAuth();
  const inputRef = useRef(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const start = async () => {
    if (!fileName) {
      setError("Select a PDF resume first.");
      return;
    }

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Select a PDF resume first.");
      return;
    }

    setParsing(true);
    setParsed(false);
    setError("");

    try {
      const formData = new FormData();
      formData.append("student_id", user?.id || "");
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Resume parsing failed.");
      }

      setResult(data);
      updateUser({
        resumeFile: file.name,
        skills: data.skills,
      });
      setParsed(true);
    } catch (uploadError) {
      setError(uploadError.message || "Unable to connect to the local FastAPI server.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold">Resume Parsing — Semantic</h1>
      <div className="card p-8 mt-3 text-center border-dashed">
        <div className="text-4xl">📄</div>
        <p className="font-bold mt-2">{fileName || user?.resumeFile || "No resume uploaded"}</p>
        <p className="text-xs text-slate-500">PDF • FastAPI + local Sentence-Transformers</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="block mx-auto mt-4 text-sm"
          onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
        />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <button onClick={start} disabled={parsing} className="btn-primary mt-4 text-sm">
          {parsing ? "Parsing vectors… ⏳" : "Parse Resume"}
        </button>
      </div>
      {parsed && (
        <div className="card p-5 mt-4">
          <div className="font-bold text-green-700">✓ Profile parsed for {user?.name}, SSTC Bhilai</div>
          <div className="flex flex-wrap gap-1 mt-2">{result?.skills?.map(s => <span key={s} className="chip bg-indigo-50 text-indigo-700">{s}</span>)}</div>
          {result?.projects?.length > 0 && (
            <div className="text-sm mt-2">Projects: {result.projects.slice(0, 3).join(" • ")}</div>
          )}
          {result?.qualifications?.length > 0 && (
            <div className="text-sm mt-2">Qualifications: {result.qualifications.join(", ")}</div>
          )}
          <div className="flex gap-2 mt-3"><Link to="/jobs" className="btn-primary text-sm">Find My Bhilai Matches →</Link></div>
        </div>
      )}
    </div>
  );
}
