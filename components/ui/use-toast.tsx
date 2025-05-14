"use client";

import * as React from "react";
import { useEffect, useState } from "react";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, toasts[0].duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-lg transition-all duration-300 transform translate-y-0 ${
              t.variant === "destructive"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            }`}
          >
            {t.title && <div className="font-medium">{t.title}</div>}
            {t.description && <div className="text-sm mt-1">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export const toast = (props: ToastProps) => {
  // This is a dummy function that will be replaced at runtime
  console.warn("Toast called outside of provider context");
}; 