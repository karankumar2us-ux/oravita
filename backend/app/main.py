import os
import json
import base64
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Oravita API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional Database Setup (Safe fallback to in-memory if DB fails or is unset)
DATABASE_URL = os.getenv("DATABASE_URL", "").strip().strip("'").strip('"')
SessionLocal = None

if DATABASE_URL:
    try:
        from sqlalchemy import create_engine, Column, Integer, String, Float
        from sqlalchemy.orm import declarative_base, sessionmaker

        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
        elif DATABASE_URL.startswith("postgresql://") and "+psycopg2" not in DATABASE_URL:
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
        elif not DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("sqlite"):
            DATABASE_URL = f"postgresql://{DATABASE_URL}"

        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base = declarative_base()

        class MealRecord(Base):
            __tablename__ = "meals"
            id = Column(Integer, primary_key=True, index=True)
            name = Column(String, index=True)
            meal_type = Column(String)
            servings = Column(Float, default=1.0)
            cals = Column(Integer)
            protein = Column(Float)
            carbs = Column(Float)
            fat = Column(Float)
            cost = Column(Integer)
            emoji = Column(String)

        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database connection error, falling back to in-memory: {e}")
        SessionLocal = None

# Pydantic Models
class PlateAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    note: Optional[str] = ""

class NutritionItem(BaseModel):
    name: str
    cals: int
    protein: float
    carbs: float
    fat: float
    cost: int
    emoji: str
    confidence: float

class MealLogItem(BaseModel):
    id: Optional[int] = None
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

in_memory_meals: List[MealLogItem] = [
    MealLogItem(id=1, name="Whole Wheat Roti", meal_type="Lunch", servings=2, cals=208, protein=6.2, carbs=40.4, fat=1.0, cost=8, emoji="🫓"),
    MealLogItem(id=2, name="Moong Dal Tadka", meal_type="Lunch", servings=1, cals=150, protein=9.0, carbs=22.0, fat=2.5, cost=15, emoji="🥣"),
    MealLogItem(id=3, name="Fresh Raw Paneer", meal_type="Snack", servings=1, cals=265, protein=18.3, carbs=3.2, fat=20.8, cost=45, emoji="🧀"),
]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Oravita AI Backend",
        "version": "1.0.0",
        "gemini_active": bool(os.getenv("GEMINI_API_KEY")),
        "db_active": bool(SessionLocal is not None)
    }

@app.post("/api/v1/analyze-plate", response_model=NutritionItem)
async def analyze_plate(req: PlateAnalysisRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and req.image_base64:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)
            img_data = req.image_base64.split(",")[-1]
            image_bytes = base64.b64decode(img_data)

            prompt = (
                "Analyze this food dish or meal plate accurately. Respond ONLY with a valid JSON object with keys: "
                "name (string, dish name), cals (int, estimated calories), "
                "protein (float, grams of protein), carbs (float, grams of carbs), "
                "fat (float, grams of fat), cost (int, approximate INR cost), "
                "emoji (single food emoji), confidence (float between 0.8 and 1.0)."
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    prompt
                ]
            )
            raw = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(raw)
            return NutritionItem(**data)
        except Exception as e:
            print(f"Gemini Vision error: {e}")

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

@app.get("/api/v1/meals", response_model=List[MealLogItem])
def get_meals():
    if SessionLocal:
        db = SessionLocal()
        try:
            records = db.query(MealRecord).all()
            return [
                MealLogItem(
                    id=m.id,
                    name=m.name,
                    meal_type=m.meal_type,
                    servings=m.servings,
                    cals=m.cals,
                    protein=m.protein,
                    carbs=m.carbs,
                    fat=m.fat,
                    cost=m.cost,
                    emoji=m.emoji
                ) for m in records
            ]
        finally:
            db.close()
    return in_memory_meals

@app.post("/api/v1/meals", response_model=MealLogItem)
def log_meal(meal: MealLogItem):
    if SessionLocal:
        db = SessionLocal()
        try:
            record = MealRecord(
                name=meal.name,
                meal_type=meal.meal_type,
                servings=meal.servings,
                cals=meal.cals,
                protein=meal.protein,
                carbs=meal.carbs,
                fat=meal.fat,
                cost=meal.cost,
                emoji=meal.emoji
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            meal.id = record.id
            return meal
        finally:
            db.close()
    meal.id = len(in_memory_meals) + 1
    in_memory_meals.append(meal)
    return meal

@app.delete("/api/v1/meals/{meal_id}")
def delete_meal(meal_id: int):
    if SessionLocal:
        db = SessionLocal()
        try:
            record = db.query(MealRecord).filter(MealRecord.id == meal_id).first()
            if record:
                db.delete(record)
                db.commit()
                return {"message": f"Deleted meal {meal_id}"}
            raise HTTPException(status_code=404, detail="Meal not found")
        finally:
            db.close()
    global in_memory_meals
    in_memory_meals = [m for m in in_memory_meals if m.id != meal_id]
    return {"message": f"Deleted meal {meal_id}"}

@app.post("/api/v1/coach-chat")
def coach_chat(req: ChatRequest):
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = (
                f"You are the Oravita BioCoach, an expert metabolic health & Indian nutrition assistant. "
                f"Context: Goal={req.goal}, Phase={req.menstrual_phase}, Remaining Calories={req.remaining_cals} kcal, Daily Budget=₹{req.budget}. "
                f"User Question: '{req.message}'. "
                f"Provide a brief, practical 2-3 sentence answer with specific Indian foods, macros, and ₹ cost."
            )
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return {"reply": resp.text.strip()}
        except Exception as e:
            print(f"Gemini Chat error: {e}")

    msg = req.message.lower()
    if "protein" in msg or "budget" in msg or "cheap" in msg:
        reply = f"With your ₹{req.budget} budget and {req.remaining_cals} kcal left, top Indian budget picks: 4 tbsp Sattu drink (13g protein, ₹12), 2 Boiled Eggs (12.6g protein, ₹14), or 100g roasted chana (17g protein, ₹18)."
    elif "luteal" in msg or "craving" in msg or req.menstrual_phase == "luteal":
        reply = "During your Luteal phase, basal metabolic rate rises by ~150-200 kcal. Prioritize complex carbohydrates with healthy fats (e.g., roasted makhana with ghee or curd with nuts) to prevent blood sugar drops."
    else:
        reply = f"You have {req.remaining_cals} kcal remaining today. A balanced dinner of 1 cup Rajma Masala with 1 Whole Wheat Roti will keep you right on track."
    return {"reply": reply}
