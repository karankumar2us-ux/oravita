"use client";

import React, { useState, useMemo } from "react";
import { 
  Flame, 
  Sparkles, 
  Heart, 
  Calendar, 
  Plus, 
  Trash2, 
  Activity, 
  DollarSign, 
  Zap, 
  Info,
  CheckCircle2,
  UtensilsCrossed
} from "lucide-react";

// --- Biological Constants & Indian Food Seed Data ---
const FOOD_CATALOG = [
  { id: 1, name: "Roti (Whole Wheat Chapati)", hindi: "रोटी / चपाती", cals: 104, protein: 3.1, carbs: 20.2, fat: 0.5, cost: 3, unit: "1 roti (35g)" },
  { id: 2, name: "Moong Dal (Cooked)", hindi: "मूंग दाल", cals: 150, protein: 9.0, carbs: 22.0, fat: 2.5, cost: 15, unit: "1 katori (150g)" },
  { id: 3, name: "Paneer (Fresh Raw)", hindi: "ताज़ा पनीर", cals: 265, protein: 18.3, carbs: 3.2, fat: 20.8, cost: 45, unit: "100g slice" },
  { id: 4, name: "Sattu Flour Shake", hindi: "सत्तू ड्रिंक", cals: 205, protein: 13.0, carbs: 32.0, fat: 2.5, cost: 10, unit: "4 tbsp (50g)" },
  { id: 5, name: "Whole Boiled Egg", hindi: "उबला अंडा", cals: 78, protein: 6.3, carbs: 0.6, fat: 5.3, cost: 7, unit: "1 large egg" },
  { id: 6, name: "Basmati Rice (Steamed)", hindi: "चावल", cals: 195, protein: 4.0, carbs: 43.0, fat: 0.4, cost: 8, unit: "1 katori (150g)" },
  { id: 7, name: "Plain Curd / Dahi", hindi: "दही", cals: 92, protein: 4.5, carbs: 6.0, fat: 5.0, cost: 12, unit: "1 katori (150g)" },
];

