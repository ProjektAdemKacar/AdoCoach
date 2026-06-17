"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { generateDailyPlan } from "@/lib/ai";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CircularProgress } from "@/components/CircularProgress";
import { ReflectionModal } from "@/components/ReflectionModal";
import { AchievementToast } from "@/components/AchievementToast";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/types";
import {
  Sparkles, RefreshCw, CheckCircle2, Circle, Loader2,
  Flame, Droplets, Dumbbell, UtensilsCrossed, Zap,
  Moon, BarChart3, Scale, Trophy, Quote, ChevronRight,
  Bell, TrendingUp, Clock,
} from "lucide-react";
import { requestNotificationPermission, scheduleWaterReminders } from "@/lib/notifications";

const catIcon: Record<string, React.ElementType> = {
  routine: Clock, meal: UtensilsCrossed, sport: Dumbbell,
  hydration: Droplets, task: Zap, rest: Moon,
};
const catColor: Record<string, string> = {
  routine: "text-blue-400", meal: "text-[#FF9100]", sport: "text-neon",
  hydration: "text-[#00E5FF]", task: "text-[#B388FF]", rest: "text-[#FF4081]",
};

export default function HomePage() {
  const profile = useStore((s) => s.profile);
  const dailyPlan = useStore((s) => s.dailyPlan);
  const isGenerating = useStore((s) => s.isGenerating);
  const geminiApiKey = useStore((s) => s.geminiApiKey);
  const streak = useStore((s) => s.streak);
  const setDailyPlan = useStore((s) => s.setDailyPlan);
  const setIsGenerating = useStore((s) => s.setIsGenerating);
  const toggleScheduleItem = useStore((s) => s.toggleScheduleItem);
  const updateStreak = useStore((s) => s.updateStreak);
  const checkAchievements = useStore((s) => s.checkAchievements);

  const [error, setError] = useState<string | null>(null);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window)
      setNotifEnabled(Notification.permission === "granted");
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const isToday = dailyPlan?.date === today;
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Guten Morgen" : currentHour < 18 ? "Guten Tag" : "Guten Abend";
  const isEvening = currentHour >= 19;

  useEffect(() => { updateStreak(); }, [updateStreak]);
  useEffect(() => {
    if (profile && geminiApiKey && !dailyPlan) handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    if (!profile || !geminiApiKey) return;
    setIsGenerating(true); setError(null);
    try {
      const plan = await generateDailyPlan(profile, geminiApiKey);
      setDailyPlan(plan);
      if (notifEnabled) scheduleWaterReminders();
      const a = checkAchievements(); if (a) setNewAchievement(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler");
    } finally { setIsGenerating(false); }
  }

  function handleToggle(id: string) {
    toggleScheduleItem(id);
    const a = checkAchievements(); if (a) setNewAchievement(a);
  }

  const clearAchievement = useCallback(() => setNewAchievement(null), []);
  const completedCount = dailyPlan?.schedule.filter((s) => s.completed).length ?? 0;
  const totalCount = dailyPlan?.schedule.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const mealsCompleted = dailyPlan?.meals.filter((m) => m.completed).length ?? 0;
  const mealsTotal = dailyPlan?.meals.length ?? 0;
  const waterPct = dailyPlan ? Math.min(Math.round(((dailyPlan.waterConsumed ?? 0) / (dailyPlan.waterGoal ?? 2500)) * 100), 100) : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24 space-y-5">
      <AchievementToast achievement={newAchievement} onDone={clearAchievement} />
      <ReflectionModal open={reflectionOpen} onClose={() => setReflectionOpen(false)} />

      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-3xl font-bold tracking-tight">{profile?.name ?? "Coach"}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, d. MMMM", { locale: de })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <Link href="/achievements" className="flex items-center gap-1.5 card-dark rounded-full px-3 py-1.5 hover:bg-white/5 transition-all">
              <Flame className="h-4 w-4 text-[#FF9100]" />
              <span className="text-sm font-bold">{streak}</span>
            </Link>
          )}
          <button onClick={handleGenerate} disabled={isGenerating} className="card-dark rounded-full h-9 w-9 flex items-center justify-center hover:bg-white/5 transition-all">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-neon" /> : <RefreshCw className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Generating */}
      {isGenerating && (
        <div className="card-elevated rounded-2xl p-10 flex flex-col items-center animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#00E676] blur-2xl opacity-20 animate-pulse" />
            <div className="relative gradient-neon rounded-full p-5">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
          </div>
          <p className="text-lg font-bold mt-6">Plane deinen Tag...</p>
          <p className="text-sm text-muted-foreground mt-1">KI erstellt deinen Plan</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card-dark rounded-2xl border-red-500/30 p-4 animate-fade-in">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={handleGenerate} className="mt-3 text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Erneut versuchen
          </button>
        </div>
      )}

      {/* Empty State */}
      {!dailyPlan && !isGenerating && !error && (
        <div className="card-elevated rounded-2xl p-10 flex flex-col items-center text-center animate-slide-up">
          <div className="gradient-neon rounded-2xl p-5 glow-neon">
            <Sparkles className="h-8 w-8 text-black" />
          </div>
          <p className="text-xl font-bold mt-6">Bereit für deinen Tag?</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Dein KI-Coach erstellt deinen Plan</p>
          <button onClick={handleGenerate} className="gradient-neon text-black font-bold rounded-xl px-8 h-12 glow-neon-sm hover:opacity-90 transition-opacity">
            Tag planen
          </button>
        </div>
      )}

      {/* Daily Plan */}
      {dailyPlan && !isGenerating && (
        <>
          {/* Main Progress Ring */}
          <div className="card-elevated rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-6">
              <CircularProgress value={completedCount} max={totalCount} size={110} strokeWidth={8} gradientId="main-ring">
                <span className="text-2xl font-black text-neon-glow">{progressPct}%</span>
                <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase">Erledigt</span>
              </CircularProgress>
              <div className="flex-1 space-y-3">
                {/* Weekday dots */}
                <div className="flex gap-1.5">
                  {["M","D","M","D","F","S","S"].map((d, i) => (
                    <div key={i} className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      i < (new Date().getDay() || 7) - 1 ? "gradient-neon text-black" : i === (new Date().getDay() || 7) - 1 ? "border-2 border-[#00E676] text-neon" : "bg-[#1A2332] text-muted-foreground"
                    }`}>
                      {i < (new Date().getDay() || 7) - 1 ? "✓" : d}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{completedCount} von {totalCount} Aufgaben</p>
                {dailyPlan.motivationQuote && (
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-2">
                    &ldquo;{dailyPlan.motivationQuote}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 animate-slide-up">
            <div className="card-dark rounded-xl p-3">
              <div className="flex items-center justify-between">
                <Flame className="h-4 w-4 text-[#FF9100]" />
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-xl font-black mt-2">
                {dailyPlan.meals.filter((m) => m.completed).reduce((s, m) => s + m.calories, 0)}
              </p>
              <p className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">kcal heute</p>
            </div>
            <div className="card-dark rounded-xl p-3">
              <div className="flex items-center justify-between">
                <Droplets className="h-4 w-4 text-[#00E5FF]" />
                <span className="text-[10px] text-[#00E5FF] font-bold">{waterPct}%</span>
              </div>
              <p className="text-xl font-black mt-2">
                {((dailyPlan.waterConsumed ?? 0) / 1000).toFixed(1)}L
              </p>
              <p className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">Wasser</p>
            </div>
            <div className="card-dark rounded-xl p-3">
              <div className="flex items-center justify-between">
                <Dumbbell className="h-4 w-4 text-neon" />
                {dailyPlan.workout?.completed && <CheckCircle2 className="h-3.5 w-3.5 text-neon" />}
              </div>
              <p className="text-xl font-black mt-2">{dailyPlan.workout?.completed ? "Done" : `${dailyPlan.workout?.duration ?? 0}m`}</p>
              <p className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">Workout</p>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-4 gap-2 animate-slide-up">
            {[
              { href: "/stats", icon: BarChart3, label: "Stats", color: "text-neon" },
              { href: "/tracker", icon: Scale, label: "Tracker", color: "text-[#00E5FF]" },
              { href: "/achievements", icon: Trophy, label: "Erfolge", color: "text-[#FF9100]" },
              { href: "#", icon: Moon, label: "Reflexion", color: "text-[#B388FF]", onClick: () => setReflectionOpen(true) },
            ].map((item) => (
              item.onClick ? (
                <button key={item.label} onClick={item.onClick} className="card-dark rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/5 transition-all">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase">{item.label}</span>
                </button>
              ) : (
                <Link key={item.label} href={item.href} className="card-dark rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/5 transition-all">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase">{item.label}</span>
                </Link>
              )
            ))}
          </div>

          {/* Notifications CTA */}
          {!notifEnabled && typeof window !== "undefined" && "Notification" in window && (
            <button onClick={async () => { const ok = await requestNotificationPermission(); setNotifEnabled(ok); if (ok) scheduleWaterReminders(); }}
              className="w-full card-dark rounded-xl p-3.5 flex items-center gap-3 hover:bg-white/5 transition-all animate-slide-up">
              <Bell className="h-4 w-4 text-[#00E5FF]" />
              <span className="flex-1 text-left text-xs font-medium">Erinnerungen aktivieren</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          {/* Evening Reflection */}
          {isEvening && !dailyPlan.eveningReflection && (
            <button onClick={() => setReflectionOpen(true)} className="w-full card-elevated rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all animate-slide-up glow-neon-sm">
              <div className="gradient-purple rounded-lg p-2"><Moon className="h-4 w-4 text-white" /></div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">Abend-Reflexion</p>
                <p className="text-[10px] text-muted-foreground">Schließe deinen Tag ab</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          {/* Outdated */}
          {!isToday && (
            <div className="card-dark border-[#FF9100]/30 rounded-xl p-3.5 animate-fade-in">
              <p className="text-xs text-[#FF9100]">Plan von {dailyPlan.date}</p>
              <button onClick={handleGenerate} className="text-xs text-[#FF9100] hover:text-[#FFB74D] mt-1 font-medium">Neuen Plan →</button>
            </div>
          )}

          {/* Schedule */}
          <div className="space-y-1.5 animate-slide-up">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tagesablauf</h2>
              <span className="text-[10px] text-muted-foreground">{completedCount}/{totalCount}</span>
            </div>
            {dailyPlan.schedule.map((item) => {
              const Icon = catIcon[item.category] ?? Zap;
              const color = catColor[item.category] ?? "text-muted-foreground";
              return (
                <button
                  key={item.id}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl card-dark hover:bg-white/[0.03] transition-all group"
                  onClick={() => handleToggle(item.id)}
                >
                  {item.completed ? (
                    <div className="shrink-0 rounded-full gradient-neon p-1 animate-scale-in">
                      <CheckCircle2 className="h-4 w-4 text-black" />
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full border border-[#1A2332] p-1 group-hover:border-[#00E676]/40 transition-colors">
                      <Circle className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${item.completed ? "line-through text-muted-foreground/40" : ""}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{item.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">{item.time}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
