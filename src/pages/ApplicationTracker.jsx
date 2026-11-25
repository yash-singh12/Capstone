import { Link } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, ClipboardCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { JOBS } from "../data/mockData";

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
  const applications = Array.isArray(user?.applications) ? user.applications : [];
  const mockHistory = Array.isArray(user?.mockHistory) ? user.mockHistory : [];
  const sortedApplications = [...applications].sort(
    (first, second) => new Date(second.appliedAt).getTime() - new Date(first.appliedAt).getTime()
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-indigo-700">Your job search</p>
        <h1 className="text-2xl font-extrabold text-slate-900">Application Tracker</h1>
        <p className="mt-1 text-sm text-slate-600">Follow each application from submission through offer.</p>
      </div>

      {sortedApplications.length ? (
        <div className="space-y-4">
          {sortedApplications.map((application) => {
            const job = JOBS.find((item) => item.id === application.jobId);
            const mock = mockHistory.find((item) => item.jobId === application.jobId);
            const statusIndex = getStatusIndex(application.status);
            const status = PIPELINE[statusIndex];
            const score = application.readinessScore ?? mock?.percentage;

            return (
              <article key={application.jobId} className="card p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <Link to={`/jobs/${application.jobId}`} className="text-lg font-bold text-slate-900 hover:text-indigo-700">
                      {application.jobTitle || job?.title || "Job application"}
                    </Link>
                    <p className="text-sm text-slate-600">{application.company || job?.company || "Company unavailable"}</p>
                  </div>
                  <span className="chip w-fit bg-indigo-100 text-indigo-700">{status}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-400" />
                    Applied {formatAppliedDate(application.appliedAt)}
                  </p>
                  <p className="flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-slate-400" />
                    Mock test score: {score == null ? "Not available" : `${mock ? `${mock.score}/${mock.total} · ` : ""}${score}%`}
                  </p>
                </div>

                <ol aria-label={`Application status: ${status}`} className="mt-5 grid grid-cols-4 gap-2">
                  {PIPELINE.map((step, index) => (
                    <li key={step} className="min-w-0">
                      <div className={`mb-2 h-1.5 rounded-full ${index <= statusIndex ? "bg-indigo-600" : "bg-slate-200"}`} />
                      <span className={`block text-[11px] leading-tight sm:text-xs ${index === statusIndex ? "font-bold text-indigo-700" : "text-slate-500"}`}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
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
