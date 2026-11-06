import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import LearningPath from "./pages/LearningPath";
import MockTest from "./pages/MockTest";
import ResumeUpload from "./pages/ResumeUpload";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/learn/:skill?" element={<LearningPath />} />
        <Route path="/mock/:jobId" element={<MockTest />} />
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <footer className="text-center text-xs text-slate-400 py-6">PlaceLocal.AI • SSTC Bhilai Demo • Yash Gupta • All data mocked, Chhattisgarh-specific</footer>
    </BrowserRouter>
  );
}
