import { GoogleGenAI } from "@google/genai";
import type { UserProfile, DailyPlan } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
];

function buildSystemPrompt(profile: UserProfile): string {
  return `Du bist AdoCoach, ein persönlicher KI-LifeCoach. Du sprichst Deutsch und bist motivierend, freundlich und konkret.

PROFIL DES NUTZERS:
- Name: ${profile.name}
- Alter: ${profile.age} Jahre
- Gewicht: ${profile.weight} kg, Größe: ${profile.height} cm
- Geschlecht: ${profile.gender === "male" ? "Männlich" : profile.gender === "female" ? "Weiblich" : "Divers"}
- Aufwachzeit: ${profile.wakeUpTime}, Schlafenszeit: ${profile.sleepTime}
- Fitnesslevel: ${profile.fitnessLevel}
- Ziele: ${profile.goals.join(", ")}

ERNÄHRUNG:
- Abneigungen: ${profile.foodPreferences.dislikedFoods.join(", ") || "Keine"}
- Allergien: ${profile.foodPreferences.allergies.join(", ") || "Keine"}
- Ernährungsweise: ${profile.foodPreferences.diet}

SPORT:
- Ort: ${profile.sportPreferences.location === "home" ? "Zuhause" : profile.sportPreferences.location === "gym" ? "Fitnessstudio" : "Draußen"}
- ${profile.sportPreferences.daysPerWeek}x pro Woche, ${profile.sportPreferences.minutesPerSession} Minuten
- Bevorzugte Sportarten: ${profile.sportPreferences.preferredTypes.join(", ") || "Keine Präferenz"}

WICHTIGE HINWEISE: ${profile.customNotes || "Keine"}

REGELN:
- Schlage NIEMALS Lebensmittel vor, die der Nutzer nicht mag oder gegen die er allergisch ist
- Passe Sportübungen an den Ort und das Fitnesslevel an
- Berechne Wasseraufnahme basierend auf Gewicht (ca. 35ml pro kg)
- Plane realistische Zeitfenster zwischen Aufwach- und Schlafenszeit`;
}

function buildDailyPlanPrompt(profile: UserProfile): string {
  const today = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });
  const waterGoal = Math.round(profile.weight * 35);

  return `Erstelle einen kompletten Tagesplan für heute (${today}).

Antworte AUSSCHLIESSLICH mit validem JSON in diesem exakten Format (keine Markdown-Codeblöcke, kein zusätzlicher Text):
{
  "greeting": "Persönliche Morgengrüße mit dem Namen ${profile.name}",
  "motivationQuote": "Ein motivierender Spruch passend zu den Zielen des Nutzers (1-2 Sätze)",
  "schedule": [
    {
      "id": "s1",
      "time": "HH:mm",
      "title": "Aktivität",
      "description": "Kurze Beschreibung",
      "category": "routine|meal|sport|hydration|task|rest",
      "completed": false
    }
  ],
  "meals": [
    {
      "id": "m1",
      "type": "breakfast|lunch|dinner|snack",
      "name": "Mahlzeit Name",
      "description": "Beschreibung mit Zubereitung",
      "calories": 400,
      "ingredients": ["Zutat 1", "Zutat 2"],
      "completed": false
    }
  ],
  "waterGoal": ${waterGoal},
  "workout": {
    "id": "w1",
    "name": "Workout Name",
    "duration": ${profile.sportPreferences.minutesPerSession},
    "exercises": [
      {
        "name": "Übung",
        "sets": 3,
        "reps": "10-12",
        "description": "Ausführung",
        "completed": false
      }
    ],
    "completed": false
  },
  "shoppingList": [
    {
      "id": "sh1",
      "name": "Produkt",
      "quantity": "Menge",
      "category": "produce|dairy|meat|grains|snacks|beverages|other",
      "checked": false
    }
  ]
}

Wichtig:
- Plane den Tag von ${profile.wakeUpTime} bis ${profile.sleepTime}
- Wassererinnerungen alle 1-2 Stunden einplanen
- 3 Hauptmahlzeiten + 1-2 Snacks
- Einkaufsliste basierend auf den Mahlzeiten
- ${profile.sportPreferences.location === "home" ? "Nur Home-Workouts ohne Geräte" : profile.sportPreferences.location === "gym" ? "Gym-Übungen mit Geräten" : "Outdoor-Aktivitäten"}
- IDs müssen einzigartig sein (s1, s2, ... für schedule; m1, m2, ... für meals; sh1, sh2, ... für shopping)`;
}

function repairJson(raw: string): string {
  let s = raw.trim();
  // Remove markdown code fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Try to close unclosed brackets/arrays
  const opens = (s.match(/\{/g) || []).length;
  const closes = (s.match(/\}/g) || []).length;
  for (let i = 0; i < opens - closes; i++) s += "}";
  const openBrackets = (s.match(/\[/g) || []).length;
  const closeBrackets = (s.match(/\]/g) || []).length;
  for (let i = 0; i < openBrackets - closeBrackets; i++) s += "]";
  return s;
}

