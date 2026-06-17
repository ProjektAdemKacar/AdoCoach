"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  User,
  UtensilsCrossed,
  Dumbbell,
  Key,
} from "lucide-react";
import type { UserProfile } from "@/types";

const STEPS = [
  { icon: Sparkles, title: "Willkommen", gradient: "gradient-primary" },
  { icon: User, title: "Persönliches", gradient: "gradient-primary" },
  { icon: UtensilsCrossed, title: "Ernährung", gradient: "gradient-food" },
  { icon: Dumbbell, title: "Sport", gradient: "gradient-sport" },
  { icon: Key, title: "KI-Setup", gradient: "gradient-purple" },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  age: 25,
  weight: 75,
  height: 175,
  gender: "male",
  wakeUpTime: "07:00",
  sleepTime: "23:00",
  fitnessLevel: "beginner",
  goals: [],
  foodPreferences: { dislikedFoods: [], allergies: [], diet: "normal" },
  sportPreferences: { location: "home", daysPerWeek: 3, minutesPerSession: 30, preferredTypes: [] },
  customNotes: "",
};

const GOALS = ["Abnehmen", "Muskelaufbau", "Gesünder leben", "Mehr Energie", "Besser schlafen", "Stress abbauen", "Produktiver sein", "Mehr trinken"];
const SPORTS = ["Bodyweight", "Yoga", "HIIT", "Stretching", "Cardio", "Krafttraining", "Pilates", "Laufen"];

