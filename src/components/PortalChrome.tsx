"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function PortalChrome({
  studentName,
  userId,
  isGuest,
  quote,
  children,
}: {
  studentName: string;
  userId: string;
  isGuest: boolean;
  quote: string;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar
        studentName={studentName}
        quote={quote}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          studentName={studentName}
          userId={userId}
          isGuest={isGuest}
          onMenuClick={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-24">{children}</main>
      </div>
    </div>
  );
}
