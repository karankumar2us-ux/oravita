"""
Oravita Biological Nutrition & Metabolic Engine
Calculates BMR, TDEE, macronutrients, and hormonal/menstrual adjustments.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Goal(str, Enum):
    FAT_LOSS = "fat_loss"
    MAINTENANCE = "maintenance"
    MUSCLE_GAIN = "muscle_gain"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"          # Little or no exercise (1.2)
    LIGHTLY_ACTIVE = "lightly_active" # Light exercise 1-3 days/wk (1.375)
    MODERATE = "moderate"            # Moderate exercise 3-5 days/wk (1.55)
    VERY_ACTIVE = "very_active"      # Hard exercise 6-7 days/wk (1.725)
    EXTRA_ACTIVE = "extra_active"    # Very hard training/physical job (1.9)

class MenstrualPhase(str, Enum):
    NONE = "none"
    FOLLICULAR = "follicular"  # Days 1-14: Higher insulin sensitivity, baseline energy needs
    OVULATORY = "ovulatory"    # Around Day 14: Peak estrogen & luteinizing hormone
    LUTEAL = "luteal"          # Days 15-28: Higher body temp, +100-300 kcal demand, fluid retention

class UserBioProfile(BaseModel):
    weight_kg: float = Field(..., gt=25.0, lt=300.0, description="Body weight in kilograms")
    height_cm: float = Field(..., gt=80.0, lt=250.0, description="Height in centimeters")
    age: int = Field(..., gt=12, lt=100, description="Age in years")
    gender: Gender
    activity_level: ActivityLevel
    goal: Goal
    menstrual_phase: Optional[MenstrualPhase] = MenstrualPhase.NONE
    is_hardgainer: bool = False  # For skinny users with high baseline expenditure

class TargetNutritionPlan(BaseModel):
    bmr: int
    tdee: int
    target_calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    hydration_liters: float
    notes: List[str]

class NutritionEngine:
    PAL_MULTIPLIERS = {
        ActivityLevel.SEDENTARY: 1.2,
        ActivityLevel.LIGHTLY_ACTIVE: 1.375,
        ActivityLevel.MODERATE: 1.55,
        ActivityLevel.VERY_ACTIVE: 1.725,
        ActivityLevel.EXTRA_ACTIVE: 1.9,
    }

    @classmethod
    def calculate_bmr(cls, weight: float, height: float, age: int, gender: Gender) -> float:
        """Mifflin-St Jeor formula."""
        base = (10.0 * weight) + (6.25 * height) - (5.0 * age)
        if gender == Gender.MALE:
            return base + 5.0
        elif gender == Gender.FEMALE:
            return base - 161.0
        return base - 78.0

    @classmethod
    def calculate_targets(cls, profile: UserBioProfile) -> TargetNutritionPlan:
        bmr = cls.calculate_bmr(profile.weight_kg, profile.height_cm, profile.age, profile.gender)
        tdee = bmr * cls.PAL_MULTIPLIERS[profile.activity_level]
        notes = []

        # 1. Base calorie modification by fitness trajectory
        if profile.goal == Goal.FAT_LOSS:
            deficit = 450.0
            floor = 1200.0 if profile.gender == Gender.FEMALE else 1500.0
            target_calories = max(tdee - deficit, floor)
            notes.append("Target set to a sustainable 450 kcal deficit to preserve metabolic rate.")
            protein_ratio = 1.9  # High protein to spare lean muscle mass during deficit
        elif profile.goal == Goal.MUSCLE_GAIN:
            surplus = 400.0 if profile.is_hardgainer else 250.0
            target_calories = tdee + surplus
            protein_ratio = 2.0 if profile.is_hardgainer else 1.8
            notes.append(f"Caloric surplus of +{int(surplus)} kcal tailored for muscle hypertrophy.")
        else:
            target_calories = tdee
            protein_ratio = 1.6
            notes.append("Caloric intake set to maintenance.")

        # 2. Female Hormonal Phase Adjustments
        if profile.gender == Gender.FEMALE and profile.menstrual_phase == MenstrualPhase.LUTEAL:
            target_calories += 180.0
            notes.append(
                "Luteal Phase: Progesterone elevates basal temperature and expenditure (+180 kcal). "
                "Temporary 1-2 kg water retention is expected; avoid aggressive deficit cuts now."
            )

        # 3. Macronutrient split
        # Protein (4 kcal/g)
        protein_g = round(profile.weight_kg * protein_ratio)
        protein_cals = protein_g * 4.0

        # Fats (9 kcal/g): 28% of total calories
        fat_cals = target_calories * 0.28
        fat_g = round(fat_cals / 9.0)

        # Carbs (4 kcal/g): Remaining energy
        carb_cals = max(0.0, target_calories - (protein_cals + fat_cals))
        carbs_g = round(carb_cals / 4.0)

        # Hydration estimation: 35ml per kg + activity allowance
        hydration_liters = round((profile.weight_kg * 0.035) + 0.5, 1)

        return TargetNutritionPlan(
            bmr=round(bmr),
            tdee=round(tdee),
            target_calories=round(target_calories),
            protein_g=protein_g,
            carbs_g=carbs_g,
            fat_g=fat_g,
            hydration_liters=hydration_liters,
            notes=notes
        )