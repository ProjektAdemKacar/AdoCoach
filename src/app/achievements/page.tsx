"use client";

import { useStore } from "@/store/useStore";
import { Trophy } from "lucide-react";

export default function AchievementsPage() {
  const achievements = useStore((s) => s.achievements);

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground">Deine Erfolge</p>
        <h1 className="text-2xl font-bold mt-0.5">Achievements</h1>
      </div>

      {/* Summary */}
      <div className="card-dark rounded-xl p-5 text-center animate-slide-up">
        <div className="inline-flex gradient-neon rounded-2xl p-4 glow-neon mb-3">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <p className="text-3xl font-bold">{unlocked.length} / {achievements.length}</p>
        <p className="text-sm text-muted-foreground">Achievements freigeschaltet</p>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Freigeschaltet
          </p>
          {unlocked.map((a) => (
            <div key={a.id} className="card-dark rounded-xl p-4 flex items-center gap-3 glow-neon-sm">
              <span className="text-3xl">{a.icon}</span>
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
              <span className="text-[10px] text-neon font-medium">
                {new Date(a.unlockedAt!).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Noch gesperrt
          </p>
          {locked.map((a) => (
            <div key={a.id} className="card-dark rounded-xl p-4 flex items-center gap-3 opacity-50">
              <span className="text-3xl grayscale">{a.icon}</span>
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">🔒</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
