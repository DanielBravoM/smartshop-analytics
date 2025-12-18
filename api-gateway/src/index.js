require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;


// ===================================
// MIDDLEWARE
// ===================================

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// ===================================
// HEALTH CHECK
// ===================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===================================
// RUTAS PRINCIPALES
// ===================================

app.get('/', (req, res) => {
  res.json({
    message: 'SmartShop Analytics API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      products: '/api/v1/products',
      analytics: '/api/v1/analytics',
      alerts: '/api/v1/alerts'
    }
  });
});

// ===================================
// PROXY A MICROSERVICIOS
// ===================================

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://data-ingestion:5000';
const NODE_SERVICE_URL = process.env.NODE_SERVICE_URL || 'http://analytics:4000';

// Proxy para Data Ingestion Service (Python)
app.use('/api/v1/products', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${PYTHON_SERVICE_URL}${req.originalUrl.replace('/api/v1/products', '/products')}`,
      data: req.body,
      headers: { 'Content-Type': 'application/json' }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error calling Python service:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al comunicarse con el servicio de productos'
    });
  }
});

// Proxy para comparador de productos (Data Ingestion)
app.use('/api/comparator', createProxyMiddleware({
  target: 'http://data-ingestion:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/comparator': '/api/comparator'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Proxy para Alertas
app.use('/api/v1/alerts', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${NODE_SERVICE_URL}${req.originalUrl.replace('/api/v1/alerts', '/alerts')}`,
      data: req.body,
      headers: { 'Content-Type': 'application/json' }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error calling Node service:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al comunicarse con el servicio de alertas'
    });
  }
});


// ========================================
// RUTAS DE AUTENTICACIÓN
// ========================================
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const response = await axios.post(`${NODE_SERVICE_URL}/auth/register`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || { success: false, error: error.message });
    }
});

app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${NODE_SERVICE_URL}/auth/login`, req.body);
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || { success: false, error: error.message });
    }
});

// Generar datos de prueba
app.post('/api/v1/generate-test-data', async (req, res) => {
    try {
        const response = await axios.post(`${NODE_SERVICE_URL}/generate-test-data`);
        res.json(response.data);
    } catch (error) {
        console.error('Error generando datos:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/v1/auth/verify', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.get(`${NODE_SERVICE_URL}/auth/verify`, {
            headers: { Authorization: token }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 401;
        res.status(status).json(error.response?.data || { success: false, error: error.message });
    }
});

// Rutas de administración (REEMPLAZAR LAS EXISTENTES)
app.post('/api/v1/admin/products', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.post(`${NODE_SERVICE_URL}/admin/products`, req.body, {
            headers: { Authorization: token }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || { success: false, error: error.message });
    }
});

app.get('/api/v1/analytics', async (req, res) => {
    try {
        console.log('=== DEBUG ANALYTICS ===');
        console.log('Headers recibidos:', req.headers);
        console.log('Authorization header:', req.headers.authorization);
        
        const headers = {};
        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }
        
        console.log('Headers a enviar:', headers);
        
        const response = await axios.get(`${NODE_SERVICE_URL}/analytics`, { headers });
        res.json(response.data);
    } catch (error) {
        console.error('Error en analytics:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        res.status(error.response?.status || 503).json(
            error.response?.data || { 
                success: false, 
                error: 'Servicio de analytics no disponible' 
            }
        );
    }
});

// ========================================
// RUTAS DE SEGUIMIENTO DE PRODUCTOS
// ========================================
app.post('/api/v1/user-products/follow/:productId', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.post(
            `${NODE_SERVICE_URL}/user-products/follow/${req.params.productId}`,
            {},
            { headers: { Authorization: token } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

app.delete('/api/v1/user-products/unfollow/:productId', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.delete(
            `${NODE_SERVICE_URL}/user-products/unfollow/${req.params.productId}`,
            { headers: { Authorization: token } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

app.get('/api/v1/user-products/following', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.get(
            `${NODE_SERVICE_URL}/user-products/following`,
            { headers: { Authorization: token } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});

app.get('/api/v1/user-products/is-following/:productId', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.get(
            `${NODE_SERVICE_URL}/user-products/is-following/${req.params.productId}`,
            { headers: { Authorization: token } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
});
app.get('/api/v1/admin/products', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.get(`${NODE_SERVICE_URL}/admin/products`, {
            headers: { Authorization: token }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || { success: false, error: error.message });
    }
});

app.put('/api/v1/admin/products/:id/price', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.put(`${NODE_SERVICE_URL}/admin/products/${req.params.id}/price`, req.body, {
            headers: { Authorization: token }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || { success: false, error: error.message });
    }
});

app.delete('/api/v1/admin/products/:id', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const response = await axios.delete(`${NODE_SERVICE_URL}/admin/products/${req.params.id}`, {
            headers: { Authorization: token }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || { success: false, error: error.message });
    }
});

// Ruta para comparador
app.get('/api/v1/products/compare', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.get(`${NODE_SERVICE_URL}/products/compare`, {
      params: req.query,
      headers: { Authorization: token }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error en comparador:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Error al comparar productos'
    });
  }
});

// Ruta para reportes
app.get('/api/v1/reports/:type', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.get(`${NODE_SERVICE_URL}/reports/${req.params.type}`, {
      headers: { Authorization: token }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error en reportes:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Error al generar reporte'
    });
  }
});

// ===================================
// DOCUMENTACIÓN SWAGGER
// ===================================

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SmartShop Analytics API',
    version: '1.0.0',
    description: 'API para análisis de productos de e-commerce'
  },
  servers: [
    { url: `http://localhost:${PORT}`, description: 'Servidor de desarrollo' }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'API funcionando correctamente' } }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ===================================
// MANEJO DE ERRORES
// ===================================

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// ===================================
// INICIAR SERVIDOR
// ===================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 API Gateway iniciado en puerto ${PORT}`);
  console.log(`📖 Documentación: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});