"use client";

import { useStore } from "@/store/useStore";
import { CircularProgress } from "@/components/CircularProgress";
import { Droplets, Plus } from "lucide-react";

const AMOUNTS = [
  { label: "Klein", amount: 150, emoji: "🥛" },
  { label: "Mittel", amount: 250, emoji: "🥤" },
  { label: "Groß", amount: 500, emoji: "🫗" },
  { label: "Flasche", amount: 750, emoji: "💧" },
];

export default function HydrationPage() {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const hydrationLog = useStore((s) => s.hydrationLog);
  const addWater = useStore((s) => s.addWater);

  const goal = dailyPlan?.waterGoal ?? 2500;
  const consumed = dailyPlan?.waterConsumed ?? 0;
  const remaining = Math.max(goal - consumed, 0);
  const done = consumed >= goal;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24 space-y-5">
      <div className="animate-fade-in">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Hydration</p>
        <h1 className="text-2xl font-bold mt-0.5">Wasser</h1>
      </div>

      <div className="card-elevated rounded-2xl p-8 flex flex-col items-center animate-slide-up">
        <CircularProgress value={consumed} max={goal} size={180} strokeWidth={12} gradientId="water-ring"
          colorFrom="#00E5FF" colorTo="#00B8D4" glowColor="rgba(0,229,255,0.4)">
          <Droplets className={`h-7 w-7 ${done ? "text-[#00E5FF]" : "text-[#00E5FF]/40"}`} />
          <span className="text-3xl font-black mt-1">{(consumed / 1000).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/ {(goal / 1000).toFixed(1)} L</span>
        </CircularProgress>
        <p className="text-sm text-muted-foreground mt-5">
          {done ? "🎉 Tagesziel erreicht!" : `Noch ${(remaining / 1000).toFixed(1)} L`}
        </p>
      </div>

      <div className="animate-slide-up">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 mb-3">Hinzufügen</h2>
        <div className="grid grid-cols-4 gap-2">
          {AMOUNTS.map((item) => (
            <button key={item.amount} onClick={() => addWater(item.amount)}
              className="card-dark rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/[0.03] hover:border-[#00E5FF]/30 transition-all active:scale-95">
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[10px] font-bold">{item.label}</span>
              <span className="text-[9px] text-muted-foreground">{item.amount}ml</span>
            </button>
          ))}
        </div>
      </div>

      {hydrationLog.length > 0 && (
        <div className="animate-slide-up">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 mb-3">Verlauf</h2>
          <div className="card-dark rounded-xl divide-y divide-[#1A2332]">
            {[...hydrationLog].reverse().map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
                  <span className="text-muted-foreground font-mono text-xs">{e.time}</span>
                </div>
                <span className="font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3 text-[#00E5FF]" />{e.amount} ml
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
