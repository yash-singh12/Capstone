import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import LearningPath from "./pages/LearningPath";
import MockTest from "./pages/MockTest";
import ResumeUpload from "./pages/ResumeUpload";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";

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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/jobs" element={<Jobs />} />
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
