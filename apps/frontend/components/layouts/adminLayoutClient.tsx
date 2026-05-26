"use client";

import { useState } from "react";
import AdminSidebar from "@/components/layouts/adminSidebar";
import AdminHeader from "@/components/layouts/adminHeader";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased text-black">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AdminHeader onMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-stone-50/50">{children}</main>
      </div>
    </div>
  );
}
