from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.price_generator import PriceGenerator
from database.mongodb import get_mongodb

products_bp = Blueprint('products', __name__)
price_generator = PriceGenerator()


@products_bp.route('/comparator/products', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        required_fields = ['name', 'brand', 'category', 'basePrice']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Campo requerido: {field}'}), 400
        
        product_name = data['name']
        base_price = float(data['basePrice'])
        category = data['category']
        
        store_prices = price_generator.generate_prices_for_product(product_name, base_price, category)
        
        product_doc = {
            'productId': data.get('sku', f"PROD-{datetime.now().timestamp()}"),
            'name': product_name,
            'brand': data['brand'],
            'category': category,
            'description': data.get('description', ''),
            'imageUrl': data.get('imageUrl', ''),
            'basePrice': base_price,
            'storePrices': store_prices,
            'lowestPrice': min([p['price'] for p in store_prices if p['inStock']]),
            'highestPrice': max([p['price'] for p in store_prices if p['inStock']]),
            'averagePrice': sum([p['price'] for p in store_prices if p['inStock']]) / len([p for p in store_prices if p['inStock']]),
            'availableStores': len([p for p in store_prices if p['inStock']]),
            'totalStores': len(store_prices),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        db = get_mongodb()
        result = db.comparator_products.insert_one(product_doc)
        
        for store_price in store_prices:
            history_doc = {
                'productId': product_doc['productId'],
                'storeId': store_price['storeId'],
                'price': store_price['price'],
                'inStock': store_price['inStock'],
                'timestamp': datetime.now().isoformat()
            }
            db.comparator_price_history.insert_one(history_doc)
        
        return jsonify({
            'success': True,
            'message': 'Producto agregado exitosamente',
            'data': {
                'productId': product_doc['productId'],
                'name': product_name,
                'lowestPrice': product_doc['lowestPrice'],
                'availableStores': product_doc['availableStores'],
                'storePrices': store_prices
            }
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@products_bp.route('/comparator/products', methods=['GET'])
def get_products():
    try:
        db = get_mongodb()
        query_filter = {}
        
        if 'category' in request.args:
            query_filter['category'] = request.args['category']
        if 'brand' in request.args:
            query_filter['brand'] = request.args['brand']
        
        products = list(db.comparator_products.find(query_filter).sort('createdAt', -1))
        
        for product in products:
            product['_id'] = str(product['_id'])
        
        return jsonify({'success': True, 'count': len(products), 'data': products}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@products_bp.route('/comparator/products/<product_id>', methods=['GET'])
def get_product_detail(product_id):
    try:
        db = get_mongodb()
        product = db.comparator_products.find_one({'productId': product_id})
        
        if not product:
            return jsonify({'success': False, 'error': 'Producto no encontrado'}), 404
        
        product['_id'] = str(product['_id'])
        return jsonify({'success': True, 'data': product}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@products_bp.route('/comparator/products/<product_id>/refresh-prices', methods=['POST'])
def refresh_product_prices(product_id):
    try:
        db = get_mongodb()
        product = db.comparator_products.find_one({'productId': product_id})
        
        if not product:
            return jsonify({'success': False, 'error': 'Producto no encontrado'}), 404
        
        store_prices = price_generator.generate_prices_for_product(
            product['name'], product['basePrice'], product['category']
        )
        
        db.comparator_products.update_one(
            {'productId': product_id},
            {'$set': {
                'storePrices': store_prices,
                'lowestPrice': min([p['price'] for p in store_prices if p['inStock']]),
                'highestPrice': max([p['price'] for p in store_prices if p['inStock']]),
                'averagePrice': sum([p['price'] for p in store_prices if p['inStock']]) / len([p for p in store_prices if p['inStock']]),
                'availableStores': len([p for p in store_prices if p['inStock']]),
                'updatedAt': datetime.now().isoformat()
            }}
        )
        
        for store_price in store_prices:
            db.comparator_price_history.insert_one({
                'productId': product_id,
                'storeId': store_price['storeId'],
                'price': store_price['price'],
                'inStock': store_price['inStock'],
                'timestamp': datetime.now().isoformat()
            })
        
        return jsonify({'success': True, 'message': 'Precios actualizados', 'data': {'productId': product_id, 'storePrices': store_prices}}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@products_bp.route('/comparator/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        db = get_mongodb()
        result = db.comparator_products.delete_one({'productId': product_id})
        
        if result.deleted_count == 0:
            return jsonify({'success': False, 'error': 'Producto no encontrado'}), 404
        
        db.comparator_price_history.delete_many({'productId': product_id})
        
        return jsonify({'success': True, 'message': 'Producto eliminado exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500