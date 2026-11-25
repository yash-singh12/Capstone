import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function formatNotificationDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function NotificationBell() {
  const { user, markAllNotificationsRead } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifications = Array.isArray(user?.notifications) ? user.notifications : [];
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  if (!user) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-700"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" aria-label="Notifications">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-bold text-slate-900">Notifications</h2>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              disabled={!unreadCount}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 disabled:cursor-default disabled:text-slate-400"
            >
              <CheckCheck size={14} /> Mark all as read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? notifications.map((notification) => (
              <div key={notification.id} className={`border-b border-slate-100 px-4 py-3 last:border-0 ${notification.read ? "bg-white" : "bg-indigo-50/60"}`}>
                <div className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-slate-300" : "bg-indigo-600"}`} />
                  <div>
                    <p className="text-sm text-slate-700">{notification.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatNotificationDate(notification.createdAt)}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">You&apos;re all caught up.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
