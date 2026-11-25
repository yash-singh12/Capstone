import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Sparkles } from "lucide-react";
import { useAuth, DEMO_PROFILE } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login, quickDemoLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const account = await login(form.email, form.password);
      toast.success("Login successful. Welcome back!");
      navigate(account.role === "employer" ? "/employer/dashboard" : location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      toast.error("Login failed.");
      setError(err.message || "Unable to sign in. Check your credentials and local backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const demo = () => {
    setForm({ email: DEMO_PROFILE.email, password: DEMO_PROFILE.password });
  };

  const demoLogin = async () => {
    try {
      await quickDemoLogin();
      toast.success("Demo profile loaded successfully.");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      setError(error.message || "Unable to load the demo profile. Check the local backend.");
      toast.error("Demo login failed.");
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-10">
      <form onSubmit={submit} className="card w-full max-w-md p-6 md:p-8">
        <div className="w-11 h-11 rounded-xl bg-indigo-100 grid place-items-center text-indigo-700"><LogIn size={22} /></div>
        <h1 className="text-2xl font-extrabold mt-4">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to your PlaceLocal.AI profile.</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
        <label className="block text-sm font-medium mt-5">Email
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5" placeholder="you@sstc.ac.in" />
        </label>
        <label className="block text-sm font-medium mt-4">Password
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5" placeholder="Your password" />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary w-full mt-5 disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
        <button type="button" onClick={demoLogin} className="btn-ghost w-full mt-3 flex items-center justify-center gap-2"><Sparkles size={16} /> Quick Demo Login</button>
        <button type="button" onClick={demo} className="text-xs text-indigo-600 w-full mt-2">Fill sample SSTC credentials</button>
        <p className="text-sm text-center text-slate-500 mt-5">New student? <Link className="text-indigo-600 font-semibold" to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
