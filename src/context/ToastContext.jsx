import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const STYLES = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((type, message) => {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const toast = {
    success: (message) => notify("success", message),
    error: (message) => notify("error", message),
    info: (message) => notify("info", message),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-20 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map((item) => {
          const Icon = item.type === "success" ? CheckCircle2 : item.type === "error" ? AlertCircle : Info;
          return (
            <div key={item.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${STYLES[item.type]} animate-[fadeSlide_.2s_ease-out]`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{item.message}</p>
              <button type="button" onClick={() => dismiss(item.id)} className="opacity-60 hover:opacity-100" aria-label="Dismiss notification"><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
