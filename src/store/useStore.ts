import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  DailyPlan,
  HydrationEntry,
  Reflection,
  WeightEntry,
  SleepEntry,
  Achievement,
  DayLog,
  InventoryItem,
  FoodScanResult,
} from "@/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "streak-3", title: "Durchstarter", description: "3 Tage in Folge aktiv", icon: "🔥", unlockedAt: null, requirement: { type: "streak", value: 3 } },
  { id: "streak-7", title: "Woche geschafft!", description: "7 Tage in Folge aktiv", icon: "⭐", unlockedAt: null, requirement: { type: "streak", value: 7 } },
  { id: "streak-30", title: "Monats-Champion", description: "30 Tage in Folge aktiv", icon: "👑", unlockedAt: null, requirement: { type: "streak", value: 30 } },
  { id: "water-10", title: "Hydrations-Held", description: "10x Wasserziel erreicht", icon: "💧", unlockedAt: null, requirement: { type: "waterGoals", value: 10 } },
  { id: "workout-5", title: "Fitness-Fan", description: "5 Workouts abgeschlossen", icon: "💪", unlockedAt: null, requirement: { type: "workouts", value: 5 } },
  { id: "workout-25", title: "Trainings-Maschine", description: "25 Workouts abgeschlossen", icon: "🏆", unlockedAt: null, requirement: { type: "workouts", value: 25 } },
  { id: "reflection-7", title: "Selbstreflektiert", description: "7 Abendreflexionen", icon: "🧘", unlockedAt: null, requirement: { type: "reflections", value: 7 } },
  { id: "weight-1", title: "Auf der Waage", description: "Erstes Gewicht eingetragen", icon: "⚖️", unlockedAt: null, requirement: { type: "weightEntries", value: 1 } },
];

interface AppState {
  profile: UserProfile | null;
  profileCompleted: boolean;
  dailyPlan: DailyPlan | null;
  hydrationLog: HydrationEntry[];
  isGenerating: boolean;
  geminiApiKey: string;
  streak: number;
  lastActiveDate: string | null;
  chatMessages: ChatMessage[];
  reflections: Reflection[];
  weightLog: WeightEntry[];
  sleepLog: SleepEntry[];
  achievements: Achievement[];
  dayLogs: DayLog[];
  stats: { waterGoalsReached: number; workoutsCompleted: number; reflectionsCount: number };
  inventory: InventoryItem[];
  foodScans: FoodScanResult[];

