const { MongoClient } = require('mongodb');
const { Pool } = require('pg');
const config = require('./config');

// Conexión MongoDB
const mongoClient = new MongoClient(`${config.mongodb.uri}/${config.mongodb.database}`);
let mongoDb;

// Conexión PostgreSQL
const pgPool = new Pool(config.postgres);

async function connect() {
  await mongoClient.connect();
  mongoDb = mongoClient.db(config.mongodb.database);
  console.log('✅ Conectado a MongoDB y PostgreSQL');
}

async function updatePrices() {
  try {
    console.log('🔄 Actualizando precios...');
    
    // Obtener todos los productos
    const products = await mongoDb.collection('products').find({}).toArray();
    
    for (const product of products) {
      // Generar cambio aleatorio de precio (+/- 15%)
      const changePercent = (Math.random() * 0.3) - 0.15; // -15% a +15%
      const newPrice = Math.max(
        product.current_price * (1 + changePercent),
        10 // Precio mínimo de 10€
      );
      
      // Actualizar precio en MongoDB
      await mongoDb.collection('products').updateOne(
        { external_id: product.external_id },
        { 
          $set: { 
            current_price: parseFloat(newPrice.toFixed(2)),
            last_updated: new Date()
          }
        }
      );
      
      // Guardar en historial de precios
      await mongoDb.collection('price_history').insertOne({
        product_id: product.external_id,
        price: parseFloat(newPrice.toFixed(2)),
        timestamp: new Date()
      });
      
      console.log(`  📊 ${product.title}: €${product.current_price.toFixed(2)} → €${newPrice.toFixed(2)}`);
    }
    
    console.log('✅ Precios actualizados correctamente');
    
    // Revisar alertas
    await checkAlerts();
    
  } catch (error) {
    console.error('❌ Error actualizando precios:', error);
  }
}

async function checkAlerts() {
  try {
    console.log('🔔 Revisando alertas...');
    
    // Obtener todas las alertas activas
    const alertsResult = await pgPool.query(
      'SELECT * FROM alerts WHERE is_active = true'
    );
    
    const alerts = alertsResult.rows;
    let triggeredCount = 0;
    
    for (const alert of alerts) {
      // Obtener precio actual del producto
      const product = await mongoDb.collection('products').findOne({
        external_id: alert.product_external_id
      });
      
      if (!product) continue;
      
      let shouldTrigger = false;
      
      switch (alert.alert_type) {
        case 'price_drop':
          if (product.current_price <= alert.threshold_price) {
            shouldTrigger = true;
          }
          break;
          
        case 'price_increase':
          if (product.current_price >= alert.threshold_price) {
            shouldTrigger = true;
          }
          break;
          
        case 'stock_available':
          if (product.stock_status === 'in_stock') {
            shouldTrigger = true;
          }
          break;
          
        case 'stock_out':
          if (product.stock_status === 'out_of_stock') {
            shouldTrigger = true;
          }
          break;
      }
      
      if (shouldTrigger) {
        // Actualizar fecha de disparo
        await pgPool.query(
          'UPDATE alerts SET last_triggered = NOW() WHERE id = $1',
          [alert.id]
        );
        triggeredCount++;
        console.log(`  🔔 Alerta disparada: ${product.title} - ${alert.alert_type}`);
      }
    }
    
    console.log(`✅ ${triggeredCount} alertas disparadas`);
    
  } catch (error) {
    console.error('❌ Error revisando alertas:', error);
  }
}

async function run() {
  await connect();
  
  // Actualizar inmediatamente
  await updatePrices();
  
  // Luego cada 2 minutos
  setInterval(async () => {
    await updatePrices();
  }, 2 * 60 * 1000); // 2 minutos
}

// Manejar cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando...');
  await mongoClient.close();
  await pgPool.end();
  process.exit(0);
});

run().catch(console.error);