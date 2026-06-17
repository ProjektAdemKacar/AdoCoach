"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Moon } from "lucide-react";
import type { Reflection } from "@/types";

const MOODS = [
  { value: 1 as const, emoji: "😫", label: "Schlecht" },
  { value: 2 as const, emoji: "😕", label: "Mäßig" },
  { value: 3 as const, emoji: "😐", label: "Okay" },
  { value: 4 as const, emoji: "😊", label: "Gut" },
  { value: 5 as const, emoji: "🤩", label: "Super" },
];

interface ReflectionModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReflectionModal({ open, onClose }: ReflectionModalProps) {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const addReflection = useStore((s) => s.addReflection);
  const saveDayLog = useStore((s) => s.saveDayLog);
  const checkAchievements = useStore((s) => s.checkAchievements);

  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const tasksCompleted = dailyPlan?.schedule.filter((s) => s.completed).length ?? 0;
  const tasksTotal = dailyPlan?.schedule.length ?? 0;

  function handleSave() {
    const reflection: Reflection = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      mood,
      text,
      tasksCompleted,
      tasksTotal,
    };
    addReflection(reflection);
    saveDayLog();
    checkAchievements();
    setSaved(true);
    setTimeout(() => {
      onClose();
      setSaved(false);
      setMood(3);
      setText("");
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 card-elevated rounded-2xl p-6 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        {!saved ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="gradient-purple rounded-xl p-2.5">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Abend-Reflexion</h2>
                <p className="text-xs text-muted-foreground">Wie war dein Tag?</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Mood Selector */}
              <div>
                <p className="text-sm font-medium mb-3">Stimmung</p>
                <div className="flex justify-between">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        mood === m.value ? "bg-primary/20 scale-110" : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl bg-white/[0.03] p-3 text-center">
                  <p className="text-2xl font-bold">{tasksCompleted}/{tasksTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Aufgaben</p>
                </div>
                <div className="flex-1 rounded-xl bg-white/[0.03] p-3 text-center">
                  <p className="text-2xl font-bold">{Math.round(((dailyPlan?.waterConsumed ?? 0) / (dailyPlan?.waterGoal ?? 2500)) * 100)}%</p>
                  <p className="text-[10px] text-muted-foreground">Wasser</p>
                </div>
                <div className="flex-1 rounded-xl bg-white/[0.03] p-3 text-center">
                  <p className="text-2xl font-bold">{dailyPlan?.workout?.completed ? "✓" : "✗"}</p>
                  <p className="text-[10px] text-muted-foreground">Workout</p>
                </div>
              </div>

              {/* Journal */}
              <div>
                <p className="text-sm font-medium mb-2">Was nimmst du vom Tag mit?</p>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Was lief gut? Was möchtest du morgen besser machen?"
                  className="bg-white/[0.03] border-[#1A2332] resize-none"
                  rows={3}
                />
              </div>

              <Button
                className="w-full gradient-purple text-white border-0 rounded-xl h-11 font-semibold hover:opacity-90 transition-opacity"
                onClick={handleSave}
              >
                Tag abschließen
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 animate-scale-in">
            <span className="text-5xl">🌙</span>
            <p className="text-lg font-bold mt-3">Gute Nacht!</p>
            <p className="text-sm text-muted-foreground mt-1">Dein Tag wurde gespeichert</p>
          </div>
        )}
      </div>
    </div>
  );
}
