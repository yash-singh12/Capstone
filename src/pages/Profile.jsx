import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SKILLS = ["Java", "Python", "JavaScript", "React", "Node.js", "SQL", "MongoDB", "Git", "TypeScript", "Docker", "Figma", "AWS"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    cgpa: user?.cgpa || "",
    commute: user?.commute || "",
    skills: user?.skills || [],
    resumeFile: user?.resumeFile || "",
  });

  const toggleSkill = (skill) => setForm((current) => ({
    ...current,
    skills: current.skills.includes(skill) ? current.skills.filter((item) => item !== skill) : [...current.skills, skill],
  }));

  const save = (event) => {
    event.preventDefault();
    updateUser(form);
    setSaved(true);
    toast.success("Profile changes saved.");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <form onSubmit={save} className="card p-6 mt-3">
        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-14 h-14 rounded-full bg-indigo-600 text-white grid place-items-center font-bold text-lg">{user?.name?.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase()}</div>
          <div><div className="font-bold">{user?.name}</div><div className="text-sm text-slate-500">{user?.email}</div></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <label className="text-sm font-medium">CGPA<input type="number" min="0" max="10" step="0.1" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Commute<input value={form.commute} onChange={(e) => setForm({ ...form, commute: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium md:col-span-2">Resume file<input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setForm({ ...form, resumeFile: e.target.files?.[0]?.name || "" })} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
        </div>
        <p className="text-sm font-medium mt-5 mb-3">Skills</p>
        <div className="flex flex-wrap gap-2">{SKILLS.map((skill) => <button type="button" key={skill} onClick={() => toggleSkill(skill)} className={`px-3 py-2 rounded-full text-sm border ${form.skills.includes(skill) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300"}`}>{skill}</button>)}</div>
        <div className="flex items-center gap-3 mt-6"><button className="btn-primary" type="submit">Save changes</button>{saved && <span className="text-sm text-green-700">Profile updated.</span>}</div>
      </form>
    </div>
  );
}
