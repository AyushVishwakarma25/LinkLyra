import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, action?: ToastAction, duration?: number) => string;
  success: (message: string, action?: ToastAction) => string;
  error: (message: string, action?: ToastAction) => string;
  warning: (message: string, action?: ToastAction) => string;
  info: (message: string, action?: ToastAction) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', action?: ToastAction, duration = 4000): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastItem = {
        id,
        type,
        message,
        duration,
        action,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep at most 5 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback((message: string, action?: ToastAction) => showToast(message, 'success', action), [showToast]);
  const error = useCallback((message: string, action?: ToastAction) => showToast(message, 'error', action, 6000), [showToast]);
  const warning = useCallback((message: string, action?: ToastAction) => showToast(message, 'warning', action, 5000), [showToast]);
  const info = useCallback((message: string, action?: ToastAction) => showToast(message, 'info', action), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  try {
    const ctx = useContext(ToastContext);
    if (!ctx) {
      return {
        toasts: [],
        showToast: () => '',
        success: () => '',
        error: () => '',
        warning: () => '',
        info: () => '',
        dismissToast: () => {},
      };
    }
    return ctx;
  } catch {
    return {
      toasts: [],
      showToast: () => '',
      success: () => '',
      error: () => '',
      warning: () => '',
      info: () => '',
      dismissToast: () => {},
    };
  }
}

/**
 * Visual Toast Notification Container
 */
const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        const borderColor = isError
          ? 'border-red-200 bg-red-50 text-red-900'
          : isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : isWarning
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : 'border-black/10 bg-white text-[#1C1E22] shadow-xl';

        const badgeColor = isError
          ? 'bg-red-500 text-white'
          : isSuccess
          ? 'bg-emerald-500 text-white'
          : isWarning
          ? 'bg-amber-500 text-white'
          : 'bg-[#5E4BF7] text-white';

        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg transition-all animate-fadeIn ${borderColor}`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${badgeColor}`}
            >
              {isError ? '!' : isSuccess ? '✓' : isWarning ? '!' : 'i'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-relaxed break-words">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    onDismiss(toast.id);
                  }}
                  className="mt-2 text-xs font-bold underline cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-black/40 hover:text-black/80 text-sm leading-none p-1 cursor-pointer shrink-0 transition-colors"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastProvider;
