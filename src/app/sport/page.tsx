"use client";

import { useStore } from "@/store/useStore";
import { CircularProgress } from "@/components/CircularProgress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Dumbbell, Timer, Trophy, Zap } from "lucide-react";

export default function SportPage() {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const toggleExercise = useStore((s) => s.toggleExercise);
  const toggleWorkout = useStore((s) => s.toggleWorkout);
  const workout = dailyPlan?.workout;

  if (!workout) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="gradient-neon rounded-2xl p-5 glow-neon mb-5"><Dumbbell className="h-8 w-8 text-black" /></div>
          <p className="text-lg font-bold">Kein Workout geplant</p>
          <p className="text-sm text-muted-foreground mt-1">Generiere einen Tagesplan</p>
        </div>
      </div>
    );
  }

  const done = workout.exercises.filter((e) => e.completed).length;
  const total = workout.exercises.length;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24 space-y-5">
      <div className="animate-fade-in">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Workout</p>
        <h1 className="text-2xl font-bold mt-0.5">{workout.name}</h1>
      </div>

      <div className="card-elevated rounded-2xl p-6 flex items-center gap-5 animate-slide-up">
        <CircularProgress value={done} max={total} size={100} strokeWidth={7} gradientId="workout-ring">
          {workout.completed ? <Trophy className="h-6 w-6 text-[#FF9100]" /> : (
            <>
              <span className="text-xl font-black text-neon">{done}</span>
              <span className="text-[9px] text-muted-foreground">/ {total}</span>
            </>
          )}
        </CircularProgress>
        <div className="flex-1 space-y-2">
          <div className="flex gap-3">
            <span className="card-dark rounded-lg px-2.5 py-1 text-xs flex items-center gap-1"><Timer className="h-3 w-3 text-neon" />{workout.duration}m</span>
            <span className="card-dark rounded-lg px-2.5 py-1 text-xs flex items-center gap-1"><Zap className="h-3 w-3 text-[#FF9100]" />{total} Übungen</span>
          </div>
          {workout.completed && <p className="text-xs text-neon font-bold">Abgeschlossen ✓</p>}
        </div>
      </div>

      <div className="space-y-2 animate-slide-up">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Übungen</h2>
        {workout.exercises.map((ex, i) => (
          <button key={i} className="w-full card-dark rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-all group" onClick={() => toggleExercise(i)}>
            {ex.completed ? (
              <div className="shrink-0 rounded-full gradient-neon p-1 animate-scale-in"><CheckCircle2 className="h-4 w-4 text-black" /></div>
            ) : (
              <div className="shrink-0 rounded-full border border-[#1A2332] p-1 group-hover:border-neon/40 transition-colors"><Circle className="h-4 w-4 text-muted-foreground/40" /></div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${ex.completed ? "line-through text-muted-foreground/40" : ""}`}>{ex.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{ex.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-neon">{ex.sets}×{ex.reps}</p>
              <p className="text-[9px] text-muted-foreground">Sätze</p>
            </div>
          </button>
        ))}
      </div>

      {done === total && !workout.completed && (
        <Button className="w-full gradient-neon text-black font-bold rounded-xl h-12 glow-neon-sm hover:opacity-90 transition-opacity animate-slide-up" onClick={toggleWorkout}>
          <Trophy className="mr-2 h-5 w-5" /> Workout abschließen
        </Button>
      )}

      {workout.completed && (
        <div className="card-elevated rounded-2xl p-6 text-center glow-neon-sm animate-scale-in">
          <div className="inline-flex gradient-neon rounded-full p-3 mb-3"><Trophy className="h-8 w-8 text-black" /></div>
          <p className="text-lg font-bold">Workout geschafft!</p>
          <p className="text-sm text-muted-foreground mt-1">Starke Leistung 💪</p>
        </div>
      )}
    </div>
  );
}
