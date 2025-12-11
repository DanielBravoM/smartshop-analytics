from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import psycopg2
from datetime import datetime
import logging
import os
from apscheduler.schedulers.background import BackgroundScheduler
from config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

from routes.products import products_bp

app.register_blueprint(products_bp, url_prefix='/api')

# ===================================
# CONEXIONES A BASES DE DATOS
# ===================================

# MongoDB
try:
    mongo_client = MongoClient(config.MONGO_URI)
    mongo_db = mongo_client[config.MONGO_DB]
    logger.info("✅ Conectado a MongoDB")
except Exception as e:
    logger.error(f"❌ Error conectando a MongoDB: {e}")
    mongo_db = None

# PostgreSQL
def get_postgres_connection():
    try:
        conn = psycopg2.connect(
            host=config.POSTGRES_HOST,
            port=config.POSTGRES_PORT,
            database=config.POSTGRES_DB,
            user=config.POSTGRES_USER,
            password=config.POSTGRES_PASSWORD
        )
        return conn
    except Exception as e:
        logger.error(f"❌ Error conectando a PostgreSQL: {e}")
        return None

# ===================================
# SCRAPER DE PRODUCTOS CON RAPIDAPI
# ===================================

class ProductScraper:
    def __init__(self, rapidapi_key=None):
        self.rapidapi_key = rapidapi_key
        self.rapidapi_url = "https://real-time-amazon-data.p.rapidapi.com/product-details"
        self.headers = {
            "x-rapidapi-key": self.rapidapi_key if self.rapidapi_key else "",
            "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com"
        }
    
    def get_amazon_product(self, asin, country='ES'):
        """Obtener datos reales de Amazon usando RapidAPI"""
        try:
            import requests
            
            # Parámetros correctos para la API
            querystring = {
                "asin": asin,
                "country": country
            }
            
            logger.info(f"🔍 Obteniendo datos de Amazon API para: {asin}")
            logger.info(f"🔑 API Key configurada: {'SÍ' if self.rapidapi_key else 'NO'}")
            logger.info(f"🌐 URL: {self.rapidapi_url}")
            logger.info(f"📋 Params: {querystring}")
            
            response = requests.get(
                self.rapidapi_url,
                headers=self.headers,
                params=querystring,
                timeout=15
            )
            
            logger.info(f"📊 Status code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Respuesta recibida de la API")
                return self.parse_amazon_data(data, asin)
            elif response.status_code == 403:
                logger.error(f"❌ Error 403: {response.text}")
                logger.error("⚠️ Verifica que estés suscrito a la API en RapidAPI")
                logger.error(f"⚠️ API Key: {self.rapidapi_key[:20] if self.rapidapi_key else 'NO CONFIGURADA'}...")
                return None
            elif response.status_code == 429:
                logger.error(f"❌ Error 429: Límite de requests alcanzado")
                return None
            else:
                logger.error(f"❌ Error API: {response.status_code}")
                logger.error(f"📄 Respuesta: {response.text[:500]}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error obteniendo producto: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def parse_amazon_data(self, data, asin):
        """Parsear respuesta de la API de RapidAPI"""
        try:
            if 'data' not in data:
                logger.error(f"❌ Respuesta sin campo 'data'")
                logger.error(f"📄 Respuesta completa: {str(data)[:500]}")
                return None
            
            product_data = data['data']
            
            # Obtener título
            title = product_data.get('product_title', 'Sin título')
            logger.info(f"📦 Producto: {title[:50]}...")
            
            # Extraer precio
            price = None
            price_str = product_data.get('product_price', '')
            
            if price_str:
                try:
                    # Limpiar precio: "59,99 €" -> 59.99
                    price_clean = ''.join(c for c in str(price_str) if c.isdigit() or c in '.,')
                    
                    # Si tiene coma europea, convertir
                    if ',' in price_clean and '.' in price_clean:
                        # Formato europeo: 1.234,56 -> 1234.56
                        price_clean = price_clean.replace('.', '').replace(',', '.')
                    elif ',' in price_clean:
                        # Solo coma: 59,99 -> 59.99
                        price_clean = price_clean.replace(',', '.')
                    
                    price = float(price_clean)
                    logger.info(f"💰 Precio: {price}€")
                except Exception as e:
                    logger.warning(f"⚠️ Error parseando precio '{price_str}': {e}")
            else:
                logger.warning(f"⚠️ No se encontró precio en la respuesta")
            
            # Extraer rating
            rating = None
            rating_str = product_data.get('product_star_rating', '')
            if rating_str:
                try:
                    # "4,5 de 5 estrellas" -> 4.5
                    rating_num = str(rating_str).split()[0].replace(',', '.')
                    rating = float(rating_num)
                    logger.info(f"⭐ Rating: {rating}")
                except Exception as e:
                    logger.warning(f"⚠️ Error parseando rating '{rating_str}': {e}")
            
            # Extraer número de reviews
            review_count = 0
            reviews_str = product_data.get('product_num_ratings', 0)
            try:
                # Limpiar y convertir: "12.450" -> 12450
                review_clean = str(reviews_str).replace('.', '').replace(',', '')
                review_count = int(review_clean) if review_clean.isdigit() else 0
                logger.info(f"📝 Reviews: {review_count}")
            except Exception as e:
                logger.warning(f"⚠️ Error parseando reviews '{reviews_str}': {e}")
            
            # Extraer marca
            brand = 'Amazon'
            product_info = product_data.get('product_information', {})
            if isinstance(product_info, dict):
                brand = product_info.get('Brand', 'Amazon')
            logger.info(f"🏷️ Marca: {brand}")
            
            # Disponibilidad
            availability = product_data.get('product_availability', '')
            in_stock = bool(availability and 'stock' in str(availability).lower())
            logger.info(f"📦 Stock: {'En stock' if in_stock else 'No disponible'}")
            
            # Imagen
            image_url = product_data.get('product_photo', '')
            
            parsed = {
                'external_id': asin,
                'title': title[:500],
                'brand': brand[:100],
                'category': 'electronics',
                'current_price': price,
                'currency': 'EUR',
                'marketplace': 'amazon',
                'rating': rating,
                'review_count': review_count,
                'stock_status': 'in_stock' if in_stock else 'out_of_stock',
                'image_url': image_url,
                'last_updated': datetime.now(),
                'url': f"https://www.amazon.es/dp/{asin}"
            }
            
            logger.info(f"✅ Producto parseado correctamente")
            
            return parsed
            
        except Exception as e:
            logger.error(f"❌ Error parseando datos: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def update_product_in_db(self, product_data):
        """Actualizar producto en MongoDB"""
        try:
            if mongo_db is None:
                logger.error("❌ MongoDB no disponible")
                return False
            
            # Actualizar o insertar producto
            result = mongo_db.products.update_one(
                {'external_id': product_data['external_id']},
                {'$set': product_data},
                upsert=True
            )
            
            logger.info(f"💾 Producto guardado en MongoDB")
            
            # Guardar historial de precios solo si hay precio
            if product_data.get('current_price'):
                price_history = {
                    'product_id': product_data['external_id'],
                    'price': product_data['current_price'],
                    'currency': product_data['currency'],
                    'timestamp': datetime.now(),
                    'marketplace': product_data['marketplace']
                }
                mongo_db.price_history.insert_one(price_history)
                
                logger.info(f"📈 Historial de precio guardado: {product_data['current_price']}€")
            else:
                logger.warning(f"⚠️ Producto sin precio, no se guarda historial")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error guardando en DB: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def update_all_tracked_products(self):
        """Actualizar todos los productos trackeados desde PostgreSQL"""
        try:
            conn = get_postgres_connection()
            if not conn:
                logger.error("❌ No se pudo conectar a PostgreSQL")
                return
            
            cursor = conn.cursor()
            
            # Obtener productos activos de PostgreSQL
            cursor.execute("""
                SELECT DISTINCT external_id, marketplace 
                FROM tracked_products 
                WHERE active = true AND marketplace = 'amazon'
            """)
            
            products = cursor.fetchall()
            cursor.close()
            conn.close()
            
            logger.info(f"📊 Encontrados {len(products)} productos para actualizar")
            
            success_count = 0
            error_count = 0
            
            for external_id, marketplace in products:
                logger.info(f"{'='*60}")
                logger.info(f"🔄 Actualizando producto: {external_id}")
                logger.info(f"{'='*60}")
                
                product_data = self.get_amazon_product(external_id)
                
                if product_data:
                    if self.update_product_in_db(product_data):
                        success_count += 1
                        logger.info(f"✅ Producto actualizado exitosamente")
                    else:
                        error_count += 1
                        logger.error(f"❌ Error guardando en DB")
                else:
                    error_count += 1
                    logger.error(f"❌ No se pudo obtener datos del producto")
                
                # Esperar entre requests
                import time
                logger.info(f"⏳ Esperando 3 segundos antes del siguiente producto...")
                time.sleep(3)
            
            logger.info(f"{'='*60}")
            logger.info(f"✅ Actualización completada")
            logger.info(f"📊 Éxitos: {success_count} | Errores: {error_count}")
            logger.info(f"{'='*60}")
            
        except Exception as e:
            logger.error(f"❌ Error actualizando productos: {e}")
            import traceback
            traceback.print_exc()

# ===================================
# SCHEDULER PARA ACTUALIZACIÓN AUTOMÁTICA
# ===================================

def update_prices_job():
    """Job para actualizar precios automáticamente"""
    logger.info("="*50)
    logger.info("🔄 INICIANDO ACTUALIZACIÓN AUTOMÁTICA DE PRECIOS")
    logger.info("="*50)
    
    try:
        scraper = ProductScraper(config.RAPIDAPI_KEY)  # <-- CAMBIO AQUÍ
        scraper.update_all_tracked_products()
        
        logger.info("="*50)
        logger.info("✅ ACTUALIZACIÓN COMPLETADA")
        logger.info("="*50)
        
    except Exception as e:
        logger.error(f"❌ Error en job de actualización: {e}")

# Inicializar scheduler
scheduler = BackgroundScheduler()
# Actualizar cada 1 hora
scheduler.add_job(update_prices_job, 'interval', hours=1, id='update_prices')
scheduler.start()

logger.info("⏰ Scheduler iniciado - Actualizaciones cada 1 hora")

# ===================================
# RUTAS / ENDPOINTS
# ===================================

@app.route('/health', methods=['GET'])
def health_check():
    mongo_status = "OK" if mongo_db is not None else "ERROR"
    postgres_status = "OK" if get_postgres_connection() is not None else "ERROR"
    rapidapi_configured = "OK" if config.RAPIDAPI_KEY else "NOT_CONFIGURED"
    
    return jsonify({
        "status": "OK",
        "service": "Data Ingestion Service (Python)",
        "timestamp": datetime.now().isoformat(),
        "databases": {
            "mongodb": mongo_status,
            "postgresql": postgres_status
        },
        "scraper": {
            "type": "RapidAPI - Real-Time Amazon Data",
            "rapidapi": rapidapi_configured,
            "scheduler": "RUNNING" if scheduler.running else "STOPPED"
        }
    }), 200

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "service": "SmartShop Data Ingestion Service",
        "version": "1.0.0",
        "scraper": "RapidAPI Amazon Scraping",
        "endpoints": {
            "health": "/health",
            "products": "/products",
            "stats": "/stats",
            "update_now": "/update-prices (POST)"
        }
    }), 200

