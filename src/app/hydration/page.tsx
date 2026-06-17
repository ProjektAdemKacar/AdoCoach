"use client";

import { useStore } from "@/store/useStore";
import { CircularProgress } from "@/components/CircularProgress";
import { Button } from "@/components/ui/button";
import { Droplets, Plus } from "lucide-react";

const WATER_AMOUNTS = [
  { label: "Klein", amount: 150, emoji: "🥛" },
  { label: "Mittel", amount: 250, emoji: "🥤" },
  { label: "Groß", amount: 500, emoji: "🫗" },
  { label: "Flasche", amount: 750, emoji: "💧" },
];

export default function HydrationPage() {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const hydrationLog = useStore((s) => s.hydrationLog);
  const addWater = useStore((s) => s.addWater);

  const waterGoal = dailyPlan?.waterGoal ?? 2500;
  const waterConsumed = dailyPlan?.waterConsumed ?? 0;
  const remaining = Math.max(waterGoal - waterConsumed, 0);
  const isComplete = waterConsumed >= waterGoal;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground">Bleib hydriert</p>
        <h1 className="text-2xl font-bold mt-0.5">Wasser</h1>
      </div>

      {/* Main Ring */}
      <div className="glass rounded-2xl p-8 flex flex-col items-center animate-slide-up">
        <CircularProgress
          value={waterConsumed}
          max={waterGoal}
          size={180}
          strokeWidth={12}
          gradientId="water-progress"
          colorFrom="oklch(0.68 0.15 230)"
          colorTo="oklch(0.60 0.20 260)"
        >
          <Droplets className={`h-7 w-7 ${isComplete ? "text-cyan-400" : "text-cyan-500/60"}`} />
          <span className="text-3xl font-bold mt-1">
            {(waterConsumed / 1000).toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            von {(waterGoal / 1000).toFixed(1)} L
          </span>
        </CircularProgress>

        <p className="text-sm text-muted-foreground mt-5">
          {isComplete
            ? "🎉 Tagesziel erreicht! Weiter so!"
            : `Noch ${(remaining / 1000).toFixed(1)} L bis zum Ziel`}
        </p>
      </div>

      {/* Quick Add */}
      <div className="animate-slide-up">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
          Hinzufügen
        </p>
        <div className="grid grid-cols-4 gap-2">
          {WATER_AMOUNTS.map((item) => (
            <Button
              key={item.amount}
              variant="ghost"
              className="glass h-auto flex-col gap-1 py-3.5 rounded-xl hover:bg-cyan-500/10 hover:glow-sm transition-all"
              onClick={() => addWater(item.amount)}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
              <span className="text-[10px] text-muted-foreground">{item.amount}ml</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Log */}
      {hydrationLog.length > 0 && (
        <div className="animate-slide-up">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
            Verlauf
          </p>
          <div className="glass rounded-2xl divide-y divide-white/5">
            {[...hydrationLog].reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-muted-foreground font-mono text-xs">
                    {entry.time}
                  </span>
                </div>
                <span className="font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3 text-cyan-400" />
                  {entry.amount} ml
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
