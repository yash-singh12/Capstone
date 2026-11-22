import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SKILLS = ["Java", "Python", "JavaScript", "React", "Node.js", "SQL", "MongoDB", "Git", "TypeScript", "Docker", "Figma", "AWS"];

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "student",
    college: "Shri Shankaracharya Technical Campus (SSTC), Bhilai",
    branch: "", semester: "", roll: "", cgpa: "", home: "", commute: "", skills: [],
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleSkill = (skill) => set("skills", form.skills.includes(skill) ? form.skills.filter((item) => item !== skill) : [...form.skills, skill]);

  const submit = (event) => {
    event.preventDefault();
    setError("");
    try {
      register({ ...form, branch: form.semester ? `${form.branch}, ${form.semester} Sem` : form.branch });
      toast.success("Account created successfully.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-8">
      <form onSubmit={submit} className="card w-full max-w-2xl p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-extrabold">Create your profile</h1><p className="text-sm text-slate-500">Step {step} of 3</p></div>
          <div className="flex gap-1">{[1,2,3].map((item) => <div key={item} className={`h-2 w-8 rounded-full ${item <= step ? "bg-indigo-600" : "bg-slate-200"}`} />)}</div>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
        {step === 1 && <div className="grid md:grid-cols-2 gap-4 mt-6">
          <label className="text-sm font-medium">Full name<input required value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Email<input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Password<input required minLength={6} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Role<select value={form.role} onChange={(e) => set("role", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5"><option value="student">Student</option><option value="employer">Employer</option></select></label>
        </div>}
        {step === 2 && <div className="grid md:grid-cols-2 gap-4 mt-6">
          <label className="text-sm font-medium md:col-span-2">College<input required value={form.college} onChange={(e) => set("college", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Branch / Course<input required value={form.branch} onChange={(e) => set("branch", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" placeholder="B.Tech CSE" /></label>
          <label className="text-sm font-medium">Semester<input value={form.semester} onChange={(e) => set("semester", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" placeholder="7th" /></label>
          <label className="text-sm font-medium">Roll number<input value={form.roll} onChange={(e) => set("roll", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">CGPA<input required type="number" min="0" max="10" step="0.1" value={form.cgpa} onChange={(e) => set("cgpa", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Residential area<input value={form.home} onChange={(e) => set("home", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Commute status<input value={form.commute} onChange={(e) => set("commute", e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" placeholder="Day-scholar • 4.5 km" /></label>
        </div>}
        {step === 3 && <div className="mt-6">
          <p className="text-sm font-medium mb-3">Select your skills</p>
          <div className="flex flex-wrap gap-2">{SKILLS.map((skill) => <button type="button" key={skill} onClick={() => toggleSkill(skill)} className={`px-3 py-2 rounded-full text-sm border ${form.skills.includes(skill) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300"}`}>{skill}</button>)}</div>
        </div>}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost">Back</button> : <Link to="/login" className="text-sm text-indigo-600 font-semibold">Back to login</Link>}
          {step < 3 ? <button type="button" onClick={() => setStep(step + 1)} className="btn-primary">Continue</button> : <button type="submit" className="btn-primary">Create account</button>}
        </div>
      </form>
    </div>
  );
}
