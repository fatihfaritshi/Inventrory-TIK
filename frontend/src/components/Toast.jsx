import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// ==================== CONTEXT ====================
const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

// ==================== PROVIDER ====================
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const showToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((message, onConfirm, onCancel) => {
    setConfirmState({ message, onConfirm, onCancel });
  }, []);

  const handleConfirmYes = () => {
    confirmState?.onConfirm?.();
    setConfirmState(null);
  };

  const handleConfirmNo = () => {
    confirmState?.onCancel?.();
    setConfirmState(null);
  };

  const contextValue = { showToast, showConfirm };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none w-[380px] max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-sm bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_60px_-15px_rgba(239,68,68,0.2)] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-xl border border-red-400/20">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Konfirmasi</h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-white/80 text-sm leading-relaxed">{confirmState.message}</p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={handleConfirmNo}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmYes}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg transition"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ==================== TOAST ITEM ====================
const TOAST_CONFIG = {
  success: {
    icon: CheckCircleIcon,
    bg: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    progressColor: "bg-emerald-400",
    glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
  },
  error: {
    icon: XCircleIcon,
    bg: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    progressColor: "bg-red-400",
    glow: "shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bg: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    progressColor: "bg-yellow-400",
    glow: "shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]",
  },
  info: {
    icon: InformationCircleIcon,
    bg: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    progressColor: "bg-blue-400",
    glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
  },
};

function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);

    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        pointer-events-auto relative overflow-hidden
        bg-gradient-to-r ${config.bg}
        bg-[#0f172a]/90 backdrop-blur-2xl
        border ${config.border}
        rounded-xl ${config.glow}
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="flex-1 text-sm text-white/90 leading-relaxed whitespace-pre-line">
          {toast.message}
        </p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="h-[2px] w-full bg-white/5">
        <div
          className={`h-full ${config.progressColor} transition-all duration-100 ease-linear rounded-full opacity-60`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
