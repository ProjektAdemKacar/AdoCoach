"use client";

import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { analyzeFoodImage, type FoodAnalysis } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/CircularProgress";
import type { FoodScanResult } from "@/types";
import {
  Camera,
  Upload,
  Loader2,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Leaf,
  Candy,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ScanPage() {
  const geminiApiKey = useStore((s) => s.geminiApiKey);
  const foodScans = useStore((s) => s.foodScans);
  const addFoodScan = useStore((s) => s.addFoodScan);

  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!preview || !geminiApiKey) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const base64 = preview.split(",")[1];
      const mimeMatch = preview.match(/data:(image\/\w+);/);
      const mimeType = mimeMatch?.[1] ?? "image/jpeg";

      const analysis = await analyzeFoodImage(geminiApiKey, base64, mimeType);
      setResult(analysis);

      const scan: FoodScanResult = {
        id: crypto.randomUUID(),
        ...analysis,
        scannedAt: new Date().toISOString(),
      };
      addFoodScan(scan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse fehlgeschlagen");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
  }

  const totalMacros = result ? result.protein + result.carbs + result.fat : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="text-sm text-muted-foreground">Essen erkennen</p>
        <h1 className="text-2xl font-bold mt-0.5">Food Scanner</h1>
      </div>

      {/* Camera/Upload Area */}
      {!preview && !result && (
        <div className="animate-slide-up space-y-3">
          <div className="glass rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="gradient-food rounded-2xl p-5 glow-sm mb-5">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <p className="text-lg font-semibold">Fotografiere dein Essen</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs">
              Die KI erkennt das Gericht und zeigt dir alle Nährwerte
            </p>
            <div className="flex gap-3 w-full">
              <Button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 gradient-food text-white border-0 rounded-xl h-12 font-semibold hover:opacity-90 transition-opacity"
              >
                <Camera className="mr-2 h-5 w-5" /> Kamera
              </Button>
              <Button
                onClick={() => fileRef.current?.click()}
                variant="ghost"
                className="flex-1 glass rounded-xl h-12 font-semibold border-0"
              >
                <Upload className="mr-2 h-5 w-5" /> Galerie
              </Button>
            </div>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Preview */}
      {preview && !result && (
        <div className="animate-slide-up space-y-4">
          <div className="glass rounded-2xl overflow-hidden">
            <img src={preview} alt="Food preview" className="w-full h-64 object-cover" />
          </div>
          <div className="flex gap-3">
            <Button onClick={reset} variant="ghost" className="flex-1 glass border-0 rounded-xl h-11">
              <RotateCcw className="mr-2 h-4 w-4" /> Neu
            </Button>
            <Button
              onClick={analyze}
              disabled={isAnalyzing}
              className="flex-1 gradient-food text-white border-0 rounded-xl h-11 font-semibold hover:opacity-90 transition-opacity"
            >
              {isAnalyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysiere...</>
              ) : (
                <><Camera className="mr-2 h-4 w-4" /> Analysieren</>
              )}
            </Button>
          </div>
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          {preview && (
            <div className="glass rounded-2xl overflow-hidden">
              <img src={preview} alt={result.name} className="w-full h-48 object-cover" />
            </div>
          )}

          {/* Title + Calories */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xl font-bold">{result.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Flame className="h-5 w-5 text-amber-400" />
              <span className="text-2xl font-bold">{result.calories}</span>
              <span className="text-muted-foreground">kcal</span>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass rounded-xl p-3 text-center">
              <CircularProgress value={result.protein} max={totalMacros || 1} size={60} strokeWidth={5} gradientId="protein" colorFrom="oklch(0.65 0.20 25)" colorTo="oklch(0.55 0.22 10)">
                <Beef className="h-4 w-4 text-red-400" />
              </CircularProgress>
              <p className="text-lg font-bold mt-1">{result.protein}g</p>
              <p className="text-[10px] text-muted-foreground">Protein</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <CircularProgress value={result.carbs} max={totalMacros || 1} size={60} strokeWidth={5} gradientId="carbs" colorFrom="oklch(0.75 0.18 55)" colorTo="oklch(0.65 0.20 40)">
                <Wheat className="h-4 w-4 text-amber-400" />
              </CircularProgress>
              <p className="text-lg font-bold mt-1">{result.carbs}g</p>
              <p className="text-[10px] text-muted-foreground">Kohlenhydrate</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <CircularProgress value={result.fat} max={totalMacros || 1} size={60} strokeWidth={5} gradientId="fat" colorFrom="oklch(0.70 0.15 200)" colorTo="oklch(0.60 0.18 220)">
                <Droplet className="h-4 w-4 text-blue-400" />
              </CircularProgress>
              <p className="text-lg font-bold mt-1">{result.fat}g</p>
              <p className="text-[10px] text-muted-foreground">Fett</p>
            </div>
          </div>

          {/* More Nutrients */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-sm"><Leaf className="h-4 w-4 text-green-400" /> Ballaststoffe</span>
              <span className="font-medium">{result.fiber}g</span>
            </div>
            <div className="border-t border-white/5" />
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-sm"><Candy className="h-4 w-4 text-pink-400" /> Zucker</span>
              <span className="font-medium">{result.sugar}g</span>
            </div>
          </div>

          {/* Details */}
          <div className="glass rounded-2xl p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{result.details}</p>
          </div>

          <Button onClick={reset} className="w-full glass border-0 rounded-xl h-11 hover:bg-white/5">
            <Camera className="mr-2 h-4 w-4" /> Neues Foto analysieren
          </Button>
        </div>
      )}

      {/* History */}
      {foodScans.length > 0 && (
        <div className="animate-slide-up">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2 w-full"
          >
            <History className="h-4 w-4" />
            Verlauf ({foodScans.length})
            {showHistory ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
          </button>
          {showHistory && (
            <div className="glass rounded-2xl divide-y divide-white/5">
              {[...foodScans].reverse().slice(0, 10).map((scan) => (
                <div key={scan.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{scan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.scannedAt).toLocaleDateString("de-DE")} • {scan.calories} kcal
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground">
                    <span>P:{scan.protein}g</span> <span>K:{scan.carbs}g</span> <span>F:{scan.fat}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
