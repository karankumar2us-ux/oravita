from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Onboarding Profile Schemas
class ProfileCreate(BaseModel):
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    target_weight_kg: Optional[float] = None
    activity_level: str
    fitness_goal: str
    is_hardgainer: bool = False
    tracks_cycle: bool = False
    last_period_start_date: Optional[date] = None
    daily_budget_inr: float = 200.0
    dietary_preference: str = "vegetarian"

# Food Log Schema
class FoodLogCreate(BaseModel):
    food_id: int
    meal_type: str
    servings_consumed: float = 1.0