export default function OravitaApp() {
  // Bio Profile State
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(172);
  const [age, setAge] = useState<number>(22);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [goal, setGoal] = useState<"fat_loss" | "muscle_gain" | "maintenance">("fat_loss");
  const [isHardgainer, setIsHardgainer] = useState<boolean>(false);
  const [menstrualPhase, setMenstrualPhase] = useState<"follicular" | "luteal">("follicular");
  const [dailyBudget, setDailyBudget] = useState<number>(200);

  // Meal Logging State
  const [loggedMeals, setLoggedMeals] = useState<Array<{
    id: number;
    foodId: number;
    name: string;
    servings: number;
    cals: number;
    protein: number;
    carbs: number;
    fat: number;
    cost: number;
  }>>([
    { id: 1, foodId: 1, name: "Roti (Whole Wheat Chapati)", servings: 2, cals: 208, protein: 6.2, carbs: 40.4, fat: 1.0, cost: 6 },
    { id: 2, foodId: 2, name: "Moong Dal (Cooked)", servings: 1, cals: 150, protein: 9.0, carbs: 22.0, fat: 2.5, cost: 15 },
    { id: 3, foodId: 3, name: "Paneer (Fresh Raw)", servings: 1, cals: 265, protein: 18.3, carbs: 3.2, fat: 20.8, cost: 45 },
  ]);

  // Selected Food to Add
  const [selectedFoodId, setSelectedFoodId] = useState<number>(1);
  const [servingInput, setServingInput] = useState<number>(1);

  // --- Dynamic Nutrition Engine Calculation ---
  const targets = useMemo(() => {
    // Mifflin-St Jeor Formula
    const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
    const tdee = bmr * 1.4; // Moderately active default

    let targetCalories = tdee;
    let proteinMultiplier = 1.6;
    const notes: string[] = [];

    if (goal === "fat_loss") {
      targetCalories = Math.max(tdee - 450, gender === "female" ? 1200 : 1500);
      proteinMultiplier = 1.9;
      notes.push("Safe 450 kcal deficit to preserve metabolic rate.");
    } else if (goal === "muscle_gain") {
      const surplus = isHardgainer ? 450 : 280;
      targetCalories = tdee + surplus;
      proteinMultiplier = isHardgainer ? 2.1 : 1.8;
      notes.push(`Caloric surplus (+${surplus} kcal) designed for lean mass growth.`);
    }

    if (gender === "female" && menstrualPhase === "luteal") {
      targetCalories += 180;
      notes.push("Luteal Phase Active: +180 kcal added to counter progestin thermogenesis & stabilize cravings.");
    }

    const protein = Math.round(weight * proteinMultiplier);
    const fat = Math.round((targetCalories * 0.28) / 9);
    const carbs = Math.round(Math.max(0, targetCalories - (protein * 4 + fat * 9)) / 4);

    return {
      cals: Math.round(targetCalories),
      protein,
      carbs,
      fat,
      notes,
    };
  }, [weight, height, age, gender, goal, isHardgainer, menstrualPhase]);

  // Aggregated Logged Totals
  const totals = useMemo(() => {
    return loggedMeals.reduce(
      (acc, meal) => ({
        cals: acc.cals + meal.cals,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
        cost: acc.cost + meal.cost,
      }),
      { cals: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }
    );
  }, [loggedMeals]);

  const addMeal = () => {
    const food = FOOD_CATALOG.find((f) => f.id === selectedFoodId);
    if (!food) return;

    const newEntry = {
      id: Date.now(),
      foodId: food.id,
      name: food.name,
      servings: servingInput,
      cals: Math.round(food.cals * servingInput),
      protein: Number((food.protein * servingInput).toFixed(1)),
      carbs: Number((food.carbs * servingInput).toFixed(1)),
      fat: Number((food.fat * servingInput).toFixed(1)),
      cost: Math.round(food.cost * servingInput),
    };
    setLoggedMeals((prev) => [...prev, newEntry]);
  };

  const removeMeal = (id: number) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-emerald-900/30 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Oravita <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">AI Bio-Sync</span>
              </h1>
              <p className="text-xs text-slate-400">Eat with your biology. Master your metabolism.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">Daily Food Budget</p>
              <p className="text-sm font-semibold text-emerald-400">₹{totals.cost} / ₹{dailyBudget}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Biological Profile Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Biological Engine Profile
              </h2>
              <span className="text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800/40">Realtime Sync</span>
            </div>

            {/* Gender Toggle */}
            <div>
              <label className="text-xs text-slate-400 font-medium">Gender</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => setGender("female")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                    gender === "female"
                      ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Female (Cycle-Aware)
                </button>
                <button
                  onClick={() => setGender("male")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                    gender === "male"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Menstrual Phase Selector (If Female) */}
            {gender === "female" && (
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-pink-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-pink-400" /> Menstrual Cycle Phase
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMenstrualPhase("follicular")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                      menstrualPhase === "follicular"
                        ? "bg-pink-600 text-white"
                        : "bg-slate-800/80 text-slate-300"
                    }`}
                  >
                    Follicular (Day 1-14)
                  </button>
                  <button
                    onClick={() => setMenstrualPhase("luteal")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                      menstrualPhase === "luteal"
                        ? "bg-pink-600 text-white"
                        : "bg-slate-800/80 text-slate-300"
                    }`}
                  >
                    Luteal (Day 15-28)
                  </button>
                </div>
                <p className="text-[11px] text-pink-200/80 leading-relaxed">
                  {menstrualPhase === "luteal" 
                    ? "✨ Luteal Phase increases resting expenditure by ~100-300 kcal. Craving complex carbs is natural; temporary fluid weight is normal."
                    : "⚡ Follicular Phase: Higher insulin sensitivity and energy levels. Great for progressive overload."}
                </p>
              </div>
            )}

            {/* Goal Selector */}
            <div>
              <label className="text-xs text-slate-400 font-medium">Metabolic Trajectory</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { id: "fat_loss", label: "Fat Loss" },
                  { id: "maintenance", label: "Maintain" },
                  { id: "muscle_gain", label: "Build Muscle" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition ${
                      goal === g.id
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardgainer Toggle */}
            {goal === "muscle_gain" && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <div>
                  <p className="text-xs font-semibold text-white flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Skinny / Fast Metabolism
                  </p>
                  <p className="text-[11px] text-slate-400">Hardgainer needing high caloric density</p>
                </div>
                <input
                  type="checkbox"
                  checked={isHardgainer}
                  onChange={(e) => setIsHardgainer(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            )}

            {/* Body Metrics Sliders */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm font-semibold text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm font-semibold text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm font-semibold text-white"
                />
              </div>
            </div>

            {/* Daily INR Budget */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Daily Food Budget (INR)</span>
                <span className="font-semibold text-emerald-400">₹{dailyBudget}/day</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Targets & Indian Food Tracker */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daily Biological Macro Dashboard */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Biological Targets</span>
                <h3 className="text-2xl font-black text-white flex items-baseline gap-2 mt-0.5">
                  {totals.cals} <span className="text-sm font-normal text-slate-400">/ {targets.cals} kcal</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Budget Spent</span>
                <p className="text-xl font-bold text-emerald-400">₹{totals.cost} <span className="text-xs text-slate-500 font-normal">/ ₹{dailyBudget}</span></p>
              </div>
            </div>

            {/* Macro Bars */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Protein</span>
                  <span className="font-bold text-emerald-400">{totals.protein}g / {targets.protein}g</span>
                </div>
                <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totals.protein / targets.protein) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Carbs</span>
                  <span className="font-bold text-amber-400">{totals.carbs}g / {targets.carbs}g</span>
                </div>
                <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totals.carbs / targets.carbs) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Fats</span>
                  <span className="font-bold text-sky-400">{totals.fat}g / {targets.fat}g</span>
                </div>
                <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totals.fat / targets.fat) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Engine Insights */}
            <div className="pt-2 border-t border-slate-800">
              {targets.notes.map((note, idx) => (
                <p key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  {note}
                </p>
              ))}
            </div>
          </div>

          {/* Quick Indian Food Logger */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" /> Log Indian Meal
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(Number(e.target.value))}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                {FOOD_CATALOG.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.hindi}) — {f.cals} kcal, {f.protein}g P (₹{f.cost})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={servingInput}
                  onChange={(e) => setServingInput(Number(e.target.value))}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-center font-bold text-white"
                />
                <button
                  onClick={addMeal}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-1 shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Logged Meal Items */}
            <div className="divide-y divide-slate-800/80">
              {loggedMeals.map((meal) => (
                <div key={meal.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{meal.name}</p>
                    <p className="text-xs text-slate-400">
                      {meal.servings} serving(s) • {meal.cals} kcal • {meal.protein}g P • ₹{meal.cost}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
