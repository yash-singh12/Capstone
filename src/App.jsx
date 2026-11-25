import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import JobDetail from "./pages/JobDetail";
import LearningPath from "./pages/LearningPath";
import MockTest from "./pages/MockTest";
import ResumeUpload from "./pages/ResumeUpload";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ApplicationTracker from "./pages/ApplicationTracker";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";

const EmployerDashboard = lazy(() => import("./pages/employer/EmployerDashboard"));
const PostJob = lazy(() => import("./pages/employer/PostJob"));
const ApplicantReview = lazy(() => import("./pages/employer/ApplicantReview"));
const Jobs = lazy(() => import("./pages/Jobs"));

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/employer/dashboard" element={<ProtectedRoute requiredRole="employer"><Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">Loading employer portal…</div>}><EmployerDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/employer/post-job" element={<ProtectedRoute requiredRole="employer"><Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">Loading employer portal…</div>}><PostJob /></Suspense></ProtectedRoute>} />
          <Route path="/employer/jobs/:jobId/applicants" element={<ProtectedRoute requiredRole="employer"><Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">Loading employer portal…</div>}><ApplicantReview /></Suspense></ProtectedRoute>} />
          <Route path="/jobs" element={<Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">Loading jobs…</div>}><Jobs /></Suspense>} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/learn/:skill?" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
          <Route path="/mock/:jobId" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <footer className="text-center text-xs text-slate-400 py-6">PlaceLocal.AI • SSTC Bhilai • Local student profiles • Chhattisgarh placements</footer>
      </BrowserRouter>
    </ToastProvider>
  );
}
