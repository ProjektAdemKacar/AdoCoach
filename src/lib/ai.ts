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
  return `Du bist AdoCoach, ein KI-LifeCoach. Deutsch, motivierend, konkret.
NUTZER: ${profile.name}, ${profile.age}J, ${profile.weight}kg/${profile.height}cm, ${profile.gender === "male" ? "M" : profile.gender === "female" ? "W" : "D"}
ZEITEN: ${profile.wakeUpTime}-${profile.sleepTime}, Fitness: ${profile.fitnessLevel}
ZIELE: ${profile.goals.join(", ") || "Keine"}
ESSEN: ${profile.foodPreferences.diet}, Mag nicht: ${profile.foodPreferences.dislikedFoods.join(", ") || "Nichts"}, Allergien: ${profile.foodPreferences.allergies.join(", ") || "Keine"}
SPORT: ${profile.sportPreferences.location === "home" ? "Zuhause ohne Geräte" : profile.sportPreferences.location === "gym" ? "Gym" : "Outdoor"}, ${profile.sportPreferences.daysPerWeek}x/Woche ${profile.sportPreferences.minutesPerSession}min
HINWEISE: ${profile.customNotes || "Keine"}
REGELN: Keine ungemochten Lebensmittel vorschlagen. Sport an Ort/Level anpassen.`;
}

function buildDailyPlanPrompt(profile: UserProfile): string {
  const today = format(new Date(), "EEEE, d. MMMM", { locale: de });
  const waterGoal = Math.round(profile.weight * 35);

  return `Tagesplan für ${today}. Antworte NUR mit JSON, KEINE Codeblöcke.
WICHTIG: Halte die Antwort KURZ. Max 8 Schedule-Items, 4 Meals, 4 Exercises, 8 Shopping-Items. Kurze Beschreibungen (max 10 Wörter).

{"greeting":"Morgengruß für ${profile.name}","motivationQuote":"Motivationsspruch","schedule":[{"id":"s1","time":"HH:mm","title":"...","description":"...","category":"routine","completed":false}],"meals":[{"id":"m1","type":"breakfast","name":"...","description":"...","calories":400,"ingredients":["..."],"completed":false}],"waterGoal":${waterGoal},"workout":{"id":"w1","name":"...","duration":${profile.sportPreferences.minutesPerSession},"exercises":[{"name":"...","sets":3,"reps":"10","description":"...","completed":false}],"completed":false},"shoppingList":[{"id":"sh1","name":"...","quantity":"...","category":"other","checked":false}]}

Tag von ${profile.wakeUpTime} bis ${profile.sleepTime}. 3 Mahlzeiten+1 Snack. Wassererinnerungen. Einzigartige IDs (s1,s2.. m1,m2.. sh1,sh2..).
category für schedule: routine|meal|sport|hydration|task|rest
type für meals: breakfast|lunch|dinner|snack
category für shopping: produce|dairy|meat|grains|snacks|beverages|other`;
}

function repairJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Remove incomplete last property (truncated response)
  s = s.replace(/,\s*"[^"]*":\s*(?:\[(?:[^\]]*)|"[^"]*)?$/, "");
  s = s.replace(/,\s*\{[^}]*$/, "");
  // Close unclosed strings
  const quotes = (s.match(/"/g) || []).length;
  if (quotes % 2 !== 0) s += '"';
  // Close brackets
  const openBrace = (s.match(/\{/g) || []).length;
  const closeBrace = (s.match(/\}/g) || []).length;
  const openBracket = (s.match(/\[/g) || []).length;
  const closeBracket = (s.match(/\]/g) || []).length;
  for (let i = 0; i < openBracket - closeBracket; i++) s += "]";
  for (let i = 0; i < openBrace - closeBrace; i++) s += "}";
  // Fix common issues
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s;
}

function safeParse(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("KI-Antwort enthielt kein gültiges JSON.");
  }

  // Try direct parse first
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    // ignored
  }

  // Try repair
  try {
    return JSON.parse(repairJson(jsonMatch[0]));
  } catch {
    // ignored
  }

  // Aggressive: find the largest valid JSON subset
  let candidate = jsonMatch[0];
  for (let cutoff = candidate.length; cutoff > 100; cutoff -= 50) {
    try {
      const sub = repairJson(candidate.slice(0, cutoff));
      const result = JSON.parse(sub);
      if (result && typeof result === "object") return result as Record<string, unknown>;
    } catch {
      // keep trying shorter
    }
  }

  throw new Error("JSON konnte nicht repariert werden.");
}

function parseApiError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
    return "API-Limit erreicht. Bitte warte einige Minuten und versuche es erneut.";
  }
  if (message.includes("401") || message.includes("UNAUTHENTICATED") || message.includes("API_KEY_INVALID")) {
    return "Ungültiger API-Key. Bitte prüfe deinen Gemini API Key in den Profil-Einstellungen.";
  }
  if (message.includes("403") || message.includes("PERMISSION_DENIED")) {
    return "API-Key hat keine Berechtigung. Erstelle einen neuen Key in Google AI Studio.";
  }
  if (message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("network")) {
    return "Keine Internetverbindung. Bitte prüfe deine Verbindung.";
  }
  if (message.includes("JSON") || message.includes("Unexpected") || message.includes("position")) {
    return "KI-Antwort war fehlerhaft. Bitte erneut versuchen.";
  }

  return `Fehler: ${message.slice(0, 150)}`;
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
          temperature: 0.4,
          maxOutputTokens,
          responseMimeType: "application/json",
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
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const text = await callWithFallback(
        apiKey,
        buildDailyPlanPrompt(profile),
        buildSystemPrompt(profile),
        3000
      );

      const parsed = safeParse(text);
      const today = format(new Date(), "yyyy-MM-dd");

      return {
        id: crypto.randomUUID(),
        date: today,
        greeting: (parsed.greeting as string) ?? "Guten Tag!",
        motivationQuote: (parsed.motivationQuote as string) ?? "Jeder Tag ist eine neue Chance.",
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
      const isParseError = msg.includes("JSON") || msg.includes("Unexpected") || msg.includes("position") || msg.includes("repariert");
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
    const ai = new GoogleGenAI({ apiKey });
    let lastError: unknown;

    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: message,
          config: {
            systemInstruction: buildSystemPrompt(profile),
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });
        return response.text ?? "Entschuldigung, ich konnte keine Antwort generieren.";
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
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: `Was ist dieses Essen? Antworte auf Deutsch NUR mit diesem JSON-Format, KEIN anderer Text:
{"name":"Name","calories":350,"protein":25,"carbs":40,"fat":12,"fiber":5,"sugar":8,"details":"Beschreibung und Bewertung in 2 Sätzen."}` },
              ],
            },
          ],
          config: {
            temperature: 0.3,
            maxOutputTokens: 512,
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
        const isRateLimit = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
        const isNotFound = msg.includes("404") || msg.includes("not found");
        const isParseError = msg.includes("JSON") || msg.includes("gültiges");
        if (isParseError && attempt === 0) continue;
        if (isRateLimit || isNotFound) break;
        if (!isParseError) throw err;
      }
    }
  }

  throw lastError;
}
