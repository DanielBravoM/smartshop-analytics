-- ===================================
-- SMARTSHOP ANALYTICS - PostgreSQL
-- Inicialización de Base de Datos
-- ===================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================
-- TABLA: users
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    active BOOLEAN DEFAULT true
);

-- ===================================
-- TABLA: shops
-- ===================================
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- TABLA: tracked_products
-- ===================================
CREATE TABLE IF NOT EXISTS tracked_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    marketplace VARCHAR(50) NOT NULL CHECK (marketplace IN ('amazon', 'ebay', 'aliexpress', 'other')),
    product_url TEXT NOT NULL,
    name VARCHAR(500),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_checked TIMESTAMP,
    active BOOLEAN DEFAULT true,
    UNIQUE(shop_id, external_id, marketplace)
);

-- ===================================
-- TABLA: alerts
-- ===================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES tracked_products(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('price_drop', 'stock_alert', 'review_alert', 'rating_change', 'demand_increase', 'competitor_change')),
    threshold_value DECIMAL(10, 2),
    condition_met BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP,
    notification_sent BOOLEAN DEFAULT false
);

-- ===================================
-- TABLA: alert_history
-- ===================================
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_value DECIMAL(10, 2),
    new_value DECIMAL(10, 2),
    details JSONB
);

-- ===================================
-- ÍNDICES
-- ===================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_shops_user_id ON shops(user_id);
CREATE INDEX idx_tracked_products_shop_id ON tracked_products(shop_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_active ON alerts(active) WHERE active = true;

-- ===================================
-- DATOS DE PRUEBA
-- ===================================
INSERT INTO users (email, password_hash, name, subscription_tier) 
VALUES 
    ('demo@smartshop.com', crypt('demo123', gen_salt('bf')), 'Demo User', 'pro')
ON CONFLICT (email) DO NOTHING;

INSERT INTO shops (user_id, name, category, description)
SELECT 
    id, 
    'Mi Tienda Electronics', 
    'electronics',
    'Tienda de prueba'
FROM users 
WHERE email = 'demo@smartshop.com'
ON CONFLICT DO NOTHING;

INSERT INTO tracked_products (shop_id, external_id, marketplace, product_url, name)
SELECT 
    s.id,
    'B08N5WRWNW',
    'amazon',
    'https://www.amazon.es/dp/B08N5WRWNW',
    'Echo Dot 5ª Generación'
FROM shops s
JOIN users u ON s.user_id = u.id
WHERE u.email = 'demo@smartshop.com'
ON CONFLICT DO NOTHING;

INSERT INTO alerts (user_id, product_id, alert_type, threshold_value)
SELECT 
    u.id,
    tp.id,
    'price_drop',
    50.00
FROM users u
JOIN shops s ON s.user_id = u.id
JOIN tracked_products tp ON tp.shop_id = s.id
WHERE u.email = 'demo@smartshop.com'
ON CONFLICT DO NOTHING;