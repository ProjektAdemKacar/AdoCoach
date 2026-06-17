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
import { Badge } from "@/components/ui/badge";
import type { Achievement } from "@/types";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Circle,
  Loader2,
  Flame,
  Droplets,
  Dumbbell,
  UtensilsCrossed,
  Zap,
  Moon,
  BarChart3,
  Scale,
  Trophy,
  Quote,
  ChevronRight,
  Bell,
} from "lucide-react";
import { requestNotificationPermission, scheduleWaterReminders } from "@/lib/notifications";

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  routine: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/15" },
  meal: { icon: UtensilsCrossed, color: "text-amber-400", bg: "bg-amber-500/15" },
  sport: { icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  hydration: { icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  task: { icon: Zap, color: "text-purple-400", bg: "bg-purple-500/15" },
  rest: { icon: Sparkles, color: "text-pink-400", bg: "bg-pink-500/15" },
};

const categoryLabels: Record<string, string> = {
  routine: "Routine", meal: "Essen", sport: "Sport", hydration: "Wasser", task: "Aufgabe", rest: "Ruhe",
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
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
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
    setIsGenerating(true);
    setError(null);
    try {
      const plan = await generateDailyPlan(profile, geminiApiKey);
      setDailyPlan(plan);
      if (notifEnabled) scheduleWaterReminders();
      const a = checkAchievements();
      if (a) setNewAchievement(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler bei der Plan-Generierung");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToggle(id: string) {
    toggleScheduleItem(id);
    const a = checkAchievements();
    if (a) setNewAchievement(a);
  }

  const clearAchievement = useCallback(() => setNewAchievement(null), []);

  const completedCount = dailyPlan?.schedule.filter((s) => s.completed).length ?? 0;
  const totalCount = dailyPlan?.schedule.length ?? 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      <AchievementToast achievement={newAchievement} onDone={clearAchievement} />
      <ReflectionModal open={reflectionOpen} onClose={() => setReflectionOpen(false)} />

      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold mt-0.5">{profile?.name ?? "Coach"}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(), "EEEE, d. MMMM", { locale: de })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <Link href="/achievements" className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5 hover:bg-white/5 transition-all">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-bold">{streak}</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={handleGenerate} disabled={isGenerating} className="rounded-full glass h-9 w-9">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Generating */}
      {isGenerating && (
        <div className="glass rounded-2xl p-8 flex flex-col items-center animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative gradient-primary rounded-full p-4">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          </div>
          <p className="text-lg font-semibold mt-5">Plane deinen Tag...</p>
          <p className="text-sm text-muted-foreground mt-1">KI erstellt deinen Plan</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 animate-fade-in">
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="ghost" size="sm" className="mt-3 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleGenerate}>
            <RefreshCw className="mr-2 h-4 w-4" /> Erneut versuchen
          </Button>
        </div>
      )}

      {/* Empty */}
      {!dailyPlan && !isGenerating && !error && (
        <div className="glass rounded-2xl p-8 flex flex-col items-center text-center animate-slide-up">
          <div className="gradient-primary rounded-2xl p-4 glow-primary">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold mt-5">Bereit für deinen Tag?</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Dein KI-Coach erstellt einen Plan nur für dich</p>
          <Button onClick={handleGenerate} className="gradient-primary text-white border-0 rounded-xl px-6 h-11 font-semibold glow-sm hover:opacity-90 transition-opacity">
            <Sparkles className="mr-2 h-4 w-4" /> Tag planen
          </Button>
        </div>
      )}

      {/* Daily Plan */}
      {dailyPlan && !isGenerating && (
        <>
          {/* Motivation Quote */}
          {dailyPlan.motivationQuote && (
            <div className="glass rounded-2xl p-4 animate-slide-up">
              <div className="flex gap-3">
                <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm italic leading-relaxed text-muted-foreground">{dailyPlan.motivationQuote}</p>
              </div>
            </div>
          )}

          {/* Progress + Stats */}
          <div className="glass rounded-2xl p-5 animate-slide-up">
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">{dailyPlan.greeting}</p>
            <div className="flex items-center justify-between">
              <CircularProgress value={completedCount} max={totalCount} size={90} strokeWidth={7} gradientId="day-progress">
                <span className="text-xl font-bold">{Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%</span>
                <span className="text-[10px] text-muted-foreground">erledigt</span>
              </CircularProgress>
              <div className="flex-1 ml-5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aufgaben</span>
                  <span className="font-medium">{completedCount}/{totalCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wasser</span>
                  <span className="font-medium">{((dailyPlan.waterConsumed ?? 0) / 1000).toFixed(1)}L / {((dailyPlan.waterGoal ?? 2500) / 1000).toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Workout</span>
                  <span className="font-medium">{dailyPlan.workout?.completed ? "Erledigt ✓" : "Offen"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-4 gap-2 animate-slide-up">
            <Link href="/stats" className="glass rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-white/5 transition-all">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Statistik</span>
            </Link>
            <Link href="/tracker" className="glass rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-white/5 transition-all">
              <Scale className="h-5 w-5 text-teal-400" />
              <span className="text-[10px] text-muted-foreground">Tracker</span>
            </Link>
            <Link href="/achievements" className="glass rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-white/5 transition-all">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-[10px] text-muted-foreground">Erfolge</span>
            </Link>
            <button onClick={() => setReflectionOpen(true)} className="glass rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-white/5 transition-all">
              <Moon className="h-5 w-5 text-purple-400" />
              <span className="text-[10px] text-muted-foreground">Reflexion</span>
            </button>
          </div>

          {/* Notification CTA */}
          {!notifEnabled && typeof window !== "undefined" && "Notification" in window && (
            <button
              onClick={async () => {
                const ok = await requestNotificationPermission();
                setNotifEnabled(ok);
                if (ok) scheduleWaterReminders();
              }}
              className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all animate-slide-up"
            >
              <div className="rounded-lg bg-blue-500/15 p-2">
                <Bell className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">Erinnerungen aktivieren</p>
                <p className="text-xs text-muted-foreground">Wasser, Mahlzeiten & Workout</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          {/* Evening Reflection CTA */}
          {isEvening && !dailyPlan.eveningReflection && (
            <button onClick={() => setReflectionOpen(true)} className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all animate-slide-up glow-sm">
              <div className="gradient-purple rounded-xl p-2.5">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">Zeit für deine Abend-Reflexion</p>
                <p className="text-xs text-muted-foreground">Schließe deinen Tag ab</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          {/* Outdated Warning */}
          {!isToday && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 animate-fade-in">
              <p className="text-sm text-amber-400">Plan von {dailyPlan.date} — neuen generieren?</p>
              <Button variant="ghost" size="sm" className="mt-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" onClick={handleGenerate}>Neuer Plan</Button>
            </div>
          )}

          {/* Schedule */}
          <div className="space-y-2 animate-slide-up">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Tagesablauf</h2>
            {dailyPlan.schedule.map((item) => {
              const config = categoryConfig[item.category] ?? categoryConfig.task;
              const Icon = config.icon;
              return (
                <button
                  key={item.id}
                  className="flex items-start gap-3 w-full text-left p-3 rounded-xl glass hover:bg-white/5 transition-all duration-200 group"
                  onClick={() => handleToggle(item.id)}
                >
                  {item.completed ? (
                    <div className="mt-0.5 shrink-0 rounded-full bg-emerald-500/20 p-1 animate-scale-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="mt-0.5 shrink-0 rounded-full border border-muted-foreground/30 p-1 group-hover:border-primary/50 transition-colors">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${config.bg} ${config.color} border-0`}>
                        <Icon className="h-3 w-3 mr-0.5" />{categoryLabels[item.category] ?? item.category}
                      </Badge>
                    </div>
                    <p className={`text-sm font-medium mt-1 transition-all ${item.completed ? "line-through text-muted-foreground/60" : ""}`}>{item.title}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
