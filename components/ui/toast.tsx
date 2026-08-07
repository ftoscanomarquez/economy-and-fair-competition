"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-3 p-6",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export type ToastVariant = "default" | "error";

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { variant?: ToastVariant }
>(({ className, variant = "default", children, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex items-start gap-3 rounded-md border bg-surface-raised p-4 shadow-raised",
      "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out",
      "data-[swipe=end]:animate-out",
      variant === "error" ? "border-red-200" : "border-border",
      className
    )}
    {...props}
  >
    {variant === "error" ? (
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
    ) : (
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep" aria-hidden="true" />
    )}
    <div className="flex-1">{children}</div>
    <ToastPrimitive.Close
      className="shrink-0 rounded-sm text-ink-faint transition-colors duration-300 ease-institutional hover:text-ink"
      aria-label="Cerrar notificación"
    >
      <X className="h-4 w-4" aria-hidden="true" />
    </ToastPrimitive.Close>
  </ToastPrimitive.Root>
));
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn("text-sm font-semibold text-ink", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("mt-1 text-sm text-ink-soft", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export const ToastAction = ToastPrimitive.Action;
