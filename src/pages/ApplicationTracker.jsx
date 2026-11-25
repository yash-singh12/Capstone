import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, ClipboardCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { JOBS } from "../data/mockData";
import { apiRequest } from "../utils/api";

const PIPELINE = ["Applied", "Under Review", "Interview Scheduled", "Selected / Offer"];
const STATUS_INDEX = {
  applied: 0,
  pending: 0,
  "under review": 1,
  under_review: 1,
  interview: 2,
  "interview scheduled": 2,
  interview_scheduled: 2,
  selected: 3,
  offer: 3,
  "selected / offer": 3,
};

function getStatusIndex(status) {
  return STATUS_INDEX[String(status || "Applied").trim().toLowerCase()] ?? 0;
}

function formatAppliedDate(date) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ApplicationTracker() {
  const { user } = useAuth();
  const [serverApplications, setServerApplications] = useState([]);
  const [syncError, setSyncError] = useState("");
  const applications = Array.isArray(user?.applications) ? user.applications : [];
  const mockHistory = Array.isArray(user?.mockHistory) ? user.mockHistory : [];
  useEffect(() => {
    let active = true;
    const refreshApplications = async () => {
      try {
        const result = await apiRequest(`/api/applications/student/${encodeURIComponent(user.id)}`);
        if (!active) return;
        setServerApplications(result.map((application) => ({
          jobId: application.job_id,
          jobTitle: application.title,
          company: application.company,
          appliedAt: application.applied_at,
          readinessScore: application.readiness_score,
          mockScore: application.mock_score,
          mockTotal: application.mock_total,
          status: application.status,
        })));
        setSyncError("");
      } catch (error) {
        if (active) setSyncError(error.message || "Unable to refresh application statuses.");
      }
    };
    refreshApplications();
    const timer = window.setInterval(refreshApplications, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user.id]);

  const applicationsByJob = new Map(applications.map((application) => [application.jobId, application]));
  serverApplications.forEach((application) => {
    applicationsByJob.set(application.jobId, {
      ...applicationsByJob.get(application.jobId),
      ...application,
    });
  });
  const sortedApplications = [...applicationsByJob.values()].sort(
    (first, second) => new Date(second.appliedAt).getTime() - new Date(first.appliedAt).getTime()
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-indigo-700">Your job search</p>
        <h1 className="text-2xl font-extrabold text-slate-900">Application Tracker</h1>
        <p className="mt-1 text-sm text-slate-600">Follow each application from submission through offer.</p>
        {syncError && <p role="status" className="mt-2 text-sm text-amber-700">Live status refresh unavailable: {syncError}</p>}
      </div>

      {sortedApplications.length ? (
        <div className="space-y-4">
          {sortedApplications.map((application) => {
            const job = JOBS.find((item) => item.id === application.jobId);
            const mock = mockHistory.find((item) => item.jobId === application.jobId);
            const statusIndex = getStatusIndex(application.status);
            const rejected = String(application.status).toLowerCase() === "rejected";
            const status = rejected ? "Rejected" : PIPELINE[statusIndex];
            const score = application.readinessScore ?? mock?.percentage;
            const mockScore = application.mockScore ?? mock?.score;
            const mockTotal = application.mockTotal ?? mock?.total;

            return (
              <article key={application.jobId} className="card p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <Link to={`/jobs/${application.jobId}`} className="text-lg font-bold text-slate-900 hover:text-indigo-700">
                      {application.jobTitle || job?.title || "Job application"}
                    </Link>
                    <p className="text-sm text-slate-600">{application.company || job?.company || "Company unavailable"}</p>
                  </div>
                  <span className={`chip w-fit ${rejected ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"}`}>{status}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-400" />
                    Applied {formatAppliedDate(application.appliedAt)}
                  </p>
                  <p className="flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-slate-400" />
                    Mock test score: {score == null ? "Not available" : `${mockScore != null && mockTotal ? `${mockScore}/${mockTotal} · ` : ""}${score}%`}
                  </p>
                </div>

                {!rejected && <ol aria-label={`Application status: ${status}`} className="mt-5 grid grid-cols-4 gap-2">
                  {PIPELINE.map((step, index) => (
                    <li key={step} className="min-w-0">
                      <div className={`mb-2 h-1.5 rounded-full ${index <= statusIndex ? "bg-indigo-600" : "bg-slate-200"}`} />
                      <span className={`block text-[11px] leading-tight sm:text-xs ${index === statusIndex ? "font-bold text-indigo-700" : "text-slate-500"}`}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="card px-6 py-12 text-center">
          <BriefcaseBusiness size={32} className="mx-auto text-slate-400" />
          <h2 className="mt-3 font-bold text-slate-800">No applications yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Complete a job-tailored mock test, then submit your application to start tracking its progress here.
          </p>
          <Link to="/jobs" className="btn-primary mt-5 inline-block text-sm">Explore jobs</Link>
        </section>
      )}
    </main>
  );
}
