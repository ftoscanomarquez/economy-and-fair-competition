"use client";

import * as React from "react";
import { AdminToolbar } from "./admin-toolbar";
import { ManagementDrawer } from "./management-drawer";

export function AdminShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <>
      <AdminToolbar locale={locale} onOpenDrawer={() => setDrawerOpen(true)} />
      {children}
      <ManagementDrawer open={drawerOpen} onOpenChange={setDrawerOpen} locale={locale} />
    </>
  );
}
