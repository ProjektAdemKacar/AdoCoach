"use client";

import { useEffect, useState } from "react";
import type { Achievement } from "@/types";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

export function AchievementToast({ achievement, onDone }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 400);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="card-elevated rounded-2xl px-5 py-3 flex items-center gap-3 glow-neon shadow-2xl">
        <span className="text-3xl animate-bounce">{achievement.icon}</span>
        <div>
          <p className="text-sm font-bold text-neon">Achievement freigeschaltet!</p>
          <p className="text-xs font-semibold">{achievement.title}</p>
          <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}
