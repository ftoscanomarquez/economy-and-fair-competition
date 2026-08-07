"use client";

import * as React from "react";
import type { Locale } from "@/lib/i18n";

export type AdminSession = { email: string } | null;

type GlobalState = {
  adminSession: AdminSession;
  locale: Locale;
  editMode: boolean;
  editLocale: Locale;
};

type GlobalContextValue = GlobalState & {
  setAdminSession: (session: AdminSession) => void;
  setEditMode: (value: boolean) => void;
  setEditLocale: (value: Locale) => void;
};

const GlobalContext = React.createContext<GlobalContextValue | null>(null);

export function GlobalProvider({
  children,
  locale,
  initialAdminSession = null,
}: {
  children: React.ReactNode;
  locale: Locale;
  initialAdminSession?: AdminSession;
}) {
  const [adminSession, setAdminSession] = React.useState<AdminSession>(initialAdminSession);
  const [editMode, setEditMode] = React.useState(false);
  const [editLocale, setEditLocale] = React.useState<Locale>(locale);

  const value = React.useMemo<GlobalContextValue>(
    () => ({ adminSession, locale, editMode, editLocale, setAdminSession, setEditMode, setEditLocale }),
    [adminSession, locale, editMode, editLocale]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobalContext() {
  const ctx = React.useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobalContext debe usarse dentro de GlobalProvider");
  return ctx;
}
