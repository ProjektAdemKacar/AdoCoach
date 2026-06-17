"use client";

import { useStore } from "@/store/useStore";
import { CircularProgress } from "@/components/CircularProgress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Dumbbell,
  Timer,
  Trophy,
} from "lucide-react";

export default function SportPage() {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const toggleExercise = useStore((s) => s.toggleExercise);
  const toggleWorkout = useStore((s) => s.toggleWorkout);

  const workout = dailyPlan?.workout;

  if (!workout) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="gradient-sport rounded-2xl p-4 glow-sm mb-4">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold">Kein Workout geplant</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generiere einen Tagesplan für dein Workout
          </p>
        </div>
      </div>
    );
  }

  const completedExercises = workout.exercises.filter((e) => e.completed).length;
  const totalExercises = workout.exercises.length;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground">Dein Workout</p>
        <h1 className="text-2xl font-bold mt-0.5">Sport</h1>
      </div>

      {/* Workout Hero */}
      <div className="glass rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center gap-5">
          <CircularProgress
            value={completedExercises}
            max={totalExercises}
            size={100}
            strokeWidth={7}
            gradientId="workout-progress"
            colorFrom="oklch(0.72 0.19 165)"
            colorTo="oklch(0.60 0.18 145)"
          >
            {workout.completed ? (
              <Trophy className="h-6 w-6 text-yellow-400" />
            ) : (
              <>
                <span className="text-xl font-bold">{completedExercises}</span>
                <span className="text-[10px] text-muted-foreground">von {totalExercises}</span>
              </>
            )}
          </CircularProgress>
          <div className="flex-1">
            <p className="font-bold text-lg">{workout.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-400 border-0">
                <Timer className="h-3 w-3 mr-1" />
                {workout.duration} min
              </Badge>
              <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-400 border-0">
                <Dumbbell className="h-3 w-3 mr-1" />
                {totalExercises} Übungen
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-2 animate-slide-up">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Übungen
        </p>
        {workout.exercises.map((exercise, index) => (
          <button
            key={index}
            className="w-full text-left glass rounded-xl p-4 hover:bg-white/5 transition-all duration-200 group"
            onClick={() => toggleExercise(index)}
          >
            <div className="flex items-start gap-3">
              {exercise.completed ? (
                <div className="mt-0.5 shrink-0 rounded-full bg-emerald-500/20 p-1.5 animate-scale-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              ) : (
                <div className="mt-0.5 shrink-0 rounded-full border border-muted-foreground/30 p-1.5 group-hover:border-emerald-500/50 transition-colors">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <p className={`font-medium ${exercise.completed ? "line-through text-muted-foreground/60" : ""}`}>
                  {exercise.name}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                    {exercise.sets} Sätze
                  </span>
                  <span className="text-xs rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                    {exercise.reps} Wdh.
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1.5">
                  {exercise.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Complete Button */}
      {completedExercises === totalExercises && !workout.completed && (
        <Button
          className="w-full gradient-sport text-white border-0 rounded-xl h-12 font-semibold glow-sm hover:opacity-90 transition-opacity animate-slide-up"
          onClick={toggleWorkout}
        >
          <Trophy className="mr-2 h-5 w-5" />
          Workout abschließen
        </Button>
      )}

      {/* Completed State */}
      {workout.completed && (
        <div className="glass rounded-2xl p-6 text-center animate-scale-in glow-sm">
          <div className="inline-flex gradient-sport rounded-full p-3 mb-3">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold">Workout geschafft!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Super gemacht — du hast heute trainiert 💪
          </p>
        </div>
      )}
    </div>
  );
}
