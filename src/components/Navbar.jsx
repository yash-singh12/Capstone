import { Link, useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    ["Dashboard", "/dashboard"],
    ["Jobs", "/jobs"],
    ["Upskilling", "/learn/TypeScript"],
    ["Mock Test", "/mock/pixelkraft-fe"],
  ];
  return (
    <nav className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-extrabold text-lg text-indigo-700">PlaceLocal<span className="text-slate-500">.AI</span></Link>
        <span className="hidden sm:flex items-center text-xs text-slate-500 gap-1"><MapPin size={14}/> SSTC Junwani, Bhilai</span>
        <div className="ml-auto flex gap-1 flex-wrap">
          {links.map(([l, h]) => (
            <Link key={h} to={h} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${pathname.startsWith(h) ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}>{l}</Link>
          ))}
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white grid place-items-center text-xs font-bold ml-1">YG</div>
        </div>
      </div>
    </nav>
  );
}
