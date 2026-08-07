"use client";

import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  type ToastVariant,
} from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  technicalDetail?: string;
};

type ToastItem = ToastInput & { id: string; open: boolean; showDetail: boolean };

type ToastContextValue = {
  notify: (input: ToastInput) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const notify = React.useCallback((input: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...input, id, open: true, showDetail: false }]);
  }, []);

  const setOpen = (id: string, open: boolean) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open } : t)));
  };

  const toggleDetail = (id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, showDetail: !t.showDetail } : t)));
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      <ToastProvider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            open={toast.open}
            onOpenChange={(open) => setOpen(toast.id, open)}
          >
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
            {toast.technicalDetail ? (
              <div className="mt-2">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => toggleDetail(toast.id)}
                >
                  {toast.showDetail ? "Ocultar detalle técnico" : "Ver detalle técnico"}
                </Button>
                {toast.showDetail ? (
                  <pre className="mt-2 overflow-x-auto rounded bg-ink/5 p-2 font-mono text-xs text-ink-soft">
                    {toast.technicalDetail}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de AppToastProvider");
  return ctx;
}
