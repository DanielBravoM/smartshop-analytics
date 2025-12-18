import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:3000/api/v1';

function Admin() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { t } = useTranslation();

    // Estado del formulario para añadir producto
    const [newProduct, setNewProduct] = useState({
        external_id: '',
        title: '',
        brand: '',
        current_price: '',
        marketplace: 'amazon',
        category: 'electronics',
        rating: '',
        review_count: '',
        image_url: ''
    });

    // Estado para actualizar precio
    const [updatePrice, setUpdatePrice] = useState({
        product_id: '',
        new_price: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/products`);
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error cargando productos:', error);
            setMessage(`❌ ${t('admin.loading')}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (!newProduct.external_id || !newProduct.title || !newProduct.current_price) {
            setMessage('❌ Completa los campos obligatorios: ASIN, Título y Precio');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/admin/products`, newProduct);

            setMessage('✅ Producto añadido correctamente');

            // Limpiar formulario
            setNewProduct({
                external_id: '',
                title: '',
                brand: '',
                current_price: '',
                marketplace: 'amazon',
                category: 'electronics',
                rating: '',
                review_count: '',
                image_url: ''
            });

            // Recargar lista
            setTimeout(() => loadProducts(), 500);
        } catch (error) {
            console.error('Error añadiendo producto:', error);
            setMessage('❌ Error añadiendo producto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrice = async (e) => {
        e.preventDefault();

        if (!updatePrice.product_id || !updatePrice.new_price) {
            setMessage('❌ Selecciona un producto y un nuevo precio');
            return;
        }

        try {
            setLoading(true);
            await axios.put(
                `${API_URL}/admin/products/${updatePrice.product_id}/price`,
                { new_price: updatePrice.new_price }
            );

            setMessage('✅ Precio actualizado correctamente');

            // Limpiar formulario
            setUpdatePrice({ product_id: '', new_price: '' });

            // Recargar lista
            setTimeout(() => loadProducts(), 500);
        } catch (error) {
            console.error('Error actualizando precio:', error);
            setMessage('❌ Error actualizando precio: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm(t('admin.confirmDelete'))) {
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`${API_URL}/admin/products/${productId}`);

            setMessage('✅ Producto eliminado correctamente');

            // Recargar lista
            setTimeout(() => loadProducts(), 500);
        } catch (error) {
            console.error('Error eliminando producto:', error);
            setMessage('❌ Error eliminando producto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">🛠️ {t('admin.title')}</h1>

                {/* Mensajes */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes('✅')
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        <p className="font-medium">{message}</p>
                    </div>
                )}

                {/* FORMULARIO: AÑADIR PRODUCTO */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">➕ {t('admin.addProduct')}</h2>
                    <form onSubmit={handleAddProduct}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.asinLabel')} *
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.external_id}
                                    onChange={(e) => setNewProduct({ ...newProduct, external_id: e.target.value })}
                                    placeholder="B09B8V1LZ3"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.titleLabel')} *
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.title}
                                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                    placeholder="Echo Dot 5ª Gen"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.brandLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.brand}
                                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                    placeholder="Nike, Adidas, Apple..."
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.categoryLabel')}
                                </label>
                                <select
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                >
                                    <option value="electronics">{t('admin.categories.electronics')}</option>
                                    <option value="fashion">{t('admin.categories.fashion')}</option>
                                    <option value="sports">{t('admin.categories.sports')}</option>
                                    <option value="home">{t('admin.categories.home')}</option>
                                    <option value="books">{t('admin.categories.books')}</option>
                                    <option value="toys">{t('admin.categories.toys')}</option>
                                    <option value="beauty">{t('admin.categories.beauty')}</option>
                                    <option value="food">{t('admin.categories.food')}</option>
                                    <option value="automotive">{t('admin.categories.automotive')}</option>
                                    <option value="garden">{t('admin.categories.garden')}</option>
                                    <option value="pets">{t('admin.categories.pets')}</option>
                                    <option value="other">{t('admin.categories.other')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.marketplaceLabel')}
                                </label>
                                <select
                                    value={newProduct.marketplace}
                                    onChange={(e) => setNewProduct({ ...newProduct, marketplace: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                >
                                    <option value="amazon">Amazon</option>
                                    <option value="ebay">eBay</option>
                                    <option value="aliexpress">AliExpress</option>
                                    <option value="mercadolibre">Mercado Libre</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.priceLabel')} *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.current_price}
                                    onChange={(e) => setNewProduct({ ...newProduct, current_price: e.target.value })}
                                    placeholder="59.99"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.ratingLabel')}
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={newProduct.rating}
                                    onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                                    placeholder="4.7"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.reviewsLabel')}
                                </label>
                                <input
                                    type="number"
                                    value={newProduct.review_count}
                                    onChange={(e) => setNewProduct({ ...newProduct, review_count: e.target.value })}
                                    placeholder="12450"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>

                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.imageLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.image_url}
                                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                                    placeholder="https://m.media-amazon.com/..."
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('admin.adding') : `➕ ${t('admin.addButton')}`}
                        </button>
                    </form>
                </div>

                {/* FORMULARIO: ACTUALIZAR PRECIO */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 {t('admin.updatePrice')}</h2>
                    <form onSubmit={handleUpdatePrice}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.selectProduct')}
                                </label>
                                <select
                                    value={updatePrice.product_id}
                                    onChange={(e) => setUpdatePrice({ ...updatePrice, product_id: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                    required
                                >
                                    <option value="">-- {t('admin.selectProduct')} --</option>
                                    {products.map(product => (
                                        <option key={product.external_id} value={product.external_id}>
                                            {product.title} ({product.current_price}€)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('admin.newPrice')}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={updatePrice.new_price}
                                    onChange={(e) => setUpdatePrice({ ...updatePrice, new_price: e.target.value })}
                                    placeholder="49.99"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:from-green-700 hover:to-teal-700 transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('admin.updating') : `💰 ${t('admin.updateButton')}`}
                        </button>
                    </form>
                </div>

                {/* TABLA: PRODUCTOS EXISTENTES */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        📦 {t('admin.currentProducts')} ({products.length})
                    </h2>

                    {loading ? (
                        <p className="text-gray-600">{t('admin.loading')}</p>
                    ) : products.length === 0 ? (
                        <p className="text-gray-600">{t('admin.noProducts')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ASIN</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.titleLabel')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.brandLabel')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.marketplaceLabel')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.priceLabel')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reviews</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('products.lastUpdate')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('common.delete')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map(product => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{product.external_id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                                                {product.title}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{product.brand}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 capitalize">{product.marketplace}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-green-600">
                                                {product.current_price}€
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                ⭐ {product.rating || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{product.review_count}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock_status === 'in_stock'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.stock_status === 'in_stock' ? t('products.inStock') : t('products.outOfStock')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(product.last_updated).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <button
                                                    onClick={() => handleDeleteProduct(product.external_id)}
                                                    disabled={loading}
                                                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Admin;