"use client";

import { useStore } from "@/store/useStore";
import { MiniChart } from "@/components/MiniChart";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Droplets,
  Flame,
  Dumbbell,
  Moon,
  Scale,
  TrendingUp,
  Trophy,
} from "lucide-react";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function StatsPage() {
  const dayLogs = useStore((s) => s.dayLogs);
  const streak = useStore((s) => s.streak);
  const stats = useStore((s) => s.stats);
  const weightLog = useStore((s) => s.weightLog);
  const sleepLog = useStore((s) => s.sleepLog);
  const reflections = useStore((s) => s.reflections);

  const last7 = dayLogs.slice(-7);
  const waterData = last7.map((d) => d.waterPercent);
  const calorieData = last7.map((d) => d.caloriesConsumed);
  const moodData = reflections.slice(-7).map((r) => r.mood);
  const sleepData = sleepLog.slice(-7).map((s) => s.durationHours);
  const weightData = weightLog.slice(-7).map((w) => w.weight);

  const avgWater = waterData.length > 0 ? Math.round(waterData.reduce((a, b) => a + b, 0) / waterData.length) : 0;
  const avgSleep = sleepData.length > 0 ? (sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1) : "—";
  const workoutDays = last7.filter((d) => d.workoutDone).length;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground">Deine Woche</p>
        <h1 className="text-2xl font-bold mt-0.5">Statistiken</h1>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-3 gap-2 animate-slide-up">
        <div className="glass rounded-xl p-3 text-center">
          <Flame className="h-5 w-5 text-orange-400 mx-auto" />
          <p className="text-2xl font-bold mt-1">{streak}</p>
          <p className="text-[10px] text-muted-foreground">Tage Streak</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Dumbbell className="h-5 w-5 text-emerald-400 mx-auto" />
          <p className="text-2xl font-bold mt-1">{stats.workoutsCompleted}</p>
          <p className="text-[10px] text-muted-foreground">Workouts</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Trophy className="h-5 w-5 text-yellow-400 mx-auto" />
          <p className="text-2xl font-bold mt-1">{stats.waterGoalsReached}</p>
          <p className="text-[10px] text-muted-foreground">Wasserziele</p>
        </div>
      </div>

      {/* Water Chart */}
      <div className="glass rounded-2xl p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold">Hydration</span>
          </div>
          <Badge variant="secondary" className="bg-cyan-500/15 text-cyan-400 border-0 text-xs">
            Ø {avgWater}%
          </Badge>
        </div>
        {waterData.length > 0 ? (
          <>
            <MiniChart data={waterData} max={100} color="oklch(0.68 0.15 230)" height={70} />
            <div className="flex justify-between mt-2">
              {last7.map((d, i) => (
                <span key={i} className="text-[10px] text-muted-foreground">{DAYS[new Date(d.date).getDay() === 0 ? 6 : new Date(d.date).getDay() - 1] ?? ""}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Noch keine Daten</p>
        )}
      </div>

      {/* Calories Chart */}
      <div className="glass rounded-2xl p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold">Kalorien</span>
          </div>
        </div>
        {calorieData.length > 0 ? (
          <MiniChart data={calorieData} color="oklch(0.75 0.18 55)" height={70} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Noch keine Daten</p>
        )}
      </div>

      {/* Mood Chart */}
      {moodData.length > 0 && (
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold">Stimmung</span>
            </div>
          </div>
          <MiniChart data={moodData} max={5} color="oklch(0.65 0.22 290)" height={50} />
        </div>
      )}

      {/* Sleep */}
      {sleepData.length > 0 && (
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold">Schlaf</span>
            </div>
            <Badge variant="secondary" className="bg-indigo-500/15 text-indigo-400 border-0 text-xs">
              Ø {avgSleep}h
            </Badge>
          </div>
          <MiniChart data={sleepData} max={12} color="oklch(0.60 0.20 280)" height={50} />
        </div>
      )}

      {/* Weight */}
      {weightData.length > 0 && (
        <div className="glass rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-semibold">Gewicht</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{weightData[weightData.length - 1]} kg</span>
            </div>
          </div>
          <MiniChart data={weightData} color="oklch(0.72 0.19 165)" height={50} />
        </div>
      )}

      {/* Empty State */}
      {dayLogs.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center animate-fade-in">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">Noch keine Statistiken</p>
          <p className="text-xs text-muted-foreground mt-1">
            Schließe deinen ersten Tag mit der Abend-Reflexion ab, um Statistiken zu sehen
          </p>
        </div>
      )}
    </div>
  );
}