export default function OnboardingPage() {
  const router = useRouter();
  const setProfile = useStore((s) => s.setProfile);
  const setGeminiApiKey = useStore((s) => s.setGeminiApiKey);
  const existingKey = useStore((s) => s.geminiApiKey);

  const [step, setStep] = useState(0);
  const [profile, setP] = useState<UserProfile>(DEFAULT_PROFILE);
  const [apiKey, setApiKey] = useState(existingKey);
  const [dislikedInput, setDislikedInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");

  function up(u: Partial<UserProfile>) { setP((p) => ({ ...p, ...u })); }
  function toggleGoal(g: string) { setP((p) => ({ ...p, goals: p.goals.includes(g) ? p.goals.filter((x) => x !== g) : [...p.goals, g] })); }
  function toggleSport(s: string) { setP((p) => ({ ...p, sportPreferences: { ...p.sportPreferences, preferredTypes: p.sportPreferences.preferredTypes.includes(s) ? p.sportPreferences.preferredTypes.filter((x) => x !== s) : [...p.sportPreferences.preferredTypes, s] } })); }

  function addDisliked() {
    if (!dislikedInput.trim()) return;
    setP((p) => ({ ...p, foodPreferences: { ...p.foodPreferences, dislikedFoods: [...p.foodPreferences.dislikedFoods, dislikedInput.trim()] } }));
    setDislikedInput("");
  }
  function addAllergy() {
    if (!allergyInput.trim()) return;
    setP((p) => ({ ...p, foodPreferences: { ...p.foodPreferences, allergies: [...p.foodPreferences.allergies, allergyInput.trim()] } }));
    setAllergyInput("");
  }

  function finish() {
    setProfile(profile);
    setGeminiApiKey(apiKey);
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "gradient-primary" : "bg-white/10"}`} />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center animate-slide-up">
            <div className="inline-flex gradient-primary rounded-2xl p-5 glow-primary mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold">AdoCoach</h1>
            <p className="text-gradient text-lg font-semibold mt-1">Dein KI LifeCoach</p>
            <p className="text-sm text-muted-foreground mt-4 max-w-sm mx-auto">
              Von der Morgenroutine bis zum Einschlafen — dein persönlicher Coach plant deinen perfekten Tag.
            </p>
            <Button onClick={() => setStep(1)} className="mt-8 gradient-primary text-white border-0 rounded-xl px-8 h-12 text-base font-semibold glow-sm hover:opacity-90 transition-opacity">
              Los geht&apos;s <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <h2 className="text-xl font-bold">Über dich</h2>
              <p className="text-sm text-muted-foreground mt-1">Damit dein Coach dich kennenlernt</p>
            </div>
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={profile.name} onChange={(e) => up({ name: e.target.value })} placeholder="Dein Name" className="bg-white/5 border-white/10 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Alter</Label>
                  <Input type="number" value={profile.age} onChange={(e) => up({ age: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Geschlecht</Label>
                  <Select value={profile.gender} onValueChange={(v) => up({ gender: v as UserProfile["gender"] })}>
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Männlich</SelectItem>
                      <SelectItem value="female">Weiblich</SelectItem>
                      <SelectItem value="other">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Gewicht (kg)</Label>
                  <Input type="number" value={profile.weight} onChange={(e) => up({ weight: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Größe (cm)</Label>
                  <Input type="number" value={profile.height} onChange={(e) => up({ height: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Aufstehen</Label>
                  <Input type="time" value={profile.wakeUpTime} onChange={(e) => up({ wakeUpTime: e.target.value })} className="bg-white/5 border-white/10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Schlafen</Label>
                  <Input type="time" value={profile.sleepTime} onChange={(e) => up({ sleepTime: e.target.value })} className="bg-white/5 border-white/10 mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Fitnesslevel</Label>
                <Select value={profile.fitnessLevel} onValueChange={(v) => up({ fitnessLevel: v as UserProfile["fitnessLevel"] })}>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Anfänger</SelectItem>
                    <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                    <SelectItem value="advanced">Profi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Deine Ziele</Label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button key={g} onClick={() => toggleGoal(g)} className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${profile.goals.includes(g) ? "gradient-primary text-white glow-sm" : "glass text-muted-foreground hover:text-foreground"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Food */}
        {step === 2 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <h2 className="text-xl font-bold">Ernährung</h2>
              <p className="text-sm text-muted-foreground mt-1">Was du magst und was nicht</p>
            </div>
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Ernährungsweise</Label>
                <Select value={profile.foodPreferences.diet} onValueChange={(v) => up({ foodPreferences: { ...profile.foodPreferences, diet: v as UserProfile["foodPreferences"]["diet"] } })}>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (Alles)</SelectItem>
                    <SelectItem value="vegetarian">Vegetarisch</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="lowcarb">Low Carb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Was magst du NICHT?</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={dislikedInput} onChange={(e) => setDislikedInput(e.target.value)} placeholder="z.B. Gemüse, Pilze..." className="bg-white/5 border-white/10" onKeyDown={(e) => e.key === "Enter" && addDisliked()} />
                  <Button onClick={addDisliked} variant="ghost" size="icon" className="glass shrink-0">+</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.foodPreferences.dislikedFoods.map((f) => (
                    <Badge key={f} variant="secondary" className="cursor-pointer bg-red-500/10 text-red-400 border-0 hover:bg-red-500/20" onClick={() => setP((p) => ({ ...p, foodPreferences: { ...p.foodPreferences, dislikedFoods: p.foodPreferences.dislikedFoods.filter((x) => x !== f) } }))}>
                      {f} ✕
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Allergien</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} placeholder="z.B. Laktose, Nüsse..." className="bg-white/5 border-white/10" onKeyDown={(e) => e.key === "Enter" && addAllergy()} />
                  <Button onClick={addAllergy} variant="ghost" size="icon" className="glass shrink-0">+</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.foodPreferences.allergies.map((a) => (
                    <Badge key={a} variant="secondary" className="cursor-pointer bg-amber-500/10 text-amber-400 border-0 hover:bg-amber-500/20" onClick={() => setP((p) => ({ ...p, foodPreferences: { ...p.foodPreferences, allergies: p.foodPreferences.allergies.filter((x) => x !== a) } }))}>
                      {a} ✕
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sonstige Hinweise</Label>
                <Textarea value={profile.customNotes} onChange={(e) => up({ customNotes: e.target.value })} placeholder="z.B. Ich mag kein Gemüse, esse gerne deftig..." className="bg-white/5 border-white/10 mt-1" rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sport */}
        {step === 3 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <h2 className="text-xl font-bold">Sport & Bewegung</h2>
              <p className="text-sm text-muted-foreground mt-1">Wie und wo du trainierst</p>
            </div>
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Wo trainierst du?</Label>
                <Select value={profile.sportPreferences.location} onValueChange={(v) => up({ sportPreferences: { ...profile.sportPreferences, location: v as UserProfile["sportPreferences"]["location"] } })}>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Zuhause</SelectItem>
                    <SelectItem value="gym">Fitnessstudio</SelectItem>
                    <SelectItem value="outdoor">Draußen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Tage/Woche</Label>
                  <Select value={String(profile.sportPreferences.daysPerWeek)} onValueChange={(v) => up({ sportPreferences: { ...profile.sportPreferences, daysPerWeek: parseInt(v ?? "3") } })}>
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5,6,7].map((d) => <SelectItem key={d} value={String(d)}>{d}x</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Minuten</Label>
                  <Select value={String(profile.sportPreferences.minutesPerSession)} onValueChange={(v) => up({ sportPreferences: { ...profile.sportPreferences, minutesPerSession: parseInt(v ?? "30") } })}>
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{[15,20,30,45,60,90].map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Bevorzugte Sportarten</Label>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map((s) => (
                  <button key={s} onClick={() => toggleSport(s)} className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${profile.sportPreferences.preferredTypes.includes(s) ? "gradient-sport text-white glow-sm" : "glass text-muted-foreground hover:text-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: API Key */}
        {step === 4 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <h2 className="text-xl font-bold">KI-Einrichtung</h2>
              <p className="text-sm text-muted-foreground mt-1">Verbinde dich mit Google Gemini</p>
            </div>
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Gemini API Key</Label>
                <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIza..." className="bg-white/5 border-white/10 mt-1" />
              </div>
              <div className="rounded-xl bg-white/5 p-4 space-y-2">
                <p className="text-sm font-medium">So bekommst du einen Key:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                  <li>Gehe zu Google AI Studio</li>
                  <li>Melde dich mit deinem Google-Konto an</li>
                  <li>Klicke auf &quot;Get API Key&quot;</li>
                  <li>Erstelle einen Key und kopiere ihn hierher</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step > 0 && (
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="flex-1 glass rounded-xl h-11">
              <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1 gradient-primary text-white border-0 rounded-xl h-11 font-semibold hover:opacity-90 transition-opacity">
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={!profile.name || !apiKey} className="flex-1 gradient-primary text-white border-0 rounded-xl h-11 font-semibold glow-sm hover:opacity-90 transition-opacity disabled:opacity-40">
                <Check className="mr-2 h-4 w-4" /> Starten
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
