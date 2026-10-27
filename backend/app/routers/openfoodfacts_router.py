import requests
from typing import List
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/food-facts", tags=["Open Food Facts"])

# Curated fallback taxonomy for instant fast local autocomplete
POPULAR_FOOD_ITEMS = [
    {"name": "Cooked Rice & Lentil Biryani", "category": "Cooked Meals", "storage_type": "ambient", "dietary": "Vegetarian"},
    {"name": "Dal Makhani & Roti Platters", "category": "Cooked Meals", "storage_type": "ambient", "dietary": "Vegetarian"},
    {"name": "Vegetable Pulao & Curry", "category": "Cooked Meals", "storage_type": "ambient", "dietary": "Vegetarian"},
    {"name": "Chicken Tikka & Biryani Trays", "category": "Cooked Meals", "storage_type": "ambient", "dietary": "Non-Veg"},
    {"name": "Executive Sandwich & Wrap Platters", "category": "Cooked Meals", "storage_type": "chilled", "dietary": "Vegetarian"},
    {"name": "Sourdough Bread & Brioche Buns", "category": "Bakery & Bread", "storage_type": "ambient", "dietary": "Vegetarian"},
    {"name": "Whole Wheat Bread Loaves", "category": "Bakery & Bread", "storage_type": "ambient", "dietary": "Vegetarian"},
    {"name": "Croissants & Assorted Pastries", "category": "Bakery & Bread", "storage_type": "ambient", "dietary": "Vegetarian"},
    {"name": "Fresh Pasteurized Whole Milk", "category": "Dairy & Cold", "storage_type": "chilled", "dietary": "Vegetarian"},
    {"name": "Greek Yogurt Cups & Curd", "category": "Dairy & Cold", "storage_type": "chilled", "dietary": "Vegetarian"},
    {"name": "Paneer / Cottage Cheese Blocks", "category": "Dairy & Cold", "storage_type": "chilled", "dietary": "Vegetarian"},
    {"name": "Fresh Organic Apples & Bananas", "category": "Produce & Fresh", "storage_type": "ambient", "dietary": "Vegan"},
    {"name": "Farm Fresh Tomatoes & Potatoes", "category": "Produce & Fresh", "storage_type": "ambient", "dietary": "Vegan"},
    {"name": "Cut Melon & Papaya Fruit Salads", "category": "Produce & Fresh", "storage_type": "chilled", "dietary": "Vegan"},
    {"name": "Canned Chickpeas & Kidney Beans", "category": "Canned/Dry Goods", "storage_type": "ambient", "dietary": "Vegan"},
    {"name": "Dry Basmati Rice Bags (5kg)", "category": "Canned/Dry Goods", "storage_type": "ambient", "dietary": "Vegan"},
    {"name": "Frozen Veggie Burger Patties", "category": "Cooked Meals", "storage_type": "frozen", "dietary": "Vegan"},
    {"name": "Frozen Green Peas & Corn", "category": "Produce & Fresh", "storage_type": "frozen", "dietary": "Vegan"},
]

@router.get("/search")
def search_food_items(q: str = Query("", min_length=1)):
    """
    Searches food items, categories, and storage recommendations.
    Queries Open Food Facts public API with local curated fast-fallback.
    """
    search_term = q.strip().lower()
    
    # 1. First check matching items from rich curated taxonomy
    local_matches = [
        item for item in POPULAR_FOOD_ITEMS
        if search_term in item["name"].lower() or search_term in item["category"].lower()
    ]
    
    # 2. Try fetching from Open Food Facts if query is specific and we want external products
    remote_matches = []
    try:
        url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={search_term}&search_simple=1&action=process&json=1&page_size=5"
        resp = requests.get(url, timeout=1.8, headers={"User-Agent": "EASY-RescueApp/1.0"})
        if resp.status_code == 200:
            data = resp.json()
            products = data.get("products", [])
            for p in products:
                product_name = p.get("product_name") or p.get("generic_name")
                if product_name:
                    # Guess category and storage
                    categories = p.get("categories", "").lower()
                    storage = "ambient"
                    if "frozen" in categories or "surgelé" in categories:
                        storage = "frozen"
                    elif "fresh" in categories or "dairy" in categories or "lait" in categories or "cheese" in categories:
                        storage = "chilled"
                        
                    remote_matches.append({
                        "name": product_name[:60],
                        "category": "Produce & Fresh" if "fruit" in categories or "vegetable" in categories else "Packaged Surplus",
                        "storage_type": storage,
                        "dietary": "Standard",
                        "code": p.get("code")
                    })
    except Exception:
        # Gracefully proceed with local matches on network timeout or offline
        pass

    # Merge unique
    combined = local_matches + remote_matches
    # Deduplicate by name
    seen = set()
    unique = []
    for item in combined:
        if item["name"].lower() not in seen:
            seen.add(item["name"].lower())
            unique.append(item)
            
    return unique[:8]