  setProfile: (profile: UserProfile) => void;
  setProfileCompleted: (completed: boolean) => void;
  setDailyPlan: (plan: DailyPlan) => void;
  updateDailyPlan: (updates: Partial<DailyPlan>) => void;
  toggleScheduleItem: (itemId: string) => void;
  toggleMeal: (mealId: string) => void;
  toggleExercise: (exerciseIndex: number) => void;
  toggleWorkout: () => void;
  toggleShoppingItem: (itemId: string) => void;
  addWater: (amount: number) => void;
  setEveningReflection: (reflection: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setGeminiApiKey: (key: string) => void;
  updateStreak: () => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  addReflection: (reflection: Reflection) => void;
  addWeight: (entry: WeightEntry) => void;
  addSleep: (entry: SleepEntry) => void;
  saveDayLog: () => void;
  checkAchievements: () => Achievement | null;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  moveShoppingToInventory: (itemId: string) => void;
  getInventoryMatch: (ingredientName: string) => InventoryItem | undefined;
  addToShoppingList: (name: string, quantity: string, category?: string) => void;
  addMissingIngredientsToShoppingList: (ingredients: string[]) => void;
  addFoodScan: (scan: FoodScanResult) => void;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      profileCompleted: false,
      dailyPlan: null,
      hydrationLog: [],
      isGenerating: false,
      geminiApiKey: "",
      streak: 0,
      lastActiveDate: null,
      chatMessages: [],
      reflections: [],
      weightLog: [],
      sleepLog: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      dayLogs: [],
      stats: { waterGoalsReached: 0, workoutsCompleted: 0, reflectionsCount: 0 },
      inventory: [],
      foodScans: [],

      setProfile: (profile) => set({ profile, profileCompleted: true }),
      setProfileCompleted: (completed) => set({ profileCompleted: completed }),

      setDailyPlan: (plan) =>
        set((state) => {
          const today = getToday();
          let newStreak = state.streak;
          if (state.lastActiveDate === getYesterday()) {
            newStreak = state.streak + 1;
          } else if (state.lastActiveDate !== today) {
            newStreak = 1;
          }
          return { dailyPlan: plan, hydrationLog: [], streak: newStreak, lastActiveDate: today };
        }),

      updateDailyPlan: (updates) =>
        set((state) => ({
          dailyPlan: state.dailyPlan ? { ...state.dailyPlan, ...updates } : null,
        })),

      toggleScheduleItem: (itemId) =>
        set((state) => {
          if (!state.dailyPlan) return state;
          return {
            dailyPlan: {
              ...state.dailyPlan,
              schedule: state.dailyPlan.schedule.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            },
          };
        }),

      toggleMeal: (mealId) =>
        set((state) => {
          if (!state.dailyPlan) return state;
          return {
            dailyPlan: {
              ...state.dailyPlan,
              meals: state.dailyPlan.meals.map((meal) =>
                meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
              ),
            },
          };
        }),

      toggleExercise: (exerciseIndex) =>
        set((state) => {
          if (!state.dailyPlan?.workout) return state;
          return {
            dailyPlan: {
              ...state.dailyPlan,
              workout: {
                ...state.dailyPlan.workout,
                exercises: state.dailyPlan.workout.exercises.map((ex, i) =>
                  i === exerciseIndex ? { ...ex, completed: !ex.completed } : ex
                ),
              },
            },
          };
        }),

      toggleWorkout: () =>
        set((state) => {
          if (!state.dailyPlan?.workout) return state;
          const wasCompleted = state.dailyPlan.workout.completed;
          return {
            dailyPlan: {
              ...state.dailyPlan,
              workout: { ...state.dailyPlan.workout, completed: !wasCompleted },
            },
            stats: {
              ...state.stats,
              workoutsCompleted: wasCompleted
                ? state.stats.workoutsCompleted - 1
                : state.stats.workoutsCompleted + 1,
            },
          };
        }),

      toggleShoppingItem: (itemId) =>
        set((state) => {
          if (!state.dailyPlan) return state;
          return {
            dailyPlan: {
              ...state.dailyPlan,
              shoppingList: state.dailyPlan.shoppingList.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            },
          };
        }),

      addWater: (amount) =>
        set((state) => {
          const entry: HydrationEntry = {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
            amount,
          };
          const newConsumed = (state.dailyPlan?.waterConsumed ?? 0) + amount;
          const waterGoal = state.dailyPlan?.waterGoal ?? 2500;
          const wasBelow = (state.dailyPlan?.waterConsumed ?? 0) < waterGoal;
          const nowAbove = newConsumed >= waterGoal;
          return {
            hydrationLog: [...state.hydrationLog, entry],
            dailyPlan: state.dailyPlan ? { ...state.dailyPlan, waterConsumed: newConsumed } : null,
            stats: {
              ...state.stats,
              waterGoalsReached: wasBelow && nowAbove
                ? state.stats.waterGoalsReached + 1
                : state.stats.waterGoalsReached,
            },
          };
        }),

      setEveningReflection: (reflection) =>
        set((state) => ({
          dailyPlan: state.dailyPlan ? { ...state.dailyPlan, eveningReflection: reflection } : null,
        })),

      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),

