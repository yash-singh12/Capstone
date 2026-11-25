import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = user?.role === "employer"
    ? [["Employer Dashboard", "/employer/dashboard"], ["Post a Job", "/employer/post-job"]]
    : [
      ["Dashboard", "/dashboard"],
      ["Jobs", "/jobs"],
      ["Applications", "/applications"],
      ["Upskilling", "/learn/TypeScript"],
      ["Mock Test", "/mock/pixelkraft-fe"],
    ];
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "ST";
  const signOut = () => {
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };
  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-extrabold text-lg text-indigo-700">PlaceLocal<span className="text-slate-500">.AI</span></Link>
        <span className="hidden sm:flex items-center text-xs text-slate-500 gap-1"><MapPin size={14}/> SSTC Junwani, Bhilai</span>
        <div className="ml-auto hidden md:flex gap-1 flex-wrap">
          {user && links.map(([l, h]) => (
            <Link key={h} to={h} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pathname.startsWith(h) ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}>{l}</Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 px-2 rounded-lg hover:bg-slate-100" title="Open profile">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white grid place-items-center text-xs font-bold">{initials}</div>
                <span className="hidden lg:block text-sm font-semibold text-slate-700">{user.name}</span>
              </Link>
              <button type="button" onClick={signOut} className="px-2 text-slate-500 hover:text-red-600" title="Sign out"><LogOut size={18} /></button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm">Login</Link>
          )}
        </div>
        <div className="ml-auto md:ml-0">
          {user?.role !== "employer" && <NotificationBell />}
        </div>
        <button type="button" onClick={() => setMenuOpen((open) => !open)} className="ml-0 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 md:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <div className={`md:hidden overflow-hidden border-t bg-white transition-all duration-300 ${menuOpen ? "max-h-[420px] opacity-100" : "max-h-0 border-transparent opacity-0"}`}>
        <div className="mx-auto max-w-6xl px-4 py-3">
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{initials}</div>
                <div><div className="text-sm font-bold text-slate-800">{user.name}</div><div className="text-xs text-slate-500">View and edit profile</div></div>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                {links.map(([label, href]) => <Link key={href} to={href} onClick={() => setMenuOpen(false)} className={`rounded-xl px-3 py-2.5 text-sm font-medium ${pathname.startsWith(href) ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-700"}`}>{label}</Link>)}
              </div>
              <button type="button" onClick={signOut} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600"><LogOut size={17} /> Sign out</button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" className="btn-primary text-center text-sm">Login</Link>
              <Link to="/register" className="btn-ghost text-center">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
