import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "placeLocal.session";
const USERS_KEY = "placeLocal.users";
const DEFAULT_COLLEGE = "Shri Shankaracharya Technical Campus (SSTC), Bhilai";

export const DEMO_PROFILE = {
  name: "Aman Sharma",
  email: "aman@sstc.ac.in",
  password: "student123",
  role: "student",
  branch: "B.Tech CSE, 7th Sem",
  roll: "SSTC/CS/2024/015",
  college: DEFAULT_COLLEGE,
  cgpa: 8.2,
  home: "Nehru Nagar, Bhilai",
  commute: "Day-scholar • 4.5 km from campus",
  skills: ["JavaScript", "React", "SQL", "Git", "Java", "Python"],
};

const HISTORY_DEFAULTS = {
  completedModules: [],
  mockHistory: [],
  applications: [],
  activity: [],
  preferredRadius: 50,
};

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function calculateEmployability({ cgpa = 0, skills = [], commute = "" }) {
  const cgpaScore = Math.min(Number(cgpa) / 10, 1) * 40;
  const skillScore = Math.min(skills.length / 8, 1) * 50;
  const commuteScore = /hostel|4\.[0-9]|[0-3]\.[0-9]|[0-3] km|walking/i.test(commute) ? 10 : 6;
  return Math.round(Math.min(100, cgpaScore + skillScore + commuteScore));
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function publicUser(user) {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

function ensureHistory(account, key) {
  return Array.isArray(account?.[key]) ? account[key] : HISTORY_DEFAULTS[key] || [];
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY);
      const sessionUser = readUsers().find((item) => item.id === sessionId);
      return publicUser(sessionUser);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, user.id);
  }, [user]);

  const register = (registration) => {
    const users = readUsers();
    if (users.some((item) => item.email.toLowerCase() === registration.email.toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }
    const employability = calculateEmployability(registration);
    const account = {
      ...registration,
      id: createId(),
      college: registration.college || DEFAULT_COLLEGE,
      cgpa: Number(registration.cgpa || 0),
      skills: registration.skills || [],
      employability,
      ...HISTORY_DEFAULTS,
      activity: [{ id: createId(), message: `Registered as ${registration.name}`, type: "success", createdAt: new Date().toISOString() }],
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, account]));
    localStorage.setItem(SESSION_KEY, account.id);
    setUser(publicUser(account));
    return publicUser(account);
  };

  const login = (email, password) => {
    const account = readUsers().find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!account || account.password !== password) throw new Error("Invalid email or password.");
    account.activity = ensureHistory(account, "activity");
    account.activity = [{ id: createId(), message: `Logged in as ${account.name}`, type: "info", createdAt: new Date().toISOString() }, ...account.activity].slice(0, 10);
    localStorage.setItem(USERS_KEY, JSON.stringify(readUsers().map((item) => item.id === account.id ? account : item)));
    localStorage.setItem(SESSION_KEY, account.id);
    setUser(publicUser(account));
    return publicUser(account);
  };

  const quickDemoLogin = () => {
    const users = readUsers();
    let account = users.find((item) => item.email === DEMO_PROFILE.email);
    if (!account) {
      account = {
        ...DEMO_PROFILE,
        id: createId(),
        employability: calculateEmployability(DEMO_PROFILE),
        ...HISTORY_DEFAULTS,
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, account]));
    }
    account.activity = ensureHistory(account, "activity");
    account.activity = [{ id: createId(), message: `Logged in as ${account.name}`, type: "info", createdAt: new Date().toISOString() }, ...account.activity].slice(0, 10);
    localStorage.setItem(USERS_KEY, JSON.stringify(readUsers().map((item) => item.id === account.id ? account : item)));
    localStorage.setItem(SESSION_KEY, account.id);
    setUser(publicUser(account));
    return publicUser(account);
  };

  const updateUser = (updates) => {
    if (!user) return null;
    const users = readUsers();
    const updated = users.find((item) => item.id === user.id);
    if (!updated) return null;
    const merged = {
      ...updated,
      ...updates,
      cgpa: updates.cgpa !== undefined ? Number(updates.cgpa) : updated.cgpa,
      skills: updates.skills || updated.skills || [],
    };
    merged.employability = calculateEmployability(merged);
    merged.activity = ensureHistory(merged, "activity");
    merged.activity = [{ id: createId(), message: "Updated profile details", type: "success", createdAt: new Date().toISOString() }, ...merged.activity].slice(0, 10);
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
    const safeUser = publicUser(merged);
    setUser(safeUser);
    return safeUser;
  };

  const addActivity = (message, type = "info") => {
    if (!user) return;
    const users = readUsers();
    const account = users.find((item) => item.id === user.id);
    if (!account) return;
    const activity = [{ id: createId(), message, type, createdAt: new Date().toISOString() }, ...ensureHistory(account, "activity")].slice(0, 10);
    const merged = { ...account, activity };
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
    setUser(publicUser(merged));
  };

  const completeModule = (moduleName) => {
    if (!user) return;
    const users = readUsers();
    const account = users.find((item) => item.id === user.id);
    if (!account) return;
    const completedModules = [...new Set([...ensureHistory(account, "completedModules"), moduleName])];
    const activity = [{ id: createId(), message: `Completed ${moduleName}`, type: "success", createdAt: new Date().toISOString() }, ...ensureHistory(account, "activity")].slice(0, 10);
    const merged = { ...account, completedModules, activity };
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
    setUser(publicUser(merged));
  };

  const removeModule = (moduleName) => {
    if (!user) return;
    const users = readUsers();
    const account = users.find((item) => item.id === user.id);
    if (!account) return;
    const completedModules = ensureHistory(account, "completedModules").filter((item) => item !== moduleName);
    const merged = { ...account, completedModules };
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
    setUser(publicUser(merged));
  };

  const completeSkillPath = (skill) => {
    if (!user) return;
    const users = readUsers();
    const account = users.find((item) => item.id === user.id);
    if (!account) return;
    const completedSkills = [...new Set([...ensureHistory(account, "completedSkills"), skill])];
    const completedModules = [...new Set([...ensureHistory(account, "completedModules"), skill])];
    const activity = [{ id: createId(), message: `Completed ${skill} learning path — employability +5%`, type: "success", createdAt: new Date().toISOString() }, ...ensureHistory(account, "activity")].slice(0, 10);
    const merged = { ...account, completedSkills, completedModules, activity };
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
    setUser(publicUser(merged));
  };

  const submitMock = (jobId, score, details = {}) => {
    if (!user) return;
    const users = readUsers();
    const account = users.find((item) => item.id === user.id);
    if (!account) return;
    const mockHistory = [...ensureHistory(account, "mockHistory").filter((item) => item.jobId !== jobId), {
      jobId,
      score,
      total: details.total || 5,
      percentage: details.percentage ?? score * 20,
      behavioralResponse: details.behavioralResponse || "",
      completedAt: new Date().toISOString(),
    }];
    const activity = [{ id: createId(), message: `Completed mock test for ${jobId}`, type: "success", completedAt: new Date().toISOString() }, ...ensureHistory(account, "activity")].slice(0, 10);
    const merged = { ...account, mockHistory, activity };
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
    setUser(publicUser(merged));
  };

  const addApplication = (jobId, company) => {
    if (!user) return;
    const users = readUsers();
    const account = users.find((item) => item.id === user.id);
    if (!account) return;
    if (!ensureHistory(account, "applications").some((item) => item.jobId === jobId)) {
      const applications = [...ensureHistory(account, "applications"), { jobId, company, appliedAt: new Date().toISOString() }];
      const activity = [{ id: createId(), message: `Applied to ${company}`, type: "success", createdAt: new Date().toISOString() }, ...ensureHistory(account, "activity")].slice(0, 10);
      const merged = { ...account, applications, activity };
      localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
      setUser(publicUser(merged));
    }
  };

  const setPreferredRadius = (radius) => {
    if (!user) return;
    const users = readUsers();
    const account = users.find((item) => item.id === user.id);
    if (!account) return;
    const merged = { ...account, preferredRadius: Number(radius) };
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.id === merged.id ? merged : item)));
    setUser(publicUser(merged));
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = { user, register, login, quickDemoLogin, updateUser, logout, addActivity, completeModule, removeModule, completeSkillPath, submitMock, addApplication, setPreferredRadius };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
