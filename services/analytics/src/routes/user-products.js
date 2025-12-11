const express = require('express');
const router = express.Router();

// Obtener pool de PostgreSQL desde el app
let pgPool;

router.use((req, res, next) => {
    pgPool = req.app.locals.pgPool;
    next();
});

// ===================================
// SEGUIR UN PRODUCTO
// ===================================
router.post('/follow/:productId', async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id; // Viene del middleware authenticateToken

    try {
        await pgPool.query(
            'INSERT INTO user_products (user_id, product_external_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, productId]
        );

        res.json({
            success: true,
            message: 'Producto seguido correctamente'
        });
    } catch (error) {
        console.error('Error siguiendo producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===================================
// DEJAR DE SEGUIR UN PRODUCTO
// ===================================
router.delete('/unfollow/:productId', async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        await pgPool.query(
            'DELETE FROM user_products WHERE user_id = $1 AND product_external_id = $2',
            [userId, productId]
        );

        res.json({
            success: true,
            message: 'Dejaste de seguir el producto'
        });
    } catch (error) {
        console.error('Error dejando de seguir producto:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===================================
// OBTENER PRODUCTOS SEGUIDOS POR EL USUARIO
// ===================================
router.get('/following', async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pgPool.query(
            'SELECT product_external_id, followed_at FROM user_products WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            following: result.rows.map(row => row.product_external_id)
        });
    } catch (error) {
        console.error('Error obteniendo productos seguidos:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===================================
// VERIFICAR SI SIGUE UN PRODUCTO ESPECÍFICO
// ===================================
router.get('/is-following/:productId', async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        const result = await pgPool.query(
            'SELECT 1 FROM user_products WHERE user_id = $1 AND product_external_id = $2',
            [userId, productId]
        );

        res.json({
            success: true,
            isFollowing: result.rows.length > 0
        });
    } catch (error) {
        console.error('Error verificando seguimiento:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;