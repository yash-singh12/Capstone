import { useEffect } from "react";
import { X } from "lucide-react";

export default function VideoModal({ video, onClose }) {
  useEffect(() => {
    if (!video) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${video.title} video player`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate font-bold">{video.title}</div>
            <div className="text-xs text-slate-500">{video.channel} • {video.tag}</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close video">
            <X size={20} />
          </button>
        </div>
        <div className="aspect-video bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
