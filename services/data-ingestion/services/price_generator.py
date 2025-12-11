import random
from datetime import datetime
from typing import List, Dict
import hashlib

class PriceGenerator:
    STORES = [
        {"storeId": "amazon-es", "name": "Amazon España", "priceVariation": 0.95, "stockProbability": 0.95, "deliveryDays": (1, 3)},
        {"storeId": "nike-official", "name": "Nike Official Store", "priceVariation": 1.0, "stockProbability": 0.90, "deliveryDays": (2, 5)},
        {"storeId": "adidas-official", "name": "Adidas Official Store", "priceVariation": 1.0, "stockProbability": 0.90, "deliveryDays": (2, 5)},
        {"storeId": "zalando", "name": "Zalando", "priceVariation": 0.98, "stockProbability": 0.85, "deliveryDays": (3, 7)},
        {"storeId": "elcorteingles", "name": "El Corte Inglés", "priceVariation": 1.05, "stockProbability": 0.80, "deliveryDays": (2, 4)},
        {"storeId": "sprinter", "name": "Sprinter", "priceVariation": 1.02, "stockProbability": 0.75, "deliveryDays": (3, 6)}
    ]
    
    def __init__(self):
        self.seed_base = datetime.now().strftime("%Y-%m-%d")
    
    def _get_deterministic_random(self, product_name: str, store_id: str) -> float:
        seed_string = f"{product_name}-{store_id}-{self.seed_base}"
        hash_value = int(hashlib.md5(seed_string.encode()).hexdigest(), 16)
        return (hash_value % 100) / 100.0
    
    def generate_price_for_store(self, base_price: float, product_name: str, store_info: Dict) -> Dict:
        random_factor = self._get_deterministic_random(product_name, store_info["storeId"])
        price = base_price * store_info["priceVariation"]
        price_variation = price * (random_factor * 0.06 - 0.03)
        final_price = round(price + price_variation, 2)
        has_stock = random_factor < store_info["stockProbability"]
        delivery_min, delivery_max = store_info["deliveryDays"]
        delivery_days = delivery_min + int(random_factor * (delivery_max - delivery_min))
        rating = round(4.0 + random_factor * 1.0, 1)
        has_discount = random_factor > 0.7
        previous_price = round(final_price * 1.15, 2) if has_discount else None
        discount_percentage = 13 if has_discount else 0
        
        return {
            "storeId": store_info["storeId"],
            "storeName": store_info["name"],
            "price": final_price,
            "previousPrice": previous_price,
            "discountPercentage": discount_percentage,
            "currency": "EUR",
            "inStock": has_stock,
            "stockQuantity": int(random_factor * 50) + 10 if has_stock else 0,
            "deliveryDays": delivery_days,
            "rating": rating,
            "reviewCount": int(random_factor * 500) + 50,
            "lastUpdated": datetime.now().isoformat(),
            "url": f"https://{store_info['storeId']}.com/product/{product_name.lower().replace(' ', '-')}"
        }
    
    def generate_prices_for_product(self, product_name: str, base_price: float, category: str = "shoes") -> List[Dict]:
        prices = []
        relevant_stores = self._filter_stores_by_category(category)
        for store in relevant_stores:
            price_data = self.generate_price_for_store(base_price, product_name, store)
            prices.append(price_data)
        prices.sort(key=lambda x: x["price"] if x["inStock"] else float('inf'))
        return prices
    
    def _filter_stores_by_category(self, category: str) -> List[Dict]:
        if category.lower() in ["shoes", "sneakers", "deportivos"]:
            return self.STORES
        if category.lower() in ["clothing", "ropa"]:
            return [s for s in self.STORES if s["storeId"] not in ["nike-official"]]
        return self.STORES