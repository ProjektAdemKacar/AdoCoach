"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ShoppingCart, Package, ArrowRight } from "lucide-react";

const categoryLabels: Record<string, string> = {
  produce: "Obst & Gemüse",
  dairy: "Milchprodukte",
  meat: "Fleisch & Fisch",
  grains: "Getreide & Brot",
  snacks: "Snacks",
  beverages: "Getränke",
  other: "Sonstiges",
};

const categoryEmoji: Record<string, string> = {
  produce: "🥬",
  dairy: "🧀",
  meat: "🥩",
  grains: "🍞",
  snacks: "🍪",
  beverages: "🥤",
  other: "📦",
};

export default function ShoppingPage() {
  const dailyPlan = useStore((s) => s.dailyPlan);
  const toggleShoppingItem = useStore((s) => s.toggleShoppingItem);
  const moveShoppingToInventory = useStore((s) => s.moveShoppingToInventory);
  const getInventoryMatch = useStore((s) => s.getInventoryMatch);

  const items = dailyPlan?.shoppingList ?? [];
  const checkedCount = items.filter((i) => i.checked).length;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="gradient-purple rounded-2xl p-4 glow-sm mb-4">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold">Keine Einkaufsliste</p>
          <p className="text-sm text-muted-foreground mt-1">Wird aus deinem Ernährungsplan generiert</p>
        </div>
      </div>
    );
  }

  const grouped = items.reduce(
    (acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, typeof items>
  );

  function handleBuyItem(itemId: string) {
    toggleShoppingItem(itemId);
    moveShoppingToInventory(itemId);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="text-sm text-muted-foreground">Einkaufen</p>
          <h1 className="text-2xl font-bold mt-0.5">Einkaufsliste</h1>
        </div>
        <Badge variant="secondary" className="glass border-0 text-sm px-3 py-1">
          {checkedCount}/{items.length}
        </Badge>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-3 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
        <Package className="h-4 w-4 text-teal-400 shrink-0" />
        <span>Gekaufte Artikel werden automatisch in dein <Link href="/inventory" className="text-primary underline">Inventar</Link> übernommen</span>
      </div>

      {/* Categories */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="animate-slide-up">
          <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 px-1 mb-2">
            <span>{categoryEmoji[category] ?? "📦"}</span>
            {categoryLabels[category] ?? category}
          </p>
          <div className="glass rounded-2xl divide-y divide-white/5">
            {categoryItems.map((item) => {
              const inInventory = getInventoryMatch(item.name);
              return (
                <div key={item.id} className="flex items-center gap-3 w-full text-left px-4 py-3 group">
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => item.checked ? toggleShoppingItem(item.id) : handleBuyItem(item.id)}
                  >
                    {item.checked ? (
                      <div className="shrink-0 rounded-full bg-emerald-500/20 p-1 animate-scale-in">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="shrink-0 rounded-full border border-muted-foreground/30 p-1 group-hover:border-primary/50 transition-colors">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm block ${item.checked ? "line-through text-muted-foreground/60" : "font-medium"}`}>
                        {item.name}
                      </span>
                      {inInventory && !item.checked && (
                        <span className="text-[10px] text-teal-400">
                          Im Inventar: {inInventory.quantity} {inInventory.unit}
                        </span>
                      )}
                    </div>
                  </button>
                  <span className="text-xs text-muted-foreground shrink-0">{item.quantity}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Inventory Link */}
      <Link href="/inventory" className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-all animate-slide-up">
        <div className="rounded-lg bg-teal-500/15 p-2">
          <Package className="h-4 w-4 text-teal-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Inventar anzeigen</p>
          <p className="text-xs text-muted-foreground">Alle deine Vorräte</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
