import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { COURSES_BY_SKILL } from "../data/mockData";
import { Play, FileText, CheckCircle, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import VideoModal from "../components/VideoModal";

export default function LearningPath() {
  const { user, completeModule, removeModule, completeSkillPath } = useAuth();
  const toast = useToast();
  const { skill = "TypeScript" } = useParams();
  const skills = Object.keys(COURSES_BY_SKILL);
  const cur = COURSES_BY_SKILL[skill] || COURSES_BY_SKILL.TypeScript;
  const activeSkill = COURSES_BY_SKILL[skill] ? skill : "TypeScript";
  const [activeVideo, setActiveVideo] = useState(null);

  const done = Array.isArray(user?.completedModules) ? user.completedModules : [];
  const completedSkills = Array.isArray(user?.completedSkills) ? user.completedSkills : [];
  const skillCompleted = completedSkills.includes(activeSkill);

  const itemKeys = [
    ...cur.videos.map((video) => `video:${activeSkill}:${video.title}`),
    `docs:${activeSkill}:${cur.docs[0].title}`,
    ...(cur.checklist || []).map((item) => `project:${activeSkill}:${item}`),
  ];
  const completedCount = itemKeys.filter((key) => done.includes(key)).length;
  const progress = itemKeys.length ? Math.round((completedCount / itemKeys.length) * 100) : 0;
  const pathComplete = itemKeys.every((key) => done.includes(key));

  useEffect(() => {
    if (pathComplete && !skillCompleted) {
      completeSkillPath(activeSkill);
      toast.success(`${activeSkill} skill path complete — employability increased by 5%!`);
    }
  }, [activeSkill, pathComplete, skillCompleted, completeSkillPath, toast]);

  const toggle = (key, label) => {
    if (done.includes(key)) {
      removeModule(key);
      toast.info(`${label} unchecked.`);
      return;
    }
    completeModule(key);
    toast.success(`${label} completed.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold">Adaptive Upskilling — {user?.name || "Student"}</h1>
      <p className="text-sm text-slate-500">Curated learning path • {completedCount}/{itemKeys.length} items complete</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex gap-2 mt-3 flex-wrap">
        {skills.map((item) => (
          <Link
            key={item}
            to={`/learn/${item}`}
            className={`chip !px-4 !py-1.5 ${item === activeSkill ? "!bg-indigo-600 text-white" : "bg-white border"}`}
          >
            {item}
            {completedSkills.includes(item) && " ✓"}
          </Link>
        ))}
      </div>

      <div className="card p-5 mt-4">
        <div className="flex justify-between flex-wrap gap-2">
          <div>
            <div className="font-bold text-lg">{activeSkill} • {cur.hours} • {cur.level}</div>
            <div className="text-xs text-slate-500">Difficulty: {cur.difficulty}</div>
          </div>
          <Link to={`/mock/pixelkraft-fe`} className="btn-primary text-sm">Take a Mock →</Link>
        </div>

        <h2 className="mt-5 font-bold">Video lessons</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          {cur.videos.map((video) => {
            const key = `video:${activeSkill}:${video.title}`;
            const checked = done.includes(key);
            return (
              <div key={video.title} className="border rounded-2xl p-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  className="w-24 h-14 bg-slate-900 text-white rounded-xl grid place-items-center shrink-0 hover:bg-indigo-700"
                  aria-label={`Watch ${video.title}`}
                >
                  <Play size={20} />
                </button>
                <div className="text-sm min-w-0">
                  <b>{video.title}</b>
                  <div className="text-xs text-slate-500">{video.channel} • {video.duration} • {video.tag}</div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setActiveVideo(video)} className="text-indigo-600 text-xs font-semibold">Watch in-app</button>
                    <button onClick={() => toggle(key, video.title)} className="text-xs flex items-center gap-1 text-green-700">
                      <CheckCircle size={13} /> {checked ? "Done ✓" : "Mark complete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mt-5 font-bold">Reading</h2>
        {cur.docs.map((doc) => {
          const key = `docs:${activeSkill}:${doc.title}`;
          const checked = done.includes(key);
          return (
            <div key={doc.title} className="border rounded-2xl p-3 mt-2 text-sm flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              <a className="font-semibold text-indigo-700" href={doc.url} target="_blank" rel="noreferrer">
                {doc.title} <ExternalLink size={12} className="inline" />
              </a>
              <button onClick={() => toggle(key, "Reading material")} className="ml-auto text-xs text-green-700">
                {checked ? "Done ✓" : "Mark complete"}
              </button>
            </div>
          );
        })}

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl mt-4 text-sm">
          <b>Hands-on mini-project:</b> {cur.task}
          <div className="mt-3 space-y-2">
            {cur.checklist.map((item) => {
              const key = `project:${activeSkill}:${item}`;
              const checked = done.includes(key);
              return (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(key, item)}
                  />
                  <span className={checked ? "line-through text-slate-500" : ""}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {pathComplete && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
            Skill path complete ✓
          </div>
        )}
      </div>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}
