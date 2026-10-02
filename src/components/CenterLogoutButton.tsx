"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export default function CenterLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-brand disabled:opacity-70"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
      <span className="hidden sm:inline">Log Out</span>
    </button>
  );
}
