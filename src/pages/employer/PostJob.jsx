import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { apiRequest } from "../../utils/api";

const EMPTY_SKILL = { name: "", importance: "Medium", reason: "" };

export default function PostJob() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    company: user.companyName || "",
    tag: "MSME",
    address: "",
    latitude: "",
    longitude: "",
    salary: "",
    bus_route: "",
    desc: "",
  });
  const [skills, setSkills] = useState([{ ...EMPTY_SKILL }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateSkill = (index, field, value) => {
    setSkills((current) => current.map((skill, skillIndex) => (
      skillIndex === index ? { ...skill, [field]: value } : skill
    )));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const requiredSkills = skills.map((skill) => ({ ...skill, name: skill.name.trim(), reason: skill.reason.trim() }));
    if (requiredSkills.some((skill) => !skill.name || !skill.reason)) {
      setError("Enter a skill and its importance reason for each row.");
      return;
    }
    if (new Set(requiredSkills.map((skill) => skill.name.toLowerCase())).size !== requiredSkills.length) {
      setError("Each required skill can only be listed once.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/employer/jobs", {
        method: "POST",
        body: {
          ...form,
          employer_id: user.id,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          required_skills: requiredSkills,
        },
      });
      toast.success("Job posting created.");
      navigate("/employer/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Unable to create the job posting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/employer/dashboard" className="text-sm font-semibold text-indigo-700">← Employer dashboard</Link>
      <div className="mb-5 mt-3">
        <p className="text-sm font-semibold text-indigo-700">Employer portal</p>
        <h1 className="text-2xl font-extrabold">Post a local job</h1>
        <p className="mt-1 text-sm text-slate-600">Openings are stored in the local PlaceLocal database.</p>
      </div>

      <form onSubmit={submit} className="card space-y-5 p-5 md:p-6">
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <section>
          <h2 className="mb-3 font-bold">Job details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">Job title
              <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium">Company name
              <input required value={form.company} onChange={(event) => updateField("company", event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium">Sector tag
              <select value={form.tag} onChange={(event) => updateField("tag", event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5">
                <option>MSME</option><option>Startup</option><option>PSU-Vendor</option>
              </select>
            </label>
            <label className="text-sm font-medium">Salary / stipend
              <input required value={form.salary} onChange={(event) => updateField("salary", event.target.value)} placeholder="e.g. ₹12k stipend" className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium md:col-span-2">Address in Bhilai / Durg / Raipur
              <input required value={form.address} onChange={(event) => updateField("address", event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium">Latitude
              <input required type="number" step="any" min="-90" max="90" value={form.latitude} onChange={(event) => updateField("latitude", event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium">Longitude
              <input required type="number" step="any" min="-180" max="180" value={form.longitude} onChange={(event) => updateField("longitude", event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium md:col-span-2">Bus / transit route
              <input required value={form.bus_route} onChange={(event) => updateField("bus_route", event.target.value)} placeholder="e.g. Junwani → Supela → Civic Centre" className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium md:col-span-2">Job description
              <textarea required rows={4} value={form.desc} onChange={(event) => updateField("desc", event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
            </label>
          </div>
        </section>

        <section className="border-t pt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold">Required skills</h2>
              <p className="text-xs text-slate-500">Importance and reasons contribute to local candidate matching.</p>
            </div>
            <button type="button" onClick={() => setSkills((current) => [...current, { ...EMPTY_SKILL }])} className="btn-ghost inline-flex items-center gap-1 text-sm">
              <Plus size={15} /> Add skill
            </button>
          </div>
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_150px_1.5fr_auto]">
                <label className="text-xs font-semibold">Skill
                  <input required value={skill.name} onChange={(event) => updateSkill(index, "name", event.target.value)} placeholder="React" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" />
                </label>
                <label className="text-xs font-semibold">Importance
                  <select value={skill.importance} onChange={(event) => updateSkill(index, "importance", event.target.value)} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm font-normal">
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </label>
                <label className="text-xs font-semibold">Reason
                  <input required value={skill.reason} onChange={(event) => updateSkill(index, "reason", event.target.value)} placeholder="Used in daily frontend work" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" />
                </label>
                <button type="button" disabled={skills.length === 1} onClick={() => setSkills((current) => current.filter((_, skillIndex) => skillIndex !== index))} className="self-end rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label="Remove skill">
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end border-t pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:cursor-wait disabled:opacity-60">
            {saving ? "Publishing…" : "Publish job"}
          </button>
        </div>
      </form>
    </main>
  );
}