function safeParse(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("KI-Antwort enthielt kein gültiges JSON. Bitte erneut versuchen.");
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    const repaired = repairJson(jsonMatch[0]);
    return JSON.parse(repaired);
  }
}

function parseApiError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
    return "API-Limit erreicht. Das kostenlose Kontingent ist aufgebraucht. Bitte warte einige Minuten und versuche es erneut, oder prüfe dein Kontingent unter ai.dev/rate-limit";
  }
  if (message.includes("401") || message.includes("UNAUTHENTICATED") || message.includes("API_KEY_INVALID")) {
    return "Ungültiger API-Key. Bitte prüfe deinen Gemini API Key in den Profil-Einstellungen.";
  }
  if (message.includes("403") || message.includes("PERMISSION_DENIED")) {
    return "API-Key hat keine Berechtigung. Bitte erstelle einen neuen Key in Google AI Studio.";
  }
  if (message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("network")) {
    return "Keine Internetverbindung. Bitte prüfe deine Verbindung und versuche es erneut.";
  }

  return `Fehler bei der KI-Anfrage: ${message.slice(0, 200)}`;
}

async function callWithFallback(
  apiKey: string,
  contents: string,
  systemInstruction: string,
  maxOutputTokens: number
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens,
        },
      });
      return response.text ?? "";
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const shouldFallback =
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("404") ||
        msg.includes("not found");
      if (!shouldFallback) throw err;
    }
  }

  throw lastError;
}

export async function generateDailyPlan(
  profile: UserProfile,
  apiKey: string
): Promise<DailyPlan> {
  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const text = await callWithFallback(
        apiKey,
        buildDailyPlanPrompt(profile),
        buildSystemPrompt(profile),
        4096
      );

      const parsed = safeParse(text);
      const today = format(new Date(), "yyyy-MM-dd");

      return {
        id: crypto.randomUUID(),
        date: today,
        greeting: (parsed.greeting as string) ?? "Guten Tag!",
        motivationQuote: (parsed.motivationQuote as string) ?? "Jeder Tag ist eine neue Chance, dein bestes Ich zu sein.",
        schedule: (parsed.schedule as DailyPlan["schedule"]) ?? [],
        meals: (parsed.meals as DailyPlan["meals"]) ?? [],
        waterGoal: (parsed.waterGoal as number) ?? Math.round(profile.weight * 35),
        waterConsumed: 0,
        workout: (parsed.workout as DailyPlan["workout"]) ?? null,
        shoppingList: (parsed.shoppingList as DailyPlan["shoppingList"]) ?? [],
        eveningReflection: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isParseError = msg.includes("JSON") || msg.includes("Unexpected") || msg.includes("position");
      if (isParseError && attempt < MAX_ATTEMPTS) continue;
      throw new Error(parseApiError(err));
    }
  }

  throw new Error("Plan konnte nicht erstellt werden. Bitte erneut versuchen.");
}

export async function generateCoachResponse(
  profile: UserProfile,
  apiKey: string,
  message: string
): Promise<string> {
  try {
    return await callWithFallback(
      apiKey,
      message,
      buildSystemPrompt(profile),
      1024
    );
  } catch (err) {
    throw new Error(parseApiError(err));
  }
}

export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  details: string;
}

export async function analyzeFoodImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<FoodAnalysis> {
  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType,
                },
              },
              {
                text: `Analysiere dieses Essen/Gericht im Bild. Antworte AUSSCHLIESSLICH mit validem JSON (keine Codeblöcke):
{
  "name": "Name des Essens auf Deutsch",
  "calories": 350,
  "protein": 25,
  "carbs": 40,
  "fat": 12,
  "fiber": 5,
  "sugar": 8,
  "details": "Ausführliche Beschreibung: Was ist das Essen, geschätzte Portionsgröße, Vitamine/Mineralstoffe, Gesundheitsbewertung, Tipps. 3-4 Sätze auf Deutsch."
}

Alle Nährwerte in Gramm (außer Kalorien in kcal). Schätze basierend auf einer typischen Portion.`,
              },
            ],
          },
        ],
        config: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      });

      const text = response.text ?? "";
      const parsed = safeParse(text);
      return {
        name: (parsed.name as string) ?? "Unbekanntes Essen",
        calories: (parsed.calories as number) ?? 0,
        protein: (parsed.protein as number) ?? 0,
        carbs: (parsed.carbs as number) ?? 0,
        fat: (parsed.fat as number) ?? 0,
        fiber: (parsed.fiber as number) ?? 0,
        sugar: (parsed.sugar as number) ?? 0,
        details: (parsed.details as string) ?? "",
      };
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const shouldFallback =
        msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("404") || msg.includes("not found");
      if (!shouldFallback) throw err;
    }
  }

  throw lastError;
}
