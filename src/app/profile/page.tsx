"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Key, UtensilsCrossed, Dumbbell, Flame, Droplets, Target, LogOut, ChevronRight } from "lucide-react";
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

  function startEdit() { setEditProfile({ ...profile! }); setIsEditing(true); }
  function saveChanges() {
    if (editProfile) setProfile(editProfile);
    setGeminiApiKey(apiKeyInput);
    setIsEditing(false); setEditProfile(null);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const waterPct = dailyPlan ? Math.round(((dailyPlan.waterConsumed ?? 0) / (dailyPlan.waterGoal ?? 2500)) * 100) : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24 space-y-5">
      {/* Profile Header */}
      <div className="card-elevated rounded-2xl p-5 flex items-center gap-4 animate-fade-in">
        <div className="gradient-neon rounded-full h-16 w-16 flex items-center justify-center text-2xl font-black text-black shrink-0 glow-neon-sm">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{profile.name}</h1>
          <p className="text-xs text-muted-foreground">{profile.age}J • {profile.weight}kg • {profile.height}cm</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs"><Flame className="h-3.5 w-3.5 text-[#FF9100]" /><span className="font-bold">{streak} Tage</span></span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 animate-slide-up">
        <div className="card-dark rounded-xl p-3 text-center">
          <Droplets className="h-4 w-4 text-[#00E5FF] mx-auto" />
          <p className="text-lg font-black mt-1">{waterPct}%</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Wasser</p>
        </div>
        <div className="card-dark rounded-xl p-3 text-center">
          <UtensilsCrossed className="h-4 w-4 text-[#FF9100] mx-auto" />
          <p className="text-lg font-black mt-1">{dailyPlan?.meals.filter((m) => m.completed).length ?? 0}/{dailyPlan?.meals.length ?? 0}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Meals</p>
        </div>
        <div className="card-dark rounded-xl p-3 text-center">
          <Dumbbell className="h-4 w-4 text-neon mx-auto" />
          <p className="text-lg font-black mt-1">{dailyPlan?.workout?.completed ? "✓" : "—"}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Workout</p>
        </div>
      </div>

      {/* Profile Info */}
      {!isEditing && (
        <div className="space-y-2 animate-slide-up">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Profil</h2>
          <button onClick={startEdit} className="w-full card-dark rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-all text-left">
            <User className="h-4 w-4 text-[#00E5FF]" />
            <div className="flex-1"><p className="text-xs font-bold">Persönliche Daten</p><p className="text-[10px] text-muted-foreground">{profile.wakeUpTime}-{profile.sleepTime}</p></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="card-dark rounded-xl p-4 flex items-center gap-3">
            <UtensilsCrossed className="h-4 w-4 text-[#FF9100]" />
            <div className="flex-1"><p className="text-xs font-bold">Ernährung</p><p className="text-[10px] text-muted-foreground">{profile.foodPreferences.diet}{profile.foodPreferences.dislikedFoods.length > 0 ? ` • Mag nicht: ${profile.foodPreferences.dislikedFoods.join(", ")}` : ""}</p></div>
          </div>
          <div className="card-dark rounded-xl p-4 flex items-center gap-3">
            <Dumbbell className="h-4 w-4 text-neon" />
            <div className="flex-1"><p className="text-xs font-bold">Sport</p><p className="text-[10px] text-muted-foreground">{profile.sportPreferences.location === "home" ? "Zuhause" : profile.sportPreferences.location === "gym" ? "Gym" : "Outdoor"} • {profile.sportPreferences.daysPerWeek}x/Woche</p></div>
          </div>
          {profile.goals.length > 0 && (
            <div className="card-dark rounded-xl p-4 flex items-start gap-3">
              <Target className="h-4 w-4 text-[#B388FF] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold mb-1">Ziele</p>
                <div className="flex flex-wrap gap-1">{profile.goals.map((g) => <Badge key={g} variant="secondary" className="text-[9px] bg-[#B388FF]/10 text-[#B388FF] border-0">{g}</Badge>)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit */}
      {isEditing && editProfile && (
        <div className="card-elevated rounded-2xl p-5 space-y-4 animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bearbeiten</p>
          <div><Label className="text-[10px] text-muted-foreground">Name</Label><Input value={editProfile.name} onChange={(e) => setEditProfile({...editProfile, name: e.target.value})} className="bg-[#111922] border-[#1A2332] mt-0.5" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label className="text-[10px] text-muted-foreground">Alter</Label><Input type="number" value={editProfile.age} onChange={(e) => setEditProfile({...editProfile, age: parseInt(e.target.value)||0})} className="bg-[#111922] border-[#1A2332] mt-0.5" /></div>
            <div><Label className="text-[10px] text-muted-foreground">Gewicht</Label><Input type="number" value={editProfile.weight} onChange={(e) => setEditProfile({...editProfile, weight: parseFloat(e.target.value)||0})} className="bg-[#111922] border-[#1A2332] mt-0.5" /></div>
            <div><Label className="text-[10px] text-muted-foreground">Größe</Label><Input type="number" value={editProfile.height} onChange={(e) => setEditProfile({...editProfile, height: parseInt(e.target.value)||0})} className="bg-[#111922] border-[#1A2332] mt-0.5" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] text-muted-foreground">Aufstehen</Label><Input type="time" value={editProfile.wakeUpTime} onChange={(e) => setEditProfile({...editProfile, wakeUpTime: e.target.value})} className="bg-[#111922] border-[#1A2332] mt-0.5" /></div>
            <div><Label className="text-[10px] text-muted-foreground">Schlafen</Label><Input type="time" value={editProfile.sleepTime} onChange={(e) => setEditProfile({...editProfile, sleepTime: e.target.value})} className="bg-[#111922] border-[#1A2332] mt-0.5" /></div>
          </div>
          <div><Label className="text-[10px] text-muted-foreground">Hinweise</Label><Textarea value={editProfile.customNotes} onChange={(e) => setEditProfile({...editProfile, customNotes: e.target.value})} className="bg-[#111922] border-[#1A2332] mt-0.5" rows={2} /></div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 card-dark border-0" onClick={() => {setIsEditing(false); setEditProfile(null);}}>Abbrechen</Button>
            <Button className="flex-1 gradient-neon text-black font-bold border-0" onClick={saveChanges}><Save className="mr-2 h-4 w-4" />Speichern</Button>
          </div>
        </div>
      )}

      {/* API Key */}
      <div className="card-dark rounded-xl p-4 space-y-2 animate-slide-up">
        <div className="flex items-center gap-2"><Key className="h-4 w-4 text-muted-foreground" /><p className="text-xs font-bold">API Key</p></div>
        <Input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="Gemini API Key" className="bg-[#111922] border-[#1A2332]" />
        {apiKeyInput !== geminiApiKey && <Button className="w-full gradient-neon text-black font-bold border-0" size="sm" onClick={saveChanges}>{saved ? "Gespeichert!" : "Speichern"}</Button>}
      </div>

      <button onClick={() => {setProfileCompleted(false); router.push("/onboarding");}} className="w-full card-dark rounded-xl p-3 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/5 transition-all text-xs font-medium">
        <LogOut className="h-4 w-4" /> Profil zurücksetzen
      </button>
    </div>
  );
}
