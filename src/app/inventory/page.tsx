"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Minus, Trash2, Search } from "lucide-react";
import type { InventoryItem } from "@/types";

const CATEGORIES: { value: InventoryItem["category"]; label: string; emoji: string }[] = [
  { value: "produce", label: "Obst & Gemüse", emoji: "🥬" },
  { value: "dairy", label: "Milchprodukte", emoji: "🧀" },
  { value: "meat", label: "Fleisch & Fisch", emoji: "🥩" },
  { value: "grains", label: "Getreide & Brot", emoji: "🍞" },
  { value: "snacks", label: "Snacks", emoji: "🍪" },
  { value: "beverages", label: "Getränke", emoji: "🥤" },
  { value: "spices", label: "Gewürze", emoji: "🧂" },
  { value: "other", label: "Sonstiges", emoji: "📦" },
];

const UNITS = ["g", "kg", "ml", "L", "Stk", "Packung", "Dose", "Flasche", "Beutel"];

export default function InventoryPage() {
  const inventory = useStore((s) => s.inventory);
  const addInventoryItem = useStore((s) => s.addInventoryItem);
  const updateInventoryItem = useStore((s) => s.updateInventoryItem);
  const removeInventoryItem = useStore((s) => s.removeInventoryItem);

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("Stk");
  const [category, setCategory] = useState<InventoryItem["category"]>("other");

  function handleAdd() {
    if (!name.trim()) return;
    addInventoryItem({
      id: crypto.randomUUID(),
      name: name.trim(),
      quantity: parseFloat(qty) || 1,
      unit,
      category,
      addedAt: new Date().toISOString(),
    });
    setName("");
    setQty("1");
    setShowAdd(false);
  }

  function adjustQty(id: string, delta: number) {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeInventoryItem(id);
    } else {
      updateInventoryItem(id, { quantity: newQty });
    }
  }

  const filtered = search
    ? inventory.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : inventory;

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <p className="text-sm text-muted-foreground">Deine Vorräte</p>
          <h1 className="text-2xl font-bold mt-0.5">Inventar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="glass border-0 text-sm px-3 py-1">
            {inventory.length} Artikel
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-full glass h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-1.5 flex items-center gap-2 animate-fade-in">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Vorräte durchsuchen..."
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="glass rounded-2xl p-5 space-y-3 animate-slide-up">
          <p className="text-sm font-semibold">Neuer Artikel</p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (z.B. Reis, Milch...)"
            className="bg-white/5 border-white/10"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Menge</Label>
              <Input
                type="number"
                step="0.5"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="bg-white/5 border-white/10 mt-0.5"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Einheit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v ?? "Stk")}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-0.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Kategorie</Label>
              <Select value={category} onValueChange={(v) => setCategory((v ?? "other") as InventoryItem["category"])}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-0.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!name.trim()} className="w-full gradient-primary text-white border-0 rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Hinzufügen
          </Button>
        </div>
      )}

      {/* Inventory List */}
      {Object.entries(grouped).map(([cat, items]) => {
        const catInfo = CATEGORIES.find((c) => c.value === cat);
        return (
          <div key={cat} className="animate-slide-up">
            <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 px-1 mb-2">
              <span>{catInfo?.emoji ?? "📦"}</span>
              {catInfo?.label ?? cat}
            </p>
            <div className="glass rounded-2xl divide-y divide-white/5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustQty(item.id, -1)}
                      className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-mono w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => adjustQty(item.id, 1)}
                      className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeInventoryItem(item.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty */}
      {inventory.length === 0 && !showAdd && (
        <div className="glass rounded-2xl p-8 text-center animate-fade-in">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">Noch keine Vorräte</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Füge Artikel hinzu oder kaufe über die Einkaufsliste ein
          </p>
          <Button onClick={() => setShowAdd(true)} className="gradient-primary text-white border-0 rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Ersten Artikel hinzufügen
          </Button>
        </div>
      )}
    </div>
  );
}
