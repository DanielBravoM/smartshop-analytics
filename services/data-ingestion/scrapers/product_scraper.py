import requests
import os
from datetime import datetime
from pymongo import MongoClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductScraper:
    def __init__(self, mongo_uri, rapidapi_key):
        self.rapidapi_key = rapidapi_key
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.smartshop
        
        self.rapidapi_url = "https://real-time-amazon-data.p.rapidapi.com/product-details"
        self.headers = {
            "x-rapidapi-key": self.rapidapi_key,
            "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com"
        }
    
    def get_amazon_product(self, asin, country='ES'):
        """Obtener datos reales de producto de Amazon"""
        try:
            querystring = {
                "asin": asin,
                "country": country
            }
            
            response = requests.get(
                self.rapidapi_url,
                headers=self.headers,
                params=querystring,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return self.parse_amazon_data(data, asin)
            else:
                logger.error(f"❌ Error API: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error obteniendo producto: {e}")
            return None
    
    def parse_amazon_data(self, data, asin):
        """Parsear respuesta de la API"""
        try:
            product_data = data.get('data', {})
            
            # Precio
            price_info = product_data.get('product_price', '')
            price = None
            if price_info:
                # Extraer número del precio (ej: "59,99 €" -> 59.99)
                price_str = ''.join(c for c in price_info if c.isdigit() or c in '.,')
                price = float(price_str.replace(',', '.'))
            
            parsed = {
                'external_id': asin,
                'title': product_data.get('product_title', ''),
                'brand': product_data.get('product_information', {}).get('Brand', ''),
                'category': 'electronics',  # Puedes mejorarlo
                'current_price': price,
                'currency': 'EUR',
                'marketplace': 'amazon',
                'rating': float(product_data.get('product_star_rating', '0').split()[0]) if product_data.get('product_star_rating') else None,
                'review_count': product_data.get('product_num_ratings', 0),
                'stock_status': 'in_stock' if product_data.get('product_availability') else 'out_of_stock',
                'image_url': product_data.get('product_photo', ''),
                'last_updated': datetime.now(),
                'url': f"https://www.amazon.es/dp/{asin}"
            }
            
            return parsed
            
        except Exception as e:
            logger.error(f"❌ Error parseando datos: {e}")
            return None
    
    def update_product_in_db(self, product_data):
        """Actualizar producto en MongoDB"""
        try:
            # Actualizar o insertar producto
            result = self.db.products.update_one(
                {'external_id': product_data['external_id']},
                {'$set': product_data},
                upsert=True
            )
            
            # Guardar historial de precios
            if product_data.get('current_price'):
                price_history = {
                    'product_id': product_data['external_id'],
                    'price': product_data['current_price'],
                    'currency': product_data['currency'],
                    'timestamp': datetime.now(),
                    'marketplace': product_data['marketplace']
                }
                self.db.price_history.insert_one(price_history)
            
            logger.info(f"✅ Producto actualizado: {product_data['title']} - {product_data['current_price']}€")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error guardando en DB: {e}")
            return False
    
    def update_all_tracked_products(self):
        """Actualizar todos los productos trackeados"""
        # Aquí conectarías con PostgreSQL para obtener la lista de productos a trackear
        # Por ahora, hacemos uno de prueba
        
        test_products = [
            'B08N5WRWNW',  # Echo Dot
        ]
        
        for asin in test_products:
            logger.info(f"🔄 Actualizando producto: {asin}")
            product_data = self.get_amazon_product(asin)
            
            if product_data:
                self.update_product_in_db(product_data)
            
            # Esperar un poco entre requests
            import time
            time.sleep(2)

# Script principal
if __name__ == '__main__':
    MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://mongodb:27017/')
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    
    if not RAPIDAPI_KEY:
        logger.error("❌ RAPIDAPI_KEY no configurada")
        exit(1)
    
    scraper = ProductScraper(MONGO_URI, RAPIDAPI_KEY)
    scraper.update_all_tracked_products()