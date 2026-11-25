import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowDownUp, FileText, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { apiRequest } from "../../utils/api";

const STATUS_LABELS = {
  pending: "Applied",
  under_review: "Under Review",
  interview_scheduled: "Interview Scheduled",
  selected: "Selected / Offer",
  rejected: "Rejected",
};

export default function ApplicantReview() {
  const { user } = useAuth();
  const { jobId } = useParams();
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [sortBy, setSortBy] = useState("ranked");

  useEffect(() => {
    let active = true;
    const refresh = () => {
      Promise.all([
        apiRequest(`/api/employer/jobs?employer_id=${encodeURIComponent(user.id)}`),
        apiRequest(`/api/employer/jobs/${encodeURIComponent(jobId)}/applicants?employer_id=${encodeURIComponent(user.id)}`),
      ])
        .then(([jobs, candidates]) => {
          if (active) {
            setJob(jobs.find((item) => item.id === jobId) || null);
            setApplicants(candidates);
            setError("");
          }
        })
        .catch((loadError) => {
          if (active) setError(loadError.message || "Unable to load applicants for this posting.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [jobId, user.id]);

  const updateStatus = async (applicant, status) => {
    setUpdatingId(applicant.application_id);
    setError("");
    try {
      await apiRequest(`/api/applications/${encodeURIComponent(applicant.application_id)}/status`, {
        method: "PATCH",
        body: { status, employer_id: user.id },
      });
      setApplicants((current) => current.map((item) => (
        item.application_id === applicant.application_id ? { ...item, status } : item
      )));
      toast.success(status === "rejected" ? "Applicant rejected." : "Applicant shortlisted for interview.");
    } catch (updateError) {
      setError(updateError.message || "Unable to update this application.");
    } finally {
      setUpdatingId("");
    }
  };

  const sortedApplicants = [...applicants].sort((first, second) => {
    if (sortBy === "cgpa") return (second.cgpa || 0) - (first.cgpa || 0);
    if (sortBy === "readiness") return (second.readiness_score || 0) - (first.readiness_score || 0);
    return (second.match_percent || 0) - (first.match_percent || 0)
      || (second.readiness_score || 0) - (first.readiness_score || 0);
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Link to="/employer/dashboard" className="text-sm font-semibold text-indigo-700">← Employer dashboard</Link>
      <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-indigo-700">Applicant review</p>
          <h1 className="text-2xl font-extrabold">{job?.title || "Job applicants"}</h1>
          <p className="mt-1 text-sm text-slate-600">{job?.company || user.companyName}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <ArrowDownUp size={15} /> Sort by
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-lg border bg-white px-2 py-1.5">
            <option value="ranked">Match + readiness</option>
            <option value="readiness">Mock readiness</option>
            <option value="cgpa">CGPA</option>
          </select>
        </label>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="card mt-5 p-6 text-sm text-slate-500">Loading applicants…</div>
      ) : sortedApplicants.length ? (
        <div className="mt-5 space-y-3">
          {sortedApplicants.map((applicant) => {
            const resumeUrl = `http://127.0.0.1:8000/api/employer/jobs/${encodeURIComponent(jobId)}/applicants/${encodeURIComponent(applicant.student_id)}/resume?employer_id=${encodeURIComponent(user.id)}`;
            const isUpdating = updatingId === applicant.application_id;
            return (
              <article key={applicant.application_id} className="card p-5">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{applicant.name}</h2>
                      <span className={`chip ${applicant.status === "rejected" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                        {STATUS_LABELS[applicant.status] || applicant.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{applicant.branch || "Branch not provided"} • CGPA {applicant.cgpa ?? "N/A"}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={13} />
                      {applicant.commute_distance_km == null ? "Commute distance not provided" : `${applicant.commute_distance_km} km commute`}
                      {applicant.commute_mode ? ` · ${applicant.commute_mode}` : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    <div className="rounded-xl bg-indigo-50 px-3 py-2 text-center">
                      <div className="font-extrabold text-indigo-700">{applicant.match_percent}%</div>
                      <div className="text-[11px] text-slate-500">Skill match</div>
                    </div>
                    <div className="rounded-xl bg-green-50 px-3 py-2 text-center">
                      <div className="font-extrabold text-green-700">
                        {applicant.mock_score == null ? "N/A" : `${applicant.mock_score}/${applicant.mock_total}`}
                      </div>
                      <div className="text-[11px] text-slate-500">Mock MCQ score</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
                      <div className="font-extrabold text-slate-700">{applicant.readiness_score == null ? "N/A" : `${applicant.readiness_score}%`}</div>
                      <div className="text-[11px] text-slate-500">Readiness</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                  <button type="button" disabled={isUpdating || applicant.status === "interview_scheduled"} onClick={() => updateStatus(applicant, "interview_scheduled")} className="btn-primary text-sm disabled:opacity-50">
                    Shortlist for Interview
                  </button>
                  <button type="button" disabled={isUpdating || applicant.status === "rejected"} onClick={() => updateStatus(applicant, "rejected")} className="btn-ghost text-sm text-red-700 disabled:opacity-50">
                    Reject
                  </button>
                  {applicant.has_resume ? (
                    <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-1 text-sm">
                      <FileText size={15} /> View Resume
                    </a>
                  ) : (
                    <button type="button" disabled className="btn-ghost inline-flex cursor-not-allowed items-center gap-1 text-sm opacity-50">
                      <FileText size={15} /> Resume unavailable
                    </button>
                  )}
                  {isUpdating && <span className="self-center text-xs text-slate-500">Updating application…</span>}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card mt-5 p-8 text-center">
          <h2 className="font-bold">No applicants yet</h2>
          <p className="mt-1 text-sm text-slate-500">Applications will appear here as students submit for this job.</p>
        </div>
      )}
    </main>
  );
}
