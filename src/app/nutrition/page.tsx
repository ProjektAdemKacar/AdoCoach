"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { CircularProgress } from "@/components/CircularProgress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, UtensilsCrossed, Flame, ShoppingCart, ChevronRight, Package, Camera, AlertCircle, Plus } from "lucide-react";

const mealLabels: Record<string, string> = { breakfast: "Frühstück", lunch: "Mittagessen", dinner: "Abendessen", snack: "Snack" };
const mealEmoji: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };

export default function NutritionPage() {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const toggleMeal = useStore((s) => s.toggleMeal);
  const getInventoryMatch = useStore((s) => s.getInventoryMatch);
  const addMissing = useStore((s) => s.addMissingIngredientsToShoppingList);

  const meals = dailyPlan?.meals ?? [];
  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const consumedCal = meals.filter((m) => m.completed).reduce((s, m) => s + m.calories, 0);

  if (!dailyPlan) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="gradient-orange rounded-2xl p-5 glow-orange mb-5"><UtensilsCrossed className="h-8 w-8 text-white" /></div>
          <p className="text-lg font-bold">Kein Plan vorhanden</p>
          <p className="text-sm text-muted-foreground mt-1">Generiere zuerst einen Tagesplan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24 space-y-5">
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Nutrition</p>
          <h1 className="text-2xl font-bold mt-0.5">Ernährung</h1>
        </div>
        <Link href="/scan" className="card-dark rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:bg-white/5 transition-all">
          <Camera className="h-4 w-4 text-neon" /><span className="text-[10px] font-bold">Scan</span>
        </Link>
      </div>

      <div className="card-elevated rounded-2xl p-6 flex items-center gap-6 animate-slide-up">
        <CircularProgress value={consumedCal} max={totalCal} size={100} strokeWidth={7} gradientId="cal-ring"
          colorFrom="#FF9100" colorTo="#FF6D00" glowColor="rgba(255,145,0,0.4)">
          <Flame className="h-5 w-5 text-[#FF9100]" />
          <span className="text-lg font-black mt-0.5">{consumedCal}</span>
        </CircularProgress>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Kalorien Ziel</p>
          <p className="text-2xl font-black">{totalCal} <span className="text-sm text-muted-foreground font-normal">kcal</span></p>
          <p className="text-sm font-bold text-[#FF9100] mt-1">{Math.max(totalCal - consumedCal, 0)} übrig</p>
        </div>
      </div>

      <div className="space-y-2 animate-slide-up">
        {meals.map((meal) => {
          const ingredients = meal.ingredients.map((ing) => ({ name: ing, inStock: !!getInventoryMatch(ing) }));
          const missingCount = ingredients.filter((i) => !i.inStock).length;
          return (
            <div key={meal.id} className="card-dark rounded-xl overflow-hidden">
              <button className="w-full text-left p-4 hover:bg-white/[0.03] transition-all" onClick={() => toggleMeal(meal.id)}>
                <div className="flex items-center gap-3">
                  {meal.completed ? (
                    <div className="shrink-0 rounded-full gradient-neon p-1 animate-scale-in"><CheckCircle2 className="h-4 w-4 text-black" /></div>
                  ) : (
                    <div className="shrink-0 rounded-full border border-[#1A2332] p-1"><Circle className="h-4 w-4 text-muted-foreground/40" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{mealEmoji[meal.type]} {mealLabels[meal.type]}</span>
                      <span className="text-xs font-bold text-[#FF9100]">{meal.calories} kcal</span>
                    </div>
                    <p className={`text-sm font-bold mt-0.5 ${meal.completed ? "line-through text-muted-foreground/40" : ""}`}>{meal.name}</p>
                  </div>
                </div>
              </button>
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-1">
                  {ingredients.map((ing) => (
                    <span key={ing.name} className={`text-[9px] rounded-full px-2 py-0.5 flex items-center gap-0.5 ${
                      ing.inStock ? "bg-[#00E676]/10 text-[#00E676]" : "bg-red-500/10 text-red-400"
                    }`}>
                      {ing.inStock ? <Package className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}{ing.name}
                    </span>
                  ))}
                </div>
                {missingCount > 0 && (
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px] text-red-400">{missingCount} fehlt</span>
                    <Button variant="ghost" size="sm" className="h-5 px-2 text-[9px] text-neon hover:text-neon/80 hover:bg-neon/10"
                      onClick={(e) => { e.stopPropagation(); addMissing(ingredients.filter((i) => !i.inStock).map((i) => i.name)); }}>
                      <Plus className="h-2.5 w-2.5 mr-0.5" />Einkaufsliste
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 animate-slide-up">
        {[
          { href: "/shopping", icon: ShoppingCart, color: "text-[#B388FF]", title: "Einkaufsliste", sub: `${(dailyPlan.shoppingList ?? []).filter((i) => i.checked).length}/${(dailyPlan.shoppingList ?? []).length}` },
          { href: "/inventory", icon: Package, color: "text-[#00E5FF]", title: "Inventar", sub: "Vorräte verwalten" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="card-dark rounded-xl p-3.5 flex items-center gap-3 hover:bg-white/[0.03] transition-all">
            <link.icon className={`h-4 w-4 ${link.color}`} />
            <div className="flex-1"><p className="text-xs font-bold">{link.title}</p><p className="text-[9px] text-muted-foreground">{link.sub}</p></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
