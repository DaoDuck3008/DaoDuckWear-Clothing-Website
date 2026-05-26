"use client";

import { ProfileSidebar } from "@/components/layouts/ProfileSidebar";
import ProfileHeader from "@/components/layouts/ProfileHeader";
import AuthGuard from "@/components/guards/authGuard";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden font-inter antialiased text-black">
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Header */}
          <ProfileHeader />

          {/* Scrollable Viewport - Full width container */}
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-stone-50/30">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
