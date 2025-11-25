// ===================================
// SMARTSHOP ANALYTICS - MongoDB
// Inicialización de Base de Datos
// ===================================

db = db.getSiblingDB('smartshop');

print('Inicializando base de datos MongoDB: smartshop');

// ===================================
// COLECCIÓN: products
// ===================================
db.createCollection('products');

db.products.createIndex({ "external_id": 1, "marketplace": 1 }, { unique: true });
db.products.createIndex({ "marketplace": 1 });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "last_updated": -1 });

print('Colección "products" creada');

// ===================================
// COLECCIÓN: price_history
// ===================================
db.createCollection('price_history');

db.price_history.createIndex({ "product_id": 1, "timestamp": -1 });
db.price_history.createIndex({ "timestamp": -1 });

print('Colección "price_history" creada');

// ===================================
// COLECCIÓN: reviews
// ===================================
db.createCollection('reviews');

db.reviews.createIndex({ "product_id": 1, "date": -1 });
db.reviews.createIndex({ "sentiment": 1 });

print('Colección "reviews" creada');

// ===================================
// COLECCIÓN: scraping_logs
// ===================================
db.createCollection('scraping_logs');

db.scraping_logs.createIndex({ "timestamp": -1 });

print('Colección "scraping_logs" creada');

// ===================================
// DATOS DE PRUEBA
// ===================================

// Producto de ejemplo
db.products.insertOne({
  external_id: "B08N5WRWNW",
  marketplace: "amazon",
  title: "Echo Dot (5ª generación, 2022)",
  category: "electronics",
  brand: "Amazon",
  current_price: 59.99,
  currency: "EUR",
  stock_status: "in_stock",
  rating: 4.7,
  review_count: 12450,
  last_updated: new Date()
});

// Histórico de precios de ejemplo
const productId = "B08N5WRWNW";
const baseDate = new Date();
for (let i = 30; i >= 0; i--) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() - i);
  
  const price = 59.99 + (Math.random() - 0.5) * 10;
  
  db.price_history.insertOne({
    product_id: productId,
    marketplace: "amazon",
    timestamp: date,
    price: Math.round(price * 100) / 100,
    currency: "EUR",
    stock_available: true,
    promotion_active: Math.random() > 0.8
  });
}

print('Histórico de precios insertado (30 días)');

// Reseñas de ejemplo
const reviews = [
  {
    product_id: productId,
    marketplace: "amazon",
    author: "Usuario123",
    rating: 5,
    title: "Excelente producto",
    text: "Muy buena calidad de sonido y fácil de configurar.",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    verified_purchase: true,
    sentiment_score: 0.85,
    sentiment: "positive"
  },
  {
    product_id: productId,
    marketplace: "amazon",
    author: "Maria456",
    rating: 4,
    title: "Bueno pero con detalles",
    text: "El sonido es bueno pero a veces tiene problemas de conectividad.",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    verified_purchase: true,
    sentiment_score: 0.45,
    sentiment: "positive"
  },
  {
    product_id: productId,
    marketplace: "amazon",
    author: "Carlos789",
    rating: 2,
    title: "No cumplió expectativas",
    text: "La batería dura muy poco.",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    verified_purchase: false,
    sentiment_score: -0.65,
    sentiment: "negative"
  }
];

db.reviews.insertMany(reviews);

print('Reseñas de ejemplo insertadas');

// Log de scraping inicial
db.scraping_logs.insertOne({
  timestamp: new Date(),
  operation: "initial_seed",
  status: "success",
  products_processed: 1,
  duration_ms: 1523
});

print('===================================');
print('Base de datos MongoDB inicializada correctamente');
print('===================================');