@app.route('/update-prices', methods=['POST'])
def manual_update():
    """Endpoint para forzar actualización manual"""
    logger.info("🔄 Actualización manual solicitada")
    
    try:
        scraper = ProductScraper(config.RAPIDAPI_KEY)  # <-- CAMBIO AQUÍ
        scraper.update_all_tracked_products()
        
        return jsonify({
            "success": True,
            "message": "Actualización iniciada correctamente"
        }), 200
        
    except Exception as e:
        logger.error(f"Error en actualización manual: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/products', methods=['GET'])
def get_products():
    try:
        if mongo_db is None:
            return jsonify({"error": "MongoDB no disponible"}), 503
        
        marketplace = request.args.get('marketplace')
        category = request.args.get('category')
        limit = int(request.args.get('limit', 20))
        
        query_filter = {}
        if marketplace:
            query_filter['marketplace'] = marketplace
        if category:
            query_filter['category'] = category
        
        products = list(mongo_db.products.find(query_filter).limit(limit))
        
        for product in products:
            product['_id'] = str(product['_id'])
        
        return jsonify({
            "success": True,
            "count": len(products),
            "products": products
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo productos: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/products/<product_id>', methods=['GET'])
def get_product_detail(product_id):
    try:
        if mongo_db is None:
            return jsonify({"error": "MongoDB no disponible"}), 503
        
        product = mongo_db.products.find_one({"external_id": product_id})
        
        if not product:
            return jsonify({"error": "Producto no encontrado"}), 404
        
        product['_id'] = str(product['_id'])
        
        price_history = list(
            mongo_db.price_history
            .find({"product_id": product_id})
            .sort("timestamp", -1)
            .limit(30)
        )
        
        for entry in price_history:
            entry['_id'] = str(entry['_id'])
        
        reviews = list(
            mongo_db.reviews
            .find({"product_id": product_id})
            .sort("date", -1)
            .limit(10)
        )
        
        for review in reviews:
            review['_id'] = str(review['_id'])
        
        return jsonify({
            "success": True,
            "product": product,
            "price_history": price_history,
            "reviews": reviews
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo detalle del producto: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        if mongo_db is None:
            return jsonify({"error": "MongoDB no disponible"}), 503
        
        stats = {
            "total_products": mongo_db.products.count_documents({}),
            "total_price_records": mongo_db.price_history.count_documents({}),
            "total_reviews": mongo_db.reviews.count_documents({}),
            "marketplaces": list(mongo_db.products.distinct("marketplace")),
            "categories": list(mongo_db.products.distinct("category"))
        }
        
        return jsonify({
            "success": True,
            "stats": stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500

# ===================================
# INICIAR SERVIDOR
# ===================================

if __name__ == '__main__':
    logger.info("="*50)
    logger.info("🐍 Data Ingestion Service (Python/Flask)")
    logger.info(f"🚀 Iniciando en puerto {config.PORT}")
    logger.info("🔑 RapidAPI: " + ("CONFIGURADA ✅" if config.RAPIDAPI_KEY else "NO CONFIGURADA ❌"))
    logger.info("="*50)
    
    app.run(
        host='0.0.0.0',
        port=config.PORT,
        debug=config.DEBUG
    )