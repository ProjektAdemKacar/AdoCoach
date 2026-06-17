export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female" | "other";
  wakeUpTime: string;
  sleepTime: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  foodPreferences: {
    dislikedFoods: string[];
    allergies: string[];
    diet: "normal" | "vegetarian" | "vegan" | "keto" | "lowcarb";
  };
  sportPreferences: {
    location: "home" | "gym" | "outdoor";
    daysPerWeek: number;
    minutesPerSession: number;
    preferredTypes: string[];
  };
  customNotes: string;
}

export interface DailyPlan {
  id: string;
  date: string;
  greeting: string;
  motivationQuote: string;
  schedule: ScheduleItem[];
  meals: Meal[];
  waterGoal: number;
  waterConsumed: number;
  workout: Workout | null;
  shoppingList: ShoppingItem[];
  eveningReflection: string | null;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  category: "routine" | "meal" | "sport" | "hydration" | "task" | "rest";
  completed: boolean;
}

export interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  description: string;
  calories: number;
  ingredients: string[];
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  duration: number;
  exercises: Exercise[];
  completed: boolean;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  description: string;
  completed: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: "produce" | "dairy" | "meat" | "grains" | "snacks" | "beverages" | "other";
  checked: boolean;
}

export interface HydrationEntry {
  id: string;
  time: string;
  amount: number;
}

export interface Reflection {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  text: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: 1 | 2 | 3 | 4 | 5;
  durationHours: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirement: { type: string; value: number };
}

export interface DayLog {
  date: string;
  waterPercent: number;
  caloriesConsumed: number;
  caloriesGoal: number;
  workoutDone: boolean;
  mood: number | null;
  sleepHours: number | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: "produce" | "dairy" | "meat" | "grains" | "snacks" | "beverages" | "spices" | "other";
  addedAt: string;
}

export interface FoodScanResult {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  details: string;
  scannedAt: string;
}
