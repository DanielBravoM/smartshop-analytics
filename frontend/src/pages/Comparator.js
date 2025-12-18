import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Search, X, Plus, Trash2 } from 'lucide-react';

function Comparator() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/products');
      setAllProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProductToCompare = (product) => {
    if (selectedProducts.length >= 4) {
      alert(t('comparator.maxProducts') || 'Máximo 4 productos para comparar');
      return;
    }
    if (selectedProducts.find(p => p.external_id === product.external_id)) {
      alert(t('comparator.alreadyAdded') || 'Este producto ya está en la comparación');
      return;
    }
    setSelectedProducts([...selectedProducts, product]);
    setSearchTerm('');
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.external_id !== productId));
  };

  const clearAll = () => {
    if (window.confirm(t('comparator.confirmClear') || '¿Limpiar toda la comparación?')) {
      setSelectedProducts([]);
    }
  };

  const getBestValue = (field) => {
    if (selectedProducts.length === 0) return null;
    
    switch (field) {
      case 'price':
        return Math.min(...selectedProducts.map(p => p.current_price || Infinity));
      case 'rating':
        return Math.max(...selectedProducts.map(p => p.rating || 0));
      case 'reviews':
        return Math.max(...selectedProducts.map(p => p.review_count || 0));
      default:
        return null;
    }
  };

  const isBestValue = (product, field) => {
    const best = getBestValue(field);
    if (!best) return false;
    
    switch (field) {
      case 'price':
        return product.current_price === best;
      case 'rating':
        return product.rating === best;
      case 'reviews':
        return product.review_count === best;
      default:
        return false;
    }
  };

  const filteredProducts = allProducts.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.external_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔄 {t('comparator.title')}</h1>
          <p className="text-gray-600">{t('comparator.description')}</p>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('comparator.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            {selectedProducts.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 size={18} />
                {t('comparator.clearAll')}
              </button>
            )}
          </div>

          {/* Productos encontrados para añadir */}
          {searchTerm && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">{t('comparator.results')} ({filteredProducts.length}):</p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredProducts.slice(0, 5).map((product) => (
                  <button
                    key={product.external_id}
                    onClick={() => addProductToCompare(product)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition text-left"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 truncate">{product.title}</p>
                      <p className="text-sm text-gray-500">
                        {product.marketplace} • €{product.current_price?.toFixed(2)}
                      </p>
                    </div>
                    <Plus size={20} className="text-purple-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabla de comparación */}
        {selectedProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">{t('comparator.noProducts')}</p>
            <p className="text-gray-400 text-sm">{t('comparator.addFirst')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">
                      {t('comparator.characteristics')}
                    </th>
                    {selectedProducts.map((product) => (
                      <th key={product.external_id} className="px-6 py-4 text-center min-w-[200px]">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => removeProduct(product.external_id)}
                            className="self-end text-white hover:text-red-200 transition"
                          >
                            <X size={20} />
                          </button>
                          <span className="text-sm font-medium line-clamp-2">
                            {product.title}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Imagen */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t('common.image')}</td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                            📦
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Precio */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {t('comparator.price')}
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center">
                        <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${
                          isBestValue(product, 'price')
                            ? 'bg-green-100 text-green-700 border-2 border-green-500'
                            : 'text-gray-700'
                        }`}>
                          €{product.current_price?.toFixed(2)}
                          {isBestValue(product, 'price') && <span className="ml-2">🏆</span>}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {t('comparator.rating')}
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center">
                        <div className={`inline-block px-4 py-2 rounded-lg ${
                          isBestValue(product, 'rating')
                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500 font-bold'
                            : 'text-gray-700'
                        }`}>
                          ⭐ {product.rating || 'N/A'}
                          {isBestValue(product, 'rating') && <span className="ml-2">🏆</span>}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Reviews */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {t('comparator.reviews')}
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center">
                        <div className={`${
                          isBestValue(product, 'reviews')
                            ? 'font-bold text-purple-700'
                            : 'text-gray-700'
                        }`}>
                          {product.review_count?.toLocaleString() || 0}
                          {isBestValue(product, 'reviews') && <span className="ml-2">🏆</span>}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Stock */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {t('comparator.stock')}
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.stock_status === 'in_stock'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock_status === 'in_stock' ? `✓ ${t('products.inStock')}` : `✗ ${t('products.outOfStock')}`}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Marketplace */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {t('comparator.marketplace')}
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold capitalize">
                          {product.marketplace}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Marca */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t('common.brand')}</td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center text-gray-700">
                        {product.brand || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  {/* Categoría */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t('common.category')}</td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center text-gray-700 capitalize">
                        {product.category || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  {/* Última actualización */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {t('comparator.lastUpdate')}
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center text-sm text-gray-600">
                        {new Date(product.last_updated).toLocaleDateString()}
                      </td>
                    ))}
                  </tr>

                  {/* Botón Ver en marketplace */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t('common.action')}</td>
                    {selectedProducts.map((product) => (
                      <td key={product.external_id} className="px-6 py-4 text-center">
                        {product.url ? (
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold"
                          >
                            🛒 {t('comparator.viewProduct')}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">{t('products.urlNotAvailable')}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">🏆 = {t('comparator.bestValue')}</span> • 
                {t('comparator.bestValueDesc')}
              </p>
            </div>
          </div>
        )}

        {selectedProducts.length > 0 && selectedProducts.length < 2 && (
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-semibold">
              {t('comparator.selectProducts')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comparator;