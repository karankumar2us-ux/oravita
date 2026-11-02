"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Flame,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Droplets,
  Heart,
  Utensils,
  Zap,
  Target,
  User,
  X,
  Camera,
  MessageSquare,
  Send,
  Bot,
  Upload,
  CheckCircle2,
  Loader2,
  HelpCircle
} from "lucide-react";

interface FoodItem {
  id: number;
  name: string;
  cals: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
  emoji: string;
}

const INDIAN_FOODS: FoodItem[] = [
  { id: 1, name: "Whole Wheat Roti", cals: 104, protein: 3.1, carbs: 20.2, fat: 0.5, cost: 4, emoji: "🫓" },
  { id: 2, name: "Moong Dal Tadka", cals: 150, protein: 9.0, carbs: 22.0, fat: 2.5, cost: 15, emoji: "🥣" },
  { id: 3, name: "Fresh Raw Paneer", cals: 265, protein: 18.3, carbs: 3.2, fat: 20.8, cost: 45, emoji: "🧀" },
  { id: 4, name: "Sattu Protein Shake", cals: 205, protein: 13.0, carbs: 32.0, fat: 2.5, cost: 12, emoji: "🥤" },
  { id: 5, name: "Boiled Egg (Large)", cals: 78, protein: 6.3, carbs: 0.6, fat: 5.3, cost: 7, emoji: "🥚" },
  { id: 6, name: "Steamed Basmati Rice", cals: 195, protein: 4.0, carbs: 43.0, fat: 0.4, cost: 8, emoji: "🍚" },
  { id: 7, name: "Probiotic Curd (Dahi)", cals: 92, protein: 4.5, carbs: 6.0, fat: 5.0, cost: 12, emoji: "🥛" },
  { id: 8, name: "Rajma Masala", cals: 210, protein: 11.2, carbs: 31.0, fat: 4.5, cost: 22, emoji: "🍛" },
];

