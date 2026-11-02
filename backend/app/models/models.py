from datetime import datetime, date
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, 
    DateTime, Date, ForeignKey, Enum, Text
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class GenderEnum(str, PyEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class GoalEnum(str, PyEnum):
    FAT_LOSS = "fat_loss"
    MAINTENANCE = "maintenance"
    MUSCLE_GAIN = "muscle_gain"

class ActivityEnum(str, PyEnum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATE = "moderate"
    VERY_ACTIVE = "very_active"
    EXTRA_ACTIVE = "extra_active"

class MealTypeEnum(str, PyEnum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    food_logs = relationship("MealLog", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    target_weight_kg = Column(Float, nullable=True)
    activity_level = Column(Enum(ActivityEnum), default=ActivityEnum.SEDENTARY)
    fitness_goal = Column(Enum(GoalEnum), default=GoalEnum.MAINTENANCE)
    is_hardgainer = Column(Boolean, default=False)
    tracks_cycle = Column(Boolean, default=False)
    last_period_start_date = Column(Date, nullable=True)
    cycle_length_days = Column(Integer, default=28)
    daily_budget_inr = Column(Float, default=200.0)
    dietary_preference = Column(String(50), default="vegetarian")
    allergies = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    hindi_name = Column(String(150), nullable=True)
    category = Column(String(100), index=True)
    regional_cuisine = Column(String(100), default="North Indian")
    is_vegetarian = Column(Boolean, default=True)
    is_vegan = Column(Boolean, default=False)
    serving_unit = Column(String(50), default="100g")
    serving_weight_grams = Column(Float, default=100.0)
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    fiber_g = Column(Float, default=0.0)
    estimated_cost_inr = Column(Float, default=20.0)

class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("food_items.id"), nullable=False)
    meal_type = Column(Enum(MealTypeEnum), nullable=False)
    servings_consumed = Column(Float, default=1.0)
    log_date = Column(Date, default=date.today, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="food_logs")
    food = relationship("FoodItem")
