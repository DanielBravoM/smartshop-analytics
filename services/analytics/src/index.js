const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const { Pool } = require('pg');
const config = require('./config');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

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
// ANALYTICS - CON DATOS REALES FILTRADOS POR USUARIO
// ===================================

app.get('/analytics', authenticateToken, async (req, res) => {
  try {
    if (!mongoDb) {
      return res.status(503).json({ error: 'MongoDB no disponible' });
    }

    const userId = req.user.id;

    // Obtener productos seguidos por el usuario
    const followedResult = await pgPool.query(
      'SELECT product_external_id FROM user_products WHERE user_id = $1',
      [userId]
    );

    const followedProductIds = followedResult.rows.map(row => row.product_external_id);

    // Si no sigue ningún producto, devolver datos vacíos
    if (followedProductIds.length === 0) {
      return res.json({
        success: true,
        analytics: {
          total_products: 0,
          total_reviews: 0,
          estimated_sales: 0,
          growth_percentage: 0,
          opportunities_count: 0,
          by_marketplace: [],
          top_categories: [],
          price_evolution: [],
          top_products: []
        }
      });
    }

    // 1. Total de productos seguidos
    const totalProducts = followedProductIds.length;
    
    // 2. Total de reviews (solo de productos seguidos)
    const totalReviews = await mongoDb.collection('reviews').countDocuments({
      product_id: { $in: followedProductIds }
    });
    
    // 3. Productos por marketplace (solo seguidos)
    const productsByMarketplace = await mongoDb.collection('products').aggregate([
      { $match: { external_id: { $in: followedProductIds } } },
      {
        $group: {
          _id: '$marketplace',
          count: { $sum: 1 },
          avgPrice: { $avg: '$current_price' }
        }
      }
    ]).toArray();

    // 4. Productos por categoría (solo seguidos)
    const productsByCategory = await mongoDb.collection('products').aggregate([
      { $match: { external_id: { $in: followedProductIds } } },
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

    // 5. Ventas estimadas
    const estimatedSales = Math.round(totalReviews * 10);

    // 6. Crecimiento
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPriceUpdates = await mongoDb.collection('price_history').countDocuments({
      product_id: { $in: followedProductIds },
      timestamp: { $gte: sevenDaysAgo }
    });

    const totalPriceHistory = await mongoDb.collection('price_history').countDocuments({
      product_id: { $in: followedProductIds }
    });
    
    const growthPercentage = totalPriceHistory > 0 
      ? Math.min(Math.round((recentPriceUpdates / totalPriceHistory) * 100), 100)
      : 0;

    // 7. Oportunidades (solo productos seguidos)
    const opportunities = await mongoDb.collection('products').countDocuments({
      external_id: { $in: followedProductIds },
      rating: { $gte: 4.0 },
      stock_status: 'in_stock',
      current_price: { $ne: null, $gt: 0 }
    });

    // 8. Evolución de precios (últimos 30 días, solo seguidos)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const priceEvolution = await mongoDb.collection('price_history').aggregate([
      {
        $match: {
          product_id: { $in: followedProductIds },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]).toArray();

    const priceEvolutionFormatted = priceEvolution.map(item => ({
      date: item._id,
      price: Math.round(item.avgPrice * 100) / 100,
      count: item.count
    }));

    // 9. Top productos por precio (solo seguidos)
    const topProductsByPrice = await mongoDb.collection('products').aggregate([
      { 
        $match: { 
          external_id: { $in: followedProductIds },
          current_price: { $ne: null, $gt: 0 } 
        } 
      },
      { $sort: { current_price: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          current_price: 1,
          rating: 1,
          review_count: 1,
          external_id: 1
        }
      }
    ]).toArray();

    res.json({
      success: true,
      analytics: {
        total_products: totalProducts,
        total_reviews: totalReviews,
        estimated_sales: estimatedSales,
        growth_percentage: growthPercentage,
        opportunities_count: opportunities,
        by_marketplace: productsByMarketplace,
        top_categories: productsByCategory,
        price_evolution: priceEvolutionFormatted,
        top_products: topProductsByPrice
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

// ===================================
// GENERAR DATOS DE PRUEBA (SOLO DESARROLLO)
// ===================================

app.post('/generate-test-data', async (req, res) => {
  try {
    if (!mongoDb) {
      return res.status(503).json({ error: 'MongoDB no disponible' });
    }

    const products = await mongoDb.collection('products').find({}).toArray();

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay productos. Añade productos primero desde el panel Admin.'
      });
    }

    let generatedData = {
      priceHistory: 0,
      reviews: 0
    };

    // Generar historial de precios (últimos 30 días)
    for (const product of products) {
      const basePrice = product.current_price || 50;

      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Variación de precio ±15%
        const variation = (Math.random() - 0.5) * 0.3;
        const price = Math.round((basePrice * (1 + variation)) * 100) / 100;

        await mongoDb.collection('price_history').insertOne({
          product_id: product.external_id,
          price: price,
          currency: 'EUR',
          timestamp: date,
          marketplace: product.marketplace || 'amazon'
        });

        generatedData.priceHistory++;
      }

      // Generar reviews aleatorias
      const numReviews = Math.floor(Math.random() * 20) + 5; // 5-25 reviews

      for (let i = 0; i < numReviews; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));

        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 estrellas
        const sentimentScore = rating >= 4 ? Math.random() * 0.3 + 0.7 : Math.random() * 0.3 + 0.3;

        await mongoDb.collection('reviews').insertOne({
          product_id: product.external_id,
          rating: rating,
          title: `Review ${i + 1}`,
          text: `Esta es una review de prueba para el producto ${product.title}`,
          sentiment_score: sentimentScore,
          helpful_count: Math.floor(Math.random() * 50),
          verified_purchase: Math.random() > 0.2,
          review_date: date,
          marketplace: product.marketplace || 'amazon'
        });

        generatedData.reviews++;
      }

      // Actualizar review_count en el producto
      await mongoDb.collection('products').updateOne(
        { _id: product._id },
        {
          $set: {
            review_count: numReviews,
            last_updated: new Date()
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Datos de prueba generados correctamente',
      data: generatedData
    });

  } catch (error) {
    console.error('Error generando datos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rutas de administración (proteger con middleware)
app.use('/admin', authenticateToken, requireAdmin, require('./routes/admin'));
// Rutas de seguimiento de productos (requiere autenticación)
app.use('/user-products', authenticateToken, require('./routes/user-products'));

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