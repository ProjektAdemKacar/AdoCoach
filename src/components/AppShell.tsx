"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const profileCompleted = useStore((s) => s.profileCompleted);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !profileCompleted && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [hydrated, profileCompleted, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!profileCompleted && pathname !== "/onboarding") {
    return null;
  }

  const isOnboarding = pathname === "/onboarding";

  return (
    <>
      <main className="flex-1 pb-20">{children}</main>
      {!isOnboarding && <BottomNav />}
    </>
  );
}
