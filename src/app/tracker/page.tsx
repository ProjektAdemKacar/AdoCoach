"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MiniChart } from "@/components/MiniChart";
import { Scale, Moon, Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { WeightEntry, SleepEntry } from "@/types";

const SLEEP_QUALITY = [
  { value: 1 as const, emoji: "😫", label: "Schlecht" },
  { value: 2 as const, emoji: "😕", label: "Mäßig" },
  { value: 3 as const, emoji: "😐", label: "Okay" },
  { value: 4 as const, emoji: "😊", label: "Gut" },
  { value: 5 as const, emoji: "😴", label: "Perfekt" },
];

export default function TrackerPage() {
  const weightLog = useStore((s) => s.weightLog);
  const sleepLog = useStore((s) => s.sleepLog);
  const profile = useStore((s) => s.profile);
  const addWeight = useStore((s) => s.addWeight);
  const addSleep = useStore((s) => s.addSleep);
  const checkAchievements = useStore((s) => s.checkAchievements);

  const [weightInput, setWeightInput] = useState(profile?.weight?.toString() ?? "");
  const [bedtime, setBedtime] = useState(profile?.sleepTime ?? "23:00");
  const [wakeTime, setWakeTime] = useState(profile?.wakeUpTime ?? "07:00");
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3);

  function handleAddWeight() {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) return;
    const entry: WeightEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      weight: w,
    };
    addWeight(entry);
    checkAchievements();
  }

  function handleAddSleep() {
    const [bH, bM] = bedtime.split(":").map(Number);
    const [wH, wM] = wakeTime.split(":").map(Number);
    let duration = (wH + wM / 60) - (bH + bM / 60);
    if (duration < 0) duration += 24;

    const entry: SleepEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      bedtime,
      wakeTime,
      quality: sleepQuality,
      durationHours: Math.round(duration * 10) / 10,
    };
    addSleep(entry);
  }

  const lastWeight = weightLog[weightLog.length - 1];
  const prevWeight = weightLog[weightLog.length - 2];
  const weightDiff = lastWeight && prevWeight ? lastWeight.weight - prevWeight.weight : null;
  const weightData = weightLog.slice(-10).map((w) => w.weight);

  const lastSleep = sleepLog[sleepLog.length - 1];
  const sleepData = sleepLog.slice(-10).map((s) => s.durationHours);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground">Tracke deinen Fortschritt</p>
        <h1 className="text-2xl font-bold mt-0.5">Tracker</h1>
      </div>

      {/* Weight Section */}
      <div className="card-dark rounded-xl p-5 space-y-4 animate-slide-up">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-teal-500/15 p-2">
            <Scale className="h-4 w-4 text-teal-400" />
          </div>
          <span className="font-semibold">Gewicht</span>
        </div>

        {lastWeight && (
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">{lastWeight.weight}</span>
            <span className="text-lg text-muted-foreground mb-1">kg</span>
            {weightDiff !== null && weightDiff !== 0 && (
              <span className={`flex items-center gap-0.5 text-sm mb-1.5 ${weightDiff < 0 ? "text-neon" : "text-red-400"}`}>
                {weightDiff < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)}
              </span>
            )}
          </div>
        )}

        {weightData.length > 1 && (
          <MiniChart data={weightData} color="oklch(0.72 0.19 165)" height={50} />
        )}

        <div className="flex gap-2">
          <Input
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Gewicht in kg"
            className="bg-white/[0.03] border-[#1A2332]"
          />
          <Button onClick={handleAddWeight} className="gradient-neon text-white border-0 shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {weightLog.length > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {[...weightLog].reverse().slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-xs text-muted-foreground font-mono">{entry.date}</span>
                <span className="font-medium">{entry.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sleep Section */}
      <div className="card-dark rounded-xl p-5 space-y-4 animate-slide-up">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500/15 p-2">
            <Moon className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="font-semibold">Schlaf</span>
        </div>

        {lastSleep && (
          <div className="flex items-end gap-3">
            <div>
              <span className="text-4xl font-bold">{lastSleep.durationHours}</span>
              <span className="text-lg text-muted-foreground ml-1">Stunden</span>
            </div>
            <span className="text-2xl mb-1">{SLEEP_QUALITY.find((q) => q.value === lastSleep.quality)?.emoji}</span>
          </div>
        )}

        {sleepData.length > 1 && (
          <MiniChart data={sleepData} max={12} color="oklch(0.60 0.20 280)" height={50} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Eingeschlafen</Label>
            <Input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="bg-white/[0.03] border-[#1A2332] mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Aufgewacht</Label>
            <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="bg-white/[0.03] border-[#1A2332] mt-1" />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Schlafqualität</p>
          <div className="flex justify-between">
            {SLEEP_QUALITY.map((q) => (
              <button
                key={q.value}
                onClick={() => setSleepQuality(q.value)}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all ${
                  sleepQuality === q.value ? "bg-indigo-500/20 scale-110" : "opacity-50 hover:opacity-80"
                }`}
              >
                <span className="text-xl">{q.emoji}</span>
                <span className="text-[9px] text-muted-foreground">{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleAddSleep} className="w-full card-dark hover:bg-white/[0.03] border-0">
          <Minus className="mr-2 h-4 w-4 rotate-90" />
          Schlaf eintragen
        </Button>
      </div>
    </div>
  );
}
