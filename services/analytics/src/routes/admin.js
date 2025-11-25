const express = require('express');
const router = express.Router();

// Usar la conexión MongoDB del servicio principal
let mongoDb;

// Middleware para obtener la instancia de MongoDB
router.use((req, res, next) => {
    mongoDb = req.app.locals.mongoDb;
    if (!mongoDb) {
        return res.status(503).json({
            success: false,
            error: 'MongoDB no disponible'
        });
    }
    next();
});

// ========================================
// AÑADIR NUEVO PRODUCTO
// ========================================
router.post('/products', async (req, res) => {
    try {
        const {
            external_id,
            title,
            brand,
            current_price,
            marketplace,
            category,
            rating,
            review_count,
            image_url
        } = req.body;

        // Validar campos requeridos
        if (!external_id || !title || !current_price) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos: external_id, title, current_price'
            });
        }

        const product = {
            external_id,
            title,
            brand: brand || 'Unknown',
            category: category || 'electronics',
            current_price: parseFloat(current_price),
            currency: 'EUR',
            marketplace: marketplace || 'amazon',
            rating: rating ? parseFloat(rating) : null,
            review_count: review_count ? parseInt(review_count) : 0,
            stock_status: 'in_stock',
            image_url: image_url || '',
            last_updated: new Date(),
            url: `https://www.amazon.es/dp/${external_id}`
        };

        // Insertar producto en MongoDB
        const result = await mongoDb.collection('products').insertOne(product);

        // Crear entrada inicial en historial de precios
        await mongoDb.collection('price_history').insertOne({
            product_id: external_id,
            price: product.current_price,
            currency: 'EUR',
            timestamp: new Date(),
            marketplace: product.marketplace
        });

        res.json({
            success: true,
            message: 'Producto añadido correctamente',
            product_id: result.insertedId
        });

    } catch (error) {
        console.error('Error añadiendo producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// ACTUALIZAR PRECIO DE PRODUCTO
// ========================================
router.put('/products/:id/price', async (req, res) => {
    try {
        const { id } = req.params;
        const { new_price } = req.body;

        if (!new_price) {
            return res.status(400).json({
                success: false,
                error: 'El campo new_price es requerido'
            });
        }

        const price = parseFloat(new_price);

        // Actualizar precio en producto
        await mongoDb.collection('products').updateOne(
            { external_id: id },
            {
                $set: {
                    current_price: price,
                    last_updated: new Date()
                }
            }
        );

        // Añadir al historial
        await mongoDb.collection('price_history').insertOne({
            product_id: id,
            price: price,
            currency: 'EUR',
            timestamp: new Date(),
            marketplace: 'amazon'
        });

        res.json({
            success: true,
            message: 'Precio actualizado correctamente'
        });

    } catch (error) {
        console.error('Error actualizando precio:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// ELIMINAR PRODUCTO
// ========================================
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await mongoDb.collection('products').deleteOne({ external_id: id });

        res.json({
            success: true,
            message: 'Producto eliminado correctamente'
        });

    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// LISTAR TODOS LOS PRODUCTOS (ADMIN)
// ========================================
router.get('/products', async (req, res) => {
    try {
        const products = await mongoDb.collection('products')
            .find({})
            .sort({ last_updated: -1 })
            .toArray();

        res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;