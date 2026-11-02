from app.db.session import engine, SessionLocal
from app.models.models import Base, FoodItem

INDIAN_FOOD_DATA = [
    {
        "name": "Roti (Whole Wheat Chapati)",
        "hindi_name": "रोटी / चपाती",
        "category": "Grains",
        "regional_cuisine": "Pan-Indian",
        "is_vegetarian": True,
        "is_vegan": True,
        "serving_unit": "1 medium roti (35g raw flour)",
        "serving_weight_grams": 40.0,
        "calories": 104.0,
        "protein_g": 3.1,
        "carbs_g": 20.2,
        "fat_g": 0.5,
        "fiber_g": 2.8,
        "estimated_cost_inr": 3.0
    },
    {
        "name": "Moong Dal (Cooked)",
        "hindi_name": "मूंग दाल",
        "category": "Lentils",
        "regional_cuisine": "North Indian",
        "is_vegetarian": True,
        "is_vegan": True,
        "serving_unit": "1 katori (150g)",
        "serving_weight_grams": 150.0,
        "calories": 150.0,
        "protein_g": 9.0,
        "carbs_g": 22.0,
        "fat_g": 2.5,
        "fiber_g": 4.5,
        "estimated_cost_inr": 15.0
    },
    {
        "name": "Paneer (Fresh Raw)",
        "hindi_name": "ताज़ा पनीर",
        "category": "Dairy",
        "regional_cuisine": "North Indian",
        "is_vegetarian": True,
        "is_vegan": False,
        "serving_unit": "100g slice",
        "serving_weight_grams": 100.0,
        "calories": 265.0,
        "protein_g": 18.3,
        "carbs_g": 3.2,
        "fat_g": 20.8,
        "fiber_g": 0.0,
        "estimated_cost_inr": 45.0
    },
    {
        "name": "Sattu Flour (Roasted Chana)",
        "hindi_name": "सत्तू",
        "category": "Grains & Pulses",
        "regional_cuisine": "Bihari / UP",
        "is_vegetarian": True,
        "is_vegan": True,
        "serving_unit": "4 tbsp (50g)",
        "serving_weight_grams": 50.0,
        "calories": 205.0,
        "protein_g": 13.0,
        "carbs_g": 32.0,
        "fat_g": 2.5,
        "fiber_g": 8.0,
        "estimated_cost_inr": 10.0
    },
    {
        "name": "Whole Boiled Egg",
        "hindi_name": "उबला अंडा",
        "category": "Poultry & Eggs",
        "regional_cuisine": "Pan-Indian",
        "is_vegetarian": False,
        "is_vegan": False,
        "serving_unit": "1 large egg (50g)",
        "serving_weight_grams": 50.0,
        "calories": 78.0,
        "protein_g": 6.3,
        "carbs_g": 0.6,
        "fat_g": 5.3,
        "fiber_g": 0.0,
        "estimated_cost_inr": 7.0
    }
]

def init_and_seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(FoodItem).count()
        if count == 0:
            for item in INDIAN_FOOD_DATA:
                db.add(FoodItem(**item))
            db.commit()
            print("Successfully seeded Indian staples!")
        else:
            print(f"Database already has {count} foods.")
    finally:
        db.close()

if __name__ == "__main__":
    init_and_seed()
