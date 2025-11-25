const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const { Pool } = require('pg');
const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// ===================================
// CONEXIONES A BASES DE DATOS
// ===================================

let mongoDb;
const mongoClient = new MongoClient(config.mongodb.uri);

mongoClient.connect()
  .then(() => {
    mongoDb = mongoClient.db(config.mongodb.database);
    app.locals.mongoDb = mongoDb;
    console.log('✅ Conectado a MongoDB');
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
  });

const pgPool = new Pool(config.postgres);

pgPool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pgPool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err);
});

// Hacer pgPool disponible globalmente
app.locals.pgPool = pgPool;

// ===================================
// HEALTH CHECK
// ===================================

app.get('/health', async (req, res) => {
  let mongoStatus = 'ERROR';
  let pgStatus = 'ERROR';

  try {
    await mongoDb.command({ ping: 1 });
    mongoStatus = 'OK';
  } catch (err) {
    console.error('MongoDB health check failed:', err);
  }

  try {
    await pgPool.query('SELECT 1');
    pgStatus = 'OK';
  } catch (err) {
    console.error('PostgreSQL health check failed:', err);
  }

  res.json({
    status: 'OK',
    service: 'Analytics Service (Node.js)',
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: mongoStatus,
      postgresql: pgStatus
    }
  });
});

// ===================================
// RUTAS PRINCIPALES
// ===================================

app.get('/', (req, res) => {
  res.json({
    service: 'SmartShop Analytics Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      analytics: '/analytics',
      alerts: '/alerts'
    }
  });
});

// ===================================
// ANALYTICS
// ===================================

app.get('/analytics', async (req, res) => {
  try {
    if (!mongoDb) {
      return res.status(503).json({ error: 'MongoDB no disponible' });
    }

    const totalProducts = await mongoDb.collection('products').countDocuments();
    const totalReviews = await mongoDb.collection('reviews').countDocuments();
    
    const productsByMarketplace = await mongoDb.collection('products').aggregate([
      {
        $group: {
          _id: '$marketplace',
          count: { $sum: 1 },
          avgPrice: { $avg: '$current_price' }
        }
      }
    ]).toArray();

    const productsByCategory = await mongoDb.collection('products').aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    res.json({
      success: true,
      analytics: {
        total_products: totalProducts,
        total_reviews: totalReviews,
        by_marketplace: productsByMarketplace,
        top_categories: productsByCategory
      }
    });
  } catch (error) {
    console.error('Error en analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// ALERTAS
// ===================================

app.get('/alerts', async (req, res) => {
  try {
    const { user_id, active } = req.query;

    let query = 'SELECT * FROM alerts';
    const params = [];

    if (user_id) {
      query += ' WHERE user_id = $1';
      params.push(user_id);
      
      if (active !== undefined) {
        query += ' AND active = $2';
        params.push(active === 'true');
      }
    } else if (active !== undefined) {
      query += ' WHERE active = $1';
      params.push(active === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pgPool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      alerts: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/alerts', async (req, res) => {
  try {
    const { user_id, product_id, alert_type, threshold_value } = req.body;

    if (!user_id || !alert_type) {
      return res.status(400).json({ 
        error: 'user_id y alert_type son requeridos' 
      });
    }

    const query = `
      INSERT INTO alerts (user_id, product_id, alert_type, threshold_value, active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pgPool.query(query, [
      user_id,
      product_id || null,
      alert_type,
      threshold_value || null,
      true
    ]);

    res.status(201).json({
      success: true,
      message: 'Alerta creada exitosamente',
      alert: result.rows[0]
    });
  } catch (error) {
    console.error('Error creando alerta:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { active, threshold_value } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      params.push(active);
    }

    if (threshold_value !== undefined) {
      updates.push(`threshold_value = $${paramCount++}`);
      params.push(threshold_value);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    params.push(id);
    const query = `
      UPDATE alerts 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pgPool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json({
      success: true,
      message: 'Alerta actualizada',
      alert: result.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando alerta:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pgPool.query(
      'DELETE FROM alerts WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json({
      success: true,
      message: 'Alerta eliminada',
      alert: result.rows[0]
    });
  } catch (error) {
    console.error('Error eliminando alerta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas de autenticación (AÑADIR ANTES DE LAS RUTAS ADMIN)
app.use('/auth', require('./routes/auth'));

// Rutas de administración (proteger con middleware)
const { authenticateToken, requireAdmin } = require('./middleware/auth');
app.use('/admin', authenticateToken, requireAdmin, require('./routes/admin'));

// ===================================
// RUTAS DE ADMINISTRACIÓN
// ===================================

app.use('/admin', require('./routes/admin'));

// ===================================
// MANEJO DE ERRORES
// ===================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ===================================
// INICIAR SERVIDOR
// ===================================

app.listen(config.PORT, () => {
  console.log('='.repeat(50));
  console.log(`📊 Analytics Service iniciado en puerto ${config.PORT}`);
  console.log(`🔍 Health check: http://localhost:${config.PORT}/health`);
  console.log('='.repeat(50));
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando...');
  await mongoClient.close();
  await pgPool.end();
  process.exit(0);
});