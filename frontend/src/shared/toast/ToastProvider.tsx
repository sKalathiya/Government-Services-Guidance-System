import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ToastDismiss } from "./ToastDismiss";

export type ToastContextValue = {
  showSuccess: (message: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<{ message: string; id: string }[]>(
    [],
  );

  const showSuccess = useCallback((message: string) => {
    setMessages((prev) => [...prev, { message, id: crypto.randomUUID() }]);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  }, []);

  const value = useMemo(() => ({ showSuccess }), [showSuccess]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-card border border-line bg-surface shadow-card"
          >
            <ToastDismiss id={message.id} onDismiss={removeMessage} />
            <div
              aria-hidden="true"
              className="h-1 bg-linear-to-r from-brand via-accent to-highlight"
            />
            <div className="flex items-start gap-3 px-4 py-3">
              <p className="min-w-0 flex-1 text-sm font-medium text-ink">
                {message.message}
              </p>
              <button
                type="button"
                onClick={() => removeMessage(message.id)}
                className="shrink-0 text-sm font-semibold text-muted transition-colors hover:text-ink"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