      updateStreak: () =>
        set((state) => {
          const today = getToday();
          if (state.lastActiveDate === today) return state;
          if (state.lastActiveDate === getYesterday()) {
            return { streak: state.streak + 1, lastActiveDate: today };
          }
          return { streak: 1, lastActiveDate: today };
        }),

      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),

      clearChat: () => set({ chatMessages: [] }),

      addReflection: (reflection) =>
        set((state) => ({
          reflections: [...state.reflections, reflection],
          stats: { ...state.stats, reflectionsCount: state.stats.reflectionsCount + 1 },
        })),

      addWeight: (entry) =>
        set((state) => ({ weightLog: [...state.weightLog, entry] })),

      addSleep: (entry) =>
        set((state) => ({ sleepLog: [...state.sleepLog, entry] })),

      saveDayLog: () =>
        set((state) => {
          if (!state.dailyPlan) return state;
          const today = getToday();
          const existing = state.dayLogs.findIndex((l) => l.date === today);
          const log: DayLog = {
            date: today,
            waterPercent: Math.round(((state.dailyPlan.waterConsumed ?? 0) / (state.dailyPlan.waterGoal ?? 2500)) * 100),
            caloriesConsumed: state.dailyPlan.meals.filter((m) => m.completed).reduce((s, m) => s + m.calories, 0),
            caloriesGoal: state.dailyPlan.meals.reduce((s, m) => s + m.calories, 0),
            workoutDone: state.dailyPlan.workout?.completed ?? false,
            mood: state.reflections.find((r) => r.date === today)?.mood ?? null,
            sleepHours: state.sleepLog.find((s) => s.date === today)?.durationHours ?? null,
          };
          const logs = [...state.dayLogs];
          if (existing >= 0) logs[existing] = log;
          else logs.push(log);
          return { dayLogs: logs.slice(-30) };
        }),

      checkAchievements: () => {
        const state = get();
        const now = new Date().toISOString();
        let newUnlock: Achievement | null = null;

        const updated = state.achievements.map((a) => {
          if (a.unlockedAt) return a;
          let earned = false;
          if (a.requirement.type === "streak") earned = state.streak >= a.requirement.value;
          if (a.requirement.type === "waterGoals") earned = state.stats.waterGoalsReached >= a.requirement.value;
          if (a.requirement.type === "workouts") earned = state.stats.workoutsCompleted >= a.requirement.value;
          if (a.requirement.type === "reflections") earned = state.stats.reflectionsCount >= a.requirement.value;
          if (a.requirement.type === "weightEntries") earned = state.weightLog.length >= a.requirement.value;
          if (earned) {
            newUnlock = { ...a, unlockedAt: now };
            return newUnlock;
          }
          return a;
        });

        if (newUnlock) set({ achievements: updated });
        return newUnlock;
      },

      addInventoryItem: (item) =>
        set((state) => {
          const existing = state.inventory.find(
            (i) => i.name.toLowerCase() === item.name.toLowerCase()
          );
          if (existing) {
            return {
              inventory: state.inventory.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { inventory: [...state.inventory, item] };
        }),

      updateInventoryItem: (id, updates) =>
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      removeInventoryItem: (id) =>
        set((state) => ({
          inventory: state.inventory.filter((i) => i.id !== id),
        })),

      moveShoppingToInventory: (itemId) =>
        set((state) => {
          const shopItem = state.dailyPlan?.shoppingList.find((i) => i.id === itemId);
          if (!shopItem) return state;

          const qtyMatch = shopItem.quantity.match(/(\d+(?:[.,]\d+)?)/);
          const qty = qtyMatch ? parseFloat(qtyMatch[1].replace(",", ".")) : 1;
          const unit = shopItem.quantity.replace(/[\d.,]+\s*/, "").trim() || "Stk";

          const existing = state.inventory.find(
            (i) => i.name.toLowerCase() === shopItem.name.toLowerCase()
          );

          const newInventory = existing
            ? state.inventory.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + qty } : i
              )
            : [
                ...state.inventory,
                {
                  id: crypto.randomUUID(),
                  name: shopItem.name,
                  quantity: qty,
                  unit,
                  category: shopItem.category as InventoryItem["category"],
                  addedAt: new Date().toISOString(),
                },
              ];

          return { inventory: newInventory };
        }),

      getInventoryMatch: (ingredientName) => {
        const state = get();
        return state.inventory.find(
          (i) => i.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
                 ingredientName.toLowerCase().includes(i.name.toLowerCase())
        );
      },

      addToShoppingList: (name, quantity, category) =>
        set((state) => {
          if (!state.dailyPlan) return state;
          const exists = state.dailyPlan.shoppingList.some(
            (i) => i.name.toLowerCase() === name.toLowerCase()
          );
          if (exists) return state;
          const validCategories = ["produce", "dairy", "meat", "grains", "snacks", "beverages", "other"] as const;
          const cat = validCategories.includes(category as typeof validCategories[number])
            ? (category as typeof validCategories[number])
            : "other";
          const newItem: import("@/types").ShoppingItem = {
            id: crypto.randomUUID(),
            name,
            quantity,
            category: cat,
            checked: false,
          };
          return {
            dailyPlan: {
              ...state.dailyPlan,
              shoppingList: [...state.dailyPlan.shoppingList, newItem],
            },
          };
        }),

      addMissingIngredientsToShoppingList: (ingredients) =>
        set((state) => {
          if (!state.dailyPlan) return state;
          const missing = ingredients.filter((ing) => {
            const inInventory = state.inventory.some(
              (i) => i.name.toLowerCase().includes(ing.toLowerCase()) ||
                     ing.toLowerCase().includes(i.name.toLowerCase())
            );
            const inList = state.dailyPlan!.shoppingList.some(
              (i) => i.name.toLowerCase() === ing.toLowerCase()
            );
            return !inInventory && !inList;
          });
          if (missing.length === 0) return state;
          const newItems: import("@/types").ShoppingItem[] = missing.map((name) => ({
            id: crypto.randomUUID(),
            name,
            quantity: "1x",
            category: "other" as const,
            checked: false,
          }));
          return {
            dailyPlan: {
              ...state.dailyPlan,
              shoppingList: [...state.dailyPlan.shoppingList, ...newItems],
            },
          };
        }),

      addFoodScan: (scan) =>
        set((state) => ({ foodScans: [...state.foodScans, scan].slice(-50) })),
    }),
    {
      name: "adocoach-storage",
      partialize: (state) => ({
        profile: state.profile,
        profileCompleted: state.profileCompleted,
        dailyPlan: state.dailyPlan,
        hydrationLog: state.hydrationLog,
        geminiApiKey: state.geminiApiKey,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        chatMessages: state.chatMessages,
        reflections: state.reflections,
        weightLog: state.weightLog,
        sleepLog: state.sleepLog,
        achievements: state.achievements,
        dayLogs: state.dayLogs,
        stats: state.stats,
        inventory: state.inventory,
        foodScans: state.foodScans,
      }),
    }
  )
);
