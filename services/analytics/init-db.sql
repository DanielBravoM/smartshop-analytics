-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Crear tabla de seguimiento de productos
CREATE TABLE IF NOT EXISTS user_products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_external_id VARCHAR(100) NOT NULL,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_external_id)
);

-- Crear tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_external_id VARCHAR(100) NOT NULL,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('price_drop', 'price_increase', 'stock_available', 'stock_out')),
  threshold_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_triggered TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_product ON user_products(product_external_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product ON alerts(product_external_id);

-- Insertar usuario admin por defecto (password: admin123)
INSERT INTO users (email, password, name, role) 
VALUES ('admin@smartshop.com', '$2b$10$rZ5L3yxG4x7YqK2M9N8P1eF.6QH8T9W0X1Y2Z3A4B5C6D7E8F9G0H', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar usuario de prueba (password: user123)
INSERT INTO users (email, password, name, role) 
VALUES ('user@smartshop.com', '$2b$10$rZ5L3yxG4x7YqK2M9N8P1eF.6QH8T9W0X1Y2Z3A4B5C6D7E8F9G0H', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;