export default function OravitaApp() {
  const [activeTab, setActiveTab] = useState<"today" | "progress">("today");
  const [selectedDay, setSelectedDay] = useState<number>(14);

  // Bio state
  const [gender, setGender] = useState<"female" | "male">("female");
  const [goal, setGoal] = useState<"fat_loss" | "muscle_gain">("fat_loss");
  const [isHardgainer, setIsHardgainer] = useState(false);
  const [menstrualPhase, setMenstrualPhase] = useState<"follicular" | "luteal">("follicular");
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [dailyBudget, setDailyBudget] = useState(250);

  // Modal Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Meal Logging
  const [selectedFoodId, setSelectedFoodId] = useState(1);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Lunch");

  const [loggedMeals, setLoggedMeals] = useState([
    { id: 1, name: "Whole Wheat Roti", mealType: "Lunch", servings: 2, cals: 208, protein: 6.2, carbs: 40.4, fat: 1.0, cost: 8, emoji: "🫓" },
    { id: 2, name: "Moong Dal Tadka", mealType: "Lunch", servings: 1, cals: 150, protein: 9.0, carbs: 22.0, fat: 2.5, cost: 15, emoji: "🥣" },
    { id: 3, name: "Fresh Raw Paneer", mealType: "Snack", servings: 1, cals: 265, protein: 18.3, carbs: 3.2, fat: 20.8, cost: 45, emoji: "🧀" },
  ]);

  // AI Camera Scanner State
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ name: string; cals: number; p: number; c: number; f: number; cost: number; emoji: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Coach Chat State
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Hello! I'm your Oravita BioCoach. I can suggest high-protein meals within your daily ₹250 budget or help optimize nutrition for your cycle phase."
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  const targets = useMemo(() => {
    let baseCals = 1800;
    let protein = 120;
    let carbs = 200;
    let fat = 50;

    if (goal === "fat_loss") {
      baseCals = 1450;
      protein = 130;
      carbs = 135;
      fat = 42;
    } else {
      baseCals = isHardgainer ? 2550 : 2150;
      protein = isHardgainer ? 145 : 130;
      carbs = isHardgainer ? 350 : 280;
      fat = isHardgainer ? 75 : 60;
    }

    if (gender === "female" && menstrualPhase === "luteal") {
      baseCals += 180;
      carbs += 25;
      fat += 8;
    }

    return { baseCals, protein, carbs, fat };
  }, [goal, isHardgainer, gender, menstrualPhase]);

  const consumed = useMemo(() => {
    return loggedMeals.reduce(
      (acc, item) => ({
        cals: acc.cals + item.cals,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
        cost: acc.cost + item.cost,
      }),
      { cals: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }
    );
  }, [loggedMeals]);

  const remainingCals = Math.max(0, targets.baseCals - consumed.cals);
  const calPercent = Math.min(100, Math.round((consumed.cals / targets.baseCals) * 100));

  const addMeal = () => {
    const food = INDIAN_FOODS.find((f) => f.id === selectedFoodId);
    if (!food) return;

    setLoggedMeals((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: food.name,
        mealType,
        servings,
        cals: Math.round(food.cals * servings),
        protein: Number((food.protein * servings).toFixed(1)),
        carbs: Number((food.carbs * servings).toFixed(1)),
        fat: Number((food.fat * servings).toFixed(1)),
        cost: Math.round(food.cost * servings),
        emoji: food.emoji,
      },
    ]);
    setIsModalOpen(false);
  };

  const deleteMeal = (id: number) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  // Image Upload & Recognition Simulation
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setScannedImage(previewUrl);
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      // Simulated Indian Plate Multi-item Detection
      setScanResult({
        name: "Paneer Bhurji & 2 Phulkas",
        cals: 395,
        p: 21.5,
        c: 38.0,
        f: 14.2,
        cost: 42,
        emoji: "🥘"
      });
    }, 1800);
  };

  const confirmScannedMeal = () => {
    if (!scanResult) return;
    setLoggedMeals((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: scanResult.name,
        mealType: "Lunch",
        servings: 1,
        cals: scanResult.cals,
        protein: scanResult.p,
        carbs: scanResult.c,
        fat: scanResult.f,
        cost: scanResult.cost,
        emoji: scanResult.emoji,
      }
    ]);
    setIsCameraOpen(false);
    setScannedImage(null);
    setScanResult(null);
  };

  // AI NutriCoach Response Handler
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let botReply = `You currently have ${remainingCals} kcal remaining. `;
      const lower = userText.toLowerCase();

      if (lower.includes("protein") || lower.includes("budget") || lower.includes("cheap")) {
        botReply += "For high protein under budget: Consider 4 tbsp Sattu drink (13g protein, ₹12) or 2 Boiled Eggs (12.6g protein, ₹14).";
      } else if (lower.includes("craving") || lower.includes("sweet") || lower.includes("luteal")) {
        botReply += "During the luteal phase, progesterone can trigger carb cravings. Try roasted makhana or a small bowl of curd with a touch of honey.";
      } else {
        botReply += `To reach your ${targets.protein}g protein target, add a serving of Paneer (18.3g P) or Rajma Masala to dinner.`;
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F0F3F1] flex justify-center py-0 md:py-8 font-sans antialiased text-slate-800">
      <div className="w-full max-w-[430px] bg-[#FAFCFB] min-h-screen md:min-h-[890px] md:rounded-[44px] shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="pt-6 px-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0E7A53] flex items-center justify-center text-white shadow-md shadow-emerald-800/20">
              <Sparkles className="w-5 h-5 text-emerald-200"/>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Oravita</h1>
              <p className="text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">AI Metabolic Health</p>
            </div>
          </div>
          <button
            onClick={() => setGender(gender === "female" ? "male" : "female")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            <User className="w-3.5 h-3.5 text-slate-500"/>
            <span>{gender === "female" ? "Female" : "Male"}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2">
          <div className="bg-[#EBEFED] p-1 rounded-2xl flex">
            <button
              onClick={() => setActiveTab("today")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === "today" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === "progress" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Progress Report
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-5 pb-24">
          {activeTab === "today" ? (
            <>
              {/* Date Strip */}
              <div className="flex items-center justify-between py-1">
                {[11, 12, 13, 14, 15, 16, 17].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`w-10 h-13 py-2 rounded-2xl flex flex-col items-center justify-center transition ${
                      selectedDay === d
                        ? "bg-[#0E7A53] text-white shadow-md shadow-emerald-900/20"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-[10px] font-medium uppercase">
                      {["S", "M", "T", "W", "T", "F", "S"][(d + 4) % 7]}
                    </span>
                    <span className="text-xs font-extrabold mt-0.5">{d}</span>
                  </button>
                ))}
              </div>

              {/* Calorie Arc Display */}
              <div className="p-6 rounded-[36px] bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#F1F5F3" strokeWidth="9" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#0E7A53"
                      strokeWidth="9"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * calPercent) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
                      <Flame className="w-4 h-4 text-[#0E7A53] fill-emerald-600"/>
                    </div>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {remainingCals.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Remaining Kcal
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                      {consumed.cals} / {targets.baseCals} kcal
                    </span>
                  </div>
                </div>

                {/* Macro Pills */}
                <div className="w-full grid grid-cols-3 gap-2.5 mt-4">
                  <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-bold text-sky-600 uppercase">Protein</span>
                    <span className="text-base font-black text-slate-900 mt-1">{consumed.protein}g</span>
                    <span className="text-[10px] text-slate-400">/ {targets.protein}g</span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.min(100, (consumed.protein / targets.protein) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Carbs</span>
                    <span className="text-base font-black text-slate-900 mt-1">{consumed.carbs}g</span>
                    <span className="text-[10px] text-slate-400">/ {targets.carbs}g</span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (consumed.carbs / targets.carbs) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Fat</span>
                    <span className="text-base font-black text-slate-900 mt-1">{consumed.fat}g</span>
                    <span className="text-[10px] text-slate-400">/ {targets.fat}g</span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (consumed.fat / targets.fat) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar: AI Camera Scanner & NutriCoach */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 active:scale-98 transition font-bold text-xs"
                >
                  <Camera className="w-4 h-4" /> AI Plate Scanner
                </button>
                <button
                  onClick={() => setIsCoachOpen(true)}
                  className="p-3.5 rounded-3xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center gap-2 shadow-sm active:scale-98 transition font-bold text-xs hover:bg-slate-50"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" /> BioCoach AI
                </button>
              </div>

              {/* Bio Sync Controls */}
              <div className="p-4 rounded-3xl bg-white border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600"/> Metabolic Personalization
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active Bio-Sync
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGoal("fat_loss")}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold transition ${
                      goal === "fat_loss" ? "bg-[#0E7A53] text-white" : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    Fat Loss (-450 kcal)
                  </button>
                  <button
                    onClick={() => setGoal("muscle_gain")}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold transition ${
                      goal === "muscle_gain" ? "bg-[#0E7A53] text-white" : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    Build Muscle
                  </button>
                </div>

                {goal === "muscle_gain" && (
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600"/>
                      <div>
                        <p className="text-xs font-bold text-amber-900">Skinny Hardgainer Mode</p>
                        <p className="text-[10px] text-amber-700">+400 kcal surplus for fast metabolisms</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isHardgainer}
                      onChange={(e) => setIsHardgainer(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                  </label>
                )}

                {gender === "female" && (
                  <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-100 space-y-2">
                    <span className="text-[11px] font-bold text-pink-900 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-pink-500"/> Menstrual Phase Sync
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMenstrualPhase("follicular")}
                        className={`py-1.5 rounded-xl text-[10px] font-extrabold transition ${
                          menstrualPhase === "follicular" ? "bg-pink-500 text-white" : "bg-white text-pink-800 border border-pink-200"
                        }`}
                      >
                        Follicular (Day 1-14)
                      </button>
                      <button
                        onClick={() => setMenstrualPhase("luteal")}
                        className={`py-1.5 rounded-xl text-[10px] font-extrabold transition ${
                          menstrualPhase === "luteal" ? "bg-pink-500 text-white" : "bg-white text-pink-800 border border-pink-200"
                        }`}
                      >
                        Luteal (Day 15-28)
                      </button>
                    </div>
                    <p className="text-[10px] text-pink-800">
                      {menstrualPhase === "luteal"
                        ? "✨ Luteal Phase: Progesterone elevates expenditure (+180 kcal). Minor fluid retention is expected."
                        : "⚡ Follicular Phase: High insulin sensitivity & peak stamina."}
                    </p>
                  </div>
                )}
              </div>

              {/* Water & Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-3xl bg-white border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-500"/> Water Intake
                    </span>
                    <p className="text-base font-black text-slate-900 mt-0.5">
                      {(waterGlasses * 0.25).toFixed(1)}L <span className="text-[10px] text-slate-400 font-normal">/ 2.5L</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setWaterGlasses((v) => v + 1)}
                    className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-sm active:scale-95"
                  >
                    +
                  </button>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-600"/> Daily Budget
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    ₹{consumed.cost} <span className="text-[10px] text-slate-400 font-normal">/ ₹{dailyBudget}</span>
                  </p>
                </div>
              </div>

              {/* Logged Meals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-emerald-700"/> Today's Logged Meals
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0E7A53] hover:bg-emerald-800 text-white text-xs font-bold active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5"/> Log Food
                  </button>
                </div>

                <div className="space-y-2">
                  {loggedMeals.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-3xl bg-white border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-lg border border-slate-100">
                          {item.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{item.name}</span>
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                              {item.mealType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.servings} serving • {item.cals} kcal • {item.protein}g P • ₹{item.cost}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMeal(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Progress Tab */
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-3xl bg-white border border-slate-100 space-y-3">
                <span className="text-xs font-extrabold text-slate-900">7-Day Caloric Adherence</span>
                <div className="h-40 flex items-end justify-between pt-4 px-2">
                  {[
                    { day: "M", h: 80, val: "1.4k" },
                    { day: "T", h: 90, val: "1.5k" },
                    { day: "W", h: 70, val: "1.3k" },
                    { day: "T", h: 100, val: "1.6k" },
                    { day: "F", h: 85, val: "1.4k" },
                    { day: "S", h: 95, val: "1.5k" },
                    { day: "S", h: 75, val: "1.4k" },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 font-semibold">{bar.val}</span>
                      <div className="w-7 bg-[#0E7A53] rounded-t-xl" style={{ height: `${bar.h}px` }} />
                      <span className="text-[10px] font-bold text-slate-600">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-slate-100 space-y-2">
                <span className="text-xs font-extrabold text-slate-900">Weight & Trend</span>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Current Weight</span>
                    <p className="text-xl font-black text-slate-900">65.2 kg</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Target</span>
                    <p className="text-xl font-black text-emerald-700">60.0 kg</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sheet 1: Manual Food Logger */}
        {isModalOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end">
            <div className="w-full bg-white rounded-t-[36px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">Log Indian Food</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMealType(m)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition ${
                      mealType === m ? "bg-[#0E7A53] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(Number(e.target.value))}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
              >
                {INDIAN_FOODS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.emoji} {f.name} — {f.cals} kcal, {f.protein}g Protein (₹{f.cost})
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-700">Servings</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServings((s) => Math.max(0.5, s - 0.5))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-black text-slate-700"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-slate-900 w-8 text-center">{servings}</span>
                  <button
                    onClick={() => setServings((s) => s + 0.5)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-black text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={addMeal}
                className="w-full py-3 rounded-2xl bg-[#0E7A53] hover:bg-emerald-800 text-white font-black text-sm shadow-lg shadow-emerald-900/20 active:scale-98 transition"
              >
                Confirm & Log Meal
              </button>
            </div>
          </div>
        )}

        {/* Modal Sheet 2: AI Plate Scanner Camera Drawer */}
        {isCameraOpen && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end">
            <div className="w-full bg-white rounded-t-[36px] p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-700" /> AI Food Vision Scanner
                  </h3>
                  <p className="text-[11px] text-slate-500">Snap a photo of your thali or meal plate</p>
                </div>
                <button
                  onClick={() => {
                    setIsCameraOpen(false);
                    setScannedImage(null);
                    setScanResult(null);
                  }}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />

              {!scannedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-emerald-50 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">Tap to take photo or upload plate</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports Roti, Dal, Rice, Paneer, Sabzi, Eggs</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    <img src={scannedImage} alt="Scanned meal" className="w-full h-full object-cover" />
                    {isScanning && (
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                        <span className="text-xs font-bold">Analyzing Indian plate components...</span>
                      </div>
                    )}
                  </div>

                  {scanResult && (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {scanResult.emoji} {scanResult.name}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">₹{scanResult.cost}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center pt-1">
                        <div className="bg-white p-1.5 rounded-xl border border-emerald-100">
                          <span className="text-[9px] text-slate-400 font-semibold block">Calories</span>
                          <span className="text-xs font-black text-slate-800">{scanResult.cals}</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-emerald-100">
                          <span className="text-[9px] text-slate-400 font-semibold block">Protein</span>
                          <span className="text-xs font-black text-sky-600">{scanResult.p}g</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-emerald-100">
                          <span className="text-[9px] text-slate-400 font-semibold block">Carbs</span>
                          <span className="text-xs font-black text-amber-600">{scanResult.c}g</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-emerald-100">
                          <span className="text-[9px] text-slate-400 font-semibold block">Fat</span>
                          <span className="text-xs font-black text-rose-600">{scanResult.f}g</span>
                        </div>
                      </div>

                      <button
                        onClick={confirmScannedMeal}
                        className="w-full py-2.5 mt-2 rounded-xl bg-[#0E7A53] hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition"
                      >
                        Confirm & Add to Diary
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Sheet 3: AI NutriCoach Assistant Drawer */}
        {isCoachOpen && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end">
            <div className="w-full bg-white rounded-t-[36px] p-6 space-y-4 h-[75vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">BioCoach AI</h3>
                    <p className="text-[10px] text-slate-400">Contextual to your ₹{dailyBudget} budget & biological phase</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCoachOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-4 h-4"/>
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-[#0E7A53] text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Ask: 'What can I eat under ₹50 with 20g protein?'"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-slate-100 border-none rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-[#0E7A53] hover:bg-emerald-800 text-white rounded-xl transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
