"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Save,
  Key,
  UtensilsCrossed,
  Dumbbell,
  Flame,
  Droplets,
  Target,
  LogOut,
  ChevronRight,
} from "lucide-react";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const geminiApiKey = useStore((s) => s.geminiApiKey);
  const streak = useStore((s) => s.streak);
  const dailyPlan = useStore((s) => s.dailyPlan);
  const setProfile = useStore((s) => s.setProfile);
  const setGeminiApiKey = useStore((s) => s.setGeminiApiKey);
  const setProfileCompleted = useStore((s) => s.setProfileCompleted);

  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  function startEdit() {
    setEditProfile({ ...profile! });
    setIsEditing(true);
  }

  function saveChanges() {
    if (editProfile) setProfile(editProfile);
    setGeminiApiKey(apiKeyInput);
    setIsEditing(false);
    setEditProfile(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    setProfileCompleted(false);
    router.push("/onboarding");
  }

  const waterProgress = dailyPlan
    ? Math.round(((dailyPlan.waterConsumed ?? 0) / (dailyPlan.waterGoal ?? 2500)) * 100)
    : 0;
  const mealsCompleted = dailyPlan?.meals.filter((m) => m.completed).length ?? 0;
  const mealsTotal = dailyPlan?.meals.length ?? 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      {/* Profile Header */}
      <div className="glass rounded-2xl p-5 flex items-center gap-4 animate-fade-in">
        <div className="gradient-primary rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.age} Jahre • {profile.weight} kg • {profile.height} cm
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold">{streak} Tage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 animate-slide-up">
        <div className="glass rounded-xl p-3 text-center">
          <Droplets className="h-5 w-5 text-cyan-400 mx-auto" />
          <p className="text-lg font-bold mt-1">{waterProgress}%</p>
          <p className="text-[10px] text-muted-foreground">Wasser</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <UtensilsCrossed className="h-5 w-5 text-amber-400 mx-auto" />
          <p className="text-lg font-bold mt-1">{mealsCompleted}/{mealsTotal}</p>
          <p className="text-[10px] text-muted-foreground">Mahlzeiten</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Dumbbell className="h-5 w-5 text-emerald-400 mx-auto" />
          <p className="text-lg font-bold mt-1">{dailyPlan?.workout?.completed ? "✓" : "—"}</p>
          <p className="text-[10px] text-muted-foreground">Workout</p>
        </div>
      </div>

      {/* Info Cards */}
      {!isEditing && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Dein Profil
          </p>

          <button onClick={startEdit} className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all text-left">
            <div className="rounded-lg bg-blue-500/15 p-2">
              <User className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Persönliche Daten</p>
              <p className="text-xs text-muted-foreground">{profile.wakeUpTime} - {profile.sleepTime} • {profile.fitnessLevel === "beginner" ? "Anfänger" : profile.fitnessLevel === "intermediate" ? "Fortgeschritten" : "Profi"}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/15 p-2">
              <UtensilsCrossed className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Ernährung</p>
              <p className="text-xs text-muted-foreground">
                {profile.foodPreferences.diet === "normal" ? "Normal" : profile.foodPreferences.diet}
                {profile.foodPreferences.dislikedFoods.length > 0 && ` • Mag nicht: ${profile.foodPreferences.dislikedFoods.join(", ")}`}
              </p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/15 p-2">
              <Dumbbell className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Sport</p>
              <p className="text-xs text-muted-foreground">
                {profile.sportPreferences.location === "home" ? "Zuhause" : profile.sportPreferences.location === "gym" ? "Gym" : "Outdoor"}
                {" • "}{profile.sportPreferences.daysPerWeek}x/Woche, {profile.sportPreferences.minutesPerSession} min
              </p>
            </div>
          </div>

          {profile.goals.length > 0 && (
            <div className="glass rounded-xl p-4 flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/15 p-2">
                <Target className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1.5">Ziele</p>
                <div className="flex flex-wrap gap-1">
                  {profile.goals.map((g) => (
                    <Badge key={g} variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-400 border-0">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && editProfile && (
        <div className="glass rounded-2xl p-5 space-y-4 animate-fade-in">
          <p className="text-sm font-semibold">Profil bearbeiten</p>
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} className="bg-white/5 border-white/10" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Alter</Label>
              <Input type="number" value={editProfile.age} onChange={(e) => setEditProfile({ ...editProfile, age: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Gewicht</Label>
              <Input type="number" value={editProfile.weight} onChange={(e) => setEditProfile({ ...editProfile, weight: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Größe</Label>
              <Input type="number" value={editProfile.height} onChange={(e) => setEditProfile({ ...editProfile, height: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Aufstehen</Label>
              <Input type="time" value={editProfile.wakeUpTime} onChange={(e) => setEditProfile({ ...editProfile, wakeUpTime: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Schlafen</Label>
              <Input type="time" value={editProfile.sleepTime} onChange={(e) => setEditProfile({ ...editProfile, sleepTime: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fitnesslevel</Label>
            <Select value={editProfile.fitnessLevel} onValueChange={(v) => setEditProfile({ ...editProfile, fitnessLevel: v as UserProfile["fitnessLevel"] })}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Anfänger</SelectItem>
                <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                <SelectItem value="advanced">Profi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hinweise</Label>
            <Textarea value={editProfile.customNotes} onChange={(e) => setEditProfile({ ...editProfile, customNotes: e.target.value })} className="bg-white/5 border-white/10" rows={3} />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 glass" onClick={() => { setIsEditing(false); setEditProfile(null); }}>Abbrechen</Button>
            <Button className="flex-1 gradient-primary text-white border-0" onClick={saveChanges}>
              <Save className="mr-2 h-4 w-4" />Speichern
            </Button>
          </div>
        </div>
      )}

      {/* API Key */}
      <div className="glass rounded-xl p-4 space-y-3 animate-slide-up">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">API Key</p>
        </div>
        <Input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Gemini API Key"
          className="bg-white/5 border-white/10"
        />
        {apiKeyInput !== geminiApiKey && (
          <Button className="w-full gradient-primary text-white border-0" size="sm" onClick={saveChanges}>
            {saved ? "Gespeichert!" : "Key speichern"}
          </Button>
        )}
      </div>

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full glass text-red-400 hover:text-red-300 hover:bg-red-500/10"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Profil zurücksetzen
      </Button>
    </div>
  );
}
