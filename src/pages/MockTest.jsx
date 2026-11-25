import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MOCK_BY_JOB, JOBS } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MockTest() {
  const { user, submitMock, addApplication } = useAuth();
  const toast = useToast();
  const { jobId } = useParams();
  const mock = MOCK_BY_JOB[jobId] || MOCK_BY_JOB["pixelkraft-fe"];
  const job = JOBS.find((item) => item.id === jobId);
  const application = user?.applications?.find((item) => item.jobId === (job?.id || jobId));
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [behavioral, setBehavioral] = useState("");
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const submittedRef = useRef(false);

  const score = mock.mcqs.filter((question, index) => answers[index] === question.ans).length;
  const percentage = Math.round((score / mock.mcqs.length) * 100);
  const ready = percentage >= 80;

  const saveAttempt = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitMock(jobId || job?.id, score, {
      total: mock.mcqs.length,
      percentage,
      behavioralResponse: behavioral,
    });
  }, [behavioral, job?.id, jobId, mock.mcqs.length, percentage, score, submitMock]);

  useEffect(() => {
    if (done) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setDone(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [done]);

  useEffect(() => {
    if (done) saveAttempt();
  }, [done, saveAttempt]);

  const submit = () => {
    saveAttempt();
    setDone(true);
    toast.success("Mock test submitted successfully.");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (done) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card p-8 text-center">
          <div className="text-5xl font-extrabold text-indigo-700">{score}/{mock.mcqs.length}</div>
          <div className="font-bold mt-1">MCQ Result</div>
          <div className="bg-slate-100 rounded-xl h-3 mt-4">
            <div className={`${ready ? "bg-green-600" : "bg-amber-500"} h-3 rounded-xl`} style={{ width: `${percentage}%` }} />
          </div>
          <p className={`mt-3 font-bold ${ready ? "text-green-700" : "text-amber-700"}`}>
            {percentage}% — {ready ? "Ready to Apply 🚀" : "Skill Gaps Detected 📚"}
          </p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {application ? (
              <Link to="/applications" className="btn-primary text-sm">Application submitted · Track status</Link>
            ) : (
              <button
                className="btn-primary text-sm"
                onClick={() => {
                  const company = job?.company || "Employer";
                  const submitted = addApplication(job?.id || jobId, company, job?.title || mock.title, percentage);
                  if (submitted) toast.success(`Application sent to ${company}.`);
                  else toast.info("You have already applied for this job.");
                }}
              >
                Submit Application
              </button>
            )}
            {!ready && (
              <Link to={`/learn/${mock.learning}`} className="btn-primary text-sm">View Recommended Learning</Link>
            )}
            <Link to="/jobs" className="btn-ghost text-sm">Back to Jobs</Link>
          </div>
        </div>

        <div className="card p-5 mt-4">
          <h2 className="font-bold">Question Review</h2>
          {mock.mcqs.map((question, index) => (
            <div key={question.q} className="border-t py-3 mt-2 text-sm">
              <b>Q{index + 1}. {question.q}</b>
              <p className="mt-1">
                Your choice: <span className={answers[index] === question.ans ? "font-semibold text-green-700" : "font-semibold text-red-600"}>
                  {answers[index] === undefined ? "Not answered" : question.opts[answers[index]]}
                </span>
              </p>
              {answers[index] !== question.ans && (
                <p>Correct answer: <b className="text-green-700">{question.opts[question.ans]}</b></p>
              )}
              <p className="mt-1 text-slate-600"><b>Why:</b> {question.why}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="card p-5">
        <div className="flex justify-between">
          <b>{mock.title}</b>
          <span className={`chip ${timeLeft < 60 ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Tailored to {job?.company || "the employer"} JD • {user?.name || "Student"} • SSTC
        </p>

        {mock.mcqs.map((question, index) => (
          <div key={question.q} className="border-t mt-3 pt-3 text-sm">
            <b>Q{index + 1}. {question.q}</b>
            {question.opts.map((option, optionIndex) => (
              <label key={option} className="flex gap-2 mt-1 cursor-pointer">
                <input
                  type="radio"
                  name={`q${index}`}
                  checked={answers[index] === optionIndex}
                  onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                />
                {option}
              </label>
            ))}
          </div>
        ))}

        <div className="border-t mt-3 pt-3 text-sm">
          <b>Regional Commitment:</b> {mock.hr}
          <textarea
            value={behavioral}
            onChange={(event) => setBehavioral(event.target.value)}
            rows={4}
            placeholder="Write your response..."
            className="mt-2 w-full rounded-xl border p-3"
          />
          <button
            type="button"
            onClick={() => setShowModelAnswer((shown) => !shown)}
            className="mt-2 text-xs font-semibold text-indigo-700"
          >
            {showModelAnswer ? "Hide" : "View"} model answer
          </button>
          {showModelAnswer && (
            <p className="mt-2 rounded-xl bg-indigo-50 p-3 text-xs text-slate-700">{mock.sampleHR}</p>
          )}
        </div>
        <button onClick={submit} className="btn-primary w-full mt-4">Submit Assessment</button>
      </div>
    </div>
  );
}
