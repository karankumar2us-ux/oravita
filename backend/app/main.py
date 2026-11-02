from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="Oravita API", version="1.0.0")

# 1. CORS Configuration (Allows Vercel frontend to call this backend)
origins = [
    "https://oravita-seven.vercel.app",
    "http://localhost:3000",
    "*"  # Broad access for preview & production domains
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Schemas
class PlateAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    note: Optional[str] = ""

class NutritionItem(BaseModel):
    name: string if False else str
    cals: int
    protein: float
    carbs: float
    fat: float
    cost: int
    emoji: str
    confidence: float

class MealLogItem(BaseModel):
    name: str
    meal_type: str
    servings: float
    cals: int
    protein: float
    carbs: float
    fat: float
    cost: int
    emoji: str

class ChatRequest(BaseModel):
    message: str
    remaining_cals: int
    budget: int
    menstrual_phase: Optional[str] = "follicular"
    goal: Optional[str] = "fat_loss"

# In-memory session store (persists across requests during runtime)
db_meals: List[MealLogItem] = [
    MealLogItem(name="Whole Wheat Roti", meal_type="Lunch", servings=2, cals=208, protein=6.2, carbs=40.4, fat=1.0, cost=8, emoji="🫓"),
    MealLogItem(name="Moong Dal Tadka", meal_type="Lunch", servings=1, cals=150, protein=9.0, carbs=22.0, fat=2.5, cost=15, emoji="🥣"),
    MealLogItem(name="Fresh Raw Paneer", meal_type="Snack", servings=1, cals=265, protein=18.3, carbs=3.2, fat=20.8, cost=45, emoji="🧀"),
]

@app.get("/")
def read_root():
    return {"status": "online", "service": "Oravita AI Backend", "version": "1.0.0"}

# 3. AI Food Plate Analysis Endpoint
@app.post("/api/v1/analyze-plate", response_model=NutritionItem)
async def analyze_plate(req: PlateAnalysisRequest):
    # Simulated Gemini 2.5 Flash Vision heuristics for Indian meals
    # Ready to hook directly to google-genai SDK with GEMINI_API_KEY
    return NutritionItem(
        name="Paneer Bhurji & 2 Phulkas",
        cals=395,
        protein=21.5,
        carbs=38.0,
        fat=14.2,
        cost=42,
        emoji="🥘",
        confidence=0.96
    )

# 4. Meal Logging Endpoints
@app.get("/api/v1/meals", response_model=List[MealLogItem])
def get_meals():
    return db_meals

@app.post("/api/v1/meals", response_model=MealLogItem)
def log_meal(meal: MealLogItem):
    db_meals.append(meal)
    return meal

@app.delete("/api/v1/meals/{meal_name}")
def delete_meal(meal_name: str):
    global db_meals
    db_meals = [m for m in db_meals if m.name != meal_name]
    return {"message": f"Deleted {meal_name}"}

# 5. AI BioCoach Chat Endpoint
@app.post("/api/v1/coach-chat")
def coach_chat(req: ChatRequest):
    msg = req.message.lower()
    
    if "protein" in msg or "budget" in msg or "cheap" in msg:
        reply = (
            f"With your ₹{req.budget} budget and {req.remaining_cals} kcal left, top Indian budget picks: "
            "4 tbsp Sattu drink (13g protein, ₹12), 2 Boiled Eggs (12.6g protein, ₹14), or 100g roasted chana (17g protein, ₹18)."
        )
    elif "luteal" in msg or "craving" in msg or req.menstrual_phase == "luteal":
        reply = (
            "During your Luteal phase, basal metabolic rate rises by ~150-200 kcal. "
            "Prioritize complex carbohydrates with healthy fats (e.g., roasted makhana with a touch of ghee or curd with nuts) to prevent blood sugar drops."
        )
    elif "hardgainer" in msg or req.goal == "muscle_gain":
        reply = (
            "For lean bulking: add calorie-dense whole foods without bloating. "
            "A glass of whole milk blended with 1 banana and 2 tbsp peanut butter gives an easy ~400 kcal surplus."
        )
    else:
        reply = (
            f"You have {req.remaining_cals} kcal remaining today. "
            "Consider a balanced dinner of 1 cup Rajma Masala with 1 Whole Wheat Roti to finish hitting your daily targets."
        )

    return {"reply": reply}
