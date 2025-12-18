import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function Comparator() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const searchProducts = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/comparator/products?search=${searchTerm}`);
      console.log('Products found:', response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔄 {t('comparator.title')}</h1>
          <p className="text-gray-600">{t('comparator.description')}</p>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('comparator.searchPlaceholder')}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
            />
            <button
              onClick={searchProducts}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
            >
              🔍 {t('common.search')}
            </button>
          </div>
        </div>

        {/* Área de comparación */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('comparator.compare')}</h2>
            {products.length > 0 && (
              <button
                onClick={() => setProducts([])}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                {t('comparator.clearAll')}
              </button>
            )}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-gray-500 text-lg mb-2">{t('comparator.noProducts')}</p>
              <p className="text-gray-400 text-sm">{t('comparator.addFirst')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{product.title}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">{t('comparator.price')}:</span> €{product.price}</p>
                    <p><span className="font-semibold">{t('comparator.rating')}:</span> ⭐ {product.rating}</p>
                    <p><span className="font-semibold">{t('comparator.marketplace')}:</span> {product.marketplace}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {products.length > 0 && products.length < 2 && (
            <p className="text-center text-gray-500 mt-6">{t('comparator.selectProducts')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comparator;