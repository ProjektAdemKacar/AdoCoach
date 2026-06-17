"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { CircularProgress } from "@/components/CircularProgress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  UtensilsCrossed,
  Flame,
  ShoppingCart,
  ChevronRight,
  Package,
  Camera,
  AlertCircle,
  Plus,
} from "lucide-react";

const mealLabels: Record<string, string> = {
  breakfast: "Frühstück",
  lunch: "Mittagessen",
  dinner: "Abendessen",
  snack: "Snack",
};

const mealEmoji: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

export default function NutritionPage() {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const toggleMeal = useStore((s) => s.toggleMeal);
  const getInventoryMatch = useStore((s) => s.getInventoryMatch);
  const addMissing = useStore((s) => s.addMissingIngredientsToShoppingList);

  const meals = dailyPlan?.meals ?? [];
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const consumedCalories = meals
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + m.calories, 0);

  if (!dailyPlan) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="gradient-food rounded-2xl p-4 glow-sm mb-4">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold">Kein Plan vorhanden</p>
          <p className="text-sm text-muted-foreground mt-1">Generiere zuerst einen Tagesplan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="text-sm text-muted-foreground">Deine Mahlzeiten</p>
          <h1 className="text-2xl font-bold mt-0.5">Ernährung</h1>
        </div>
        <Link href="/scan" className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5 hover:bg-white/5 transition-all text-sm">
          <Camera className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Scannen</span>
        </Link>
      </div>

      {/* Calorie Ring */}
      <div className="glass rounded-2xl p-6 flex items-center gap-6 animate-slide-up">
        <CircularProgress
          value={consumedCalories}
          max={totalCalories}
          size={110}
          strokeWidth={8}
          gradientId="cal-progress"
          colorFrom="oklch(0.75 0.18 55)"
          colorTo="oklch(0.65 0.22 30)"
        >
          <Flame className="h-5 w-5 text-amber-400" />
          <span className="text-lg font-bold mt-0.5">{consumedCalories}</span>
          <span className="text-[10px] text-muted-foreground">kcal</span>
        </CircularProgress>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Ziel</p>
            <p className="text-xl font-bold">{totalCalories} kcal</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Verbleibend</p>
            <p className="text-lg font-semibold text-amber-400">
              {Math.max(totalCalories - consumedCalories, 0)} kcal
            </p>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3 animate-slide-up">
        {meals.map((meal) => {
          const ingredientStatus = meal.ingredients.map((ing) => ({
            name: ing,
            inStock: !!getInventoryMatch(ing),
          }));
          const missingCount = ingredientStatus.filter((i) => !i.inStock).length;

          return (
            <div key={meal.id} className="glass rounded-2xl overflow-hidden">
              <button
                className="w-full text-left p-4 hover:bg-white/5 transition-all duration-200"
                onClick={() => toggleMeal(meal.id)}
              >
                <div className="flex items-start gap-3">
                  {meal.completed ? (
                    <div className="mt-0.5 shrink-0 rounded-full bg-emerald-500/20 p-1.5 animate-scale-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="mt-0.5 shrink-0 rounded-full border border-muted-foreground/30 p-1.5">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        <span>{mealEmoji[meal.type]}</span>
                        {mealLabels[meal.type]}
                      </span>
                      <Badge variant="secondary" className="text-xs bg-amber-500/15 text-amber-400 border-0">
                        {meal.calories} kcal
                      </Badge>
                    </div>
                    <p className={`text-base font-semibold mt-1.5 ${meal.completed ? "line-through text-muted-foreground/60" : ""}`}>
                      {meal.name}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{meal.description}</p>
                  </div>
                </div>
              </button>

              {/* Ingredients with stock status */}
              <div className="px-4 pb-3 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {ingredientStatus.map((ing) => (
                    <span
                      key={ing.name}
                      className={`text-[10px] rounded-full px-2 py-0.5 flex items-center gap-1 ${
                        ing.inStock
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {ing.inStock ? (
                        <Package className="h-2.5 w-2.5" />
                      ) : (
                        <AlertCircle className="h-2.5 w-2.5" />
                      )}
                      {ing.name}
                    </span>
                  ))}
                </div>
                {missingCount > 0 && (
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[10px] text-red-400/70">
                      {missingCount} Zutat{missingCount > 1 ? "en" : ""} fehlt
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        addMissing(ingredientStatus.filter((i) => !i.inStock).map((i) => i.name));
                      }}
                    >
                      <Plus className="h-3 w-3 mr-0.5" />
                      Zur Einkaufsliste
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Links */}
      <div className="space-y-2 animate-slide-up">
        <Link href="/shopping" className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="rounded-lg bg-purple-500/15 p-2">
            <ShoppingCart className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Einkaufsliste</p>
            <p className="text-xs text-muted-foreground">
              {(dailyPlan.shoppingList ?? []).filter((i) => i.checked).length}/{(dailyPlan.shoppingList ?? []).length} Produkte
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link href="/inventory" className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all">
          <div className="rounded-lg bg-teal-500/15 p-2">
            <Package className="h-4 w-4 text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Inventar</p>
            <p className="text-xs text-muted-foreground">Deine Vorräte verwalten</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
