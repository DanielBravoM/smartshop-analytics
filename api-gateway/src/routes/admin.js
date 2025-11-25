const express = require('express');
const router = express.Router();
const axios = require('axios');

const ANALYTICS_SERVICE = process.env.NODE_SERVICE_URL || 'http://analytics:4000';

// Proxy a analytics service
router.post('/products', async (req, res) => {
    try {
        const response = await axios.post(`${ANALYTICS_SERVICE}/admin/products`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/products/:id/price', async (req, res) => {
    try {
        const response = await axios.put(`${ANALYTICS_SERVICE}/admin/products/${req.params.id}/price`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const response = await axios.delete(`${ANALYTICS_SERVICE}/admin/products/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/products', async (req, res) => {
    try {
        const response = await axios.get(`${ANALYTICS_SERVICE}/admin/products`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;