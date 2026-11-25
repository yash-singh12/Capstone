import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, MapPin, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest(`/api/employer/jobs?employer_id=${encodeURIComponent(user.id)}`)
      .then((result) => {
        if (active) {
          setJobs(result);
          setError("");
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || "Unable to load your job postings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user.id]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-indigo-700">Employer portal</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome, {user.companyName || user.name}</h1>
          <p className="mt-1 text-sm text-slate-600">Post local openings and review ranked applicants.</p>
        </div>
        <Link to="/employer/post-job" className="btn-primary inline-flex w-fit items-center gap-2 text-sm">
          <BriefcaseBusiness size={16} /> Post a Job
        </Link>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Your job postings</h2>
          {!loading && <span className="text-sm text-slate-500">{jobs.length} active {jobs.length === 1 ? "job" : "jobs"}</span>}
        </div>
        {loading ? (
          <div className="card p-6 text-sm text-slate-500">Loading your postings…</div>
        ) : jobs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <article key={job.id} className="card flex flex-col gap-3 p-5">
                <div>
                  <span className="chip bg-indigo-50 text-indigo-700">{job.tag}</span>
                  <h3 className="mt-2 text-lg font-bold">{job.title}</h3>
                  <p className="text-sm text-slate-600">{job.company}</p>
                </div>
                <p className="flex items-center gap-2 text-sm text-slate-500"><MapPin size={15} />{job.address}</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                  <span className="flex items-center gap-1 text-sm text-slate-600"><Users size={15} />{job.applicant_count} applicants</span>
                  <Link to={`/employer/jobs/${job.id}/applicants`} className="btn-ghost text-sm">Review applicants</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <BriefcaseBusiness size={30} className="mx-auto text-slate-400" />
            <h3 className="mt-3 font-bold">No job postings yet</h3>
            <p className="mt-1 text-sm text-slate-500">Create your first opening for students in the local corridor.</p>
            <Link to="/employer/post-job" className="btn-primary mt-4 inline-block text-sm">Create a posting</Link>
          </div>
        )}
      </section>
    </main>
  );
}
