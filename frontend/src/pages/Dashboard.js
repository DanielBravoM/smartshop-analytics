import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh: actualizando dashboard...');
      fetchAnalytics();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async (retryCount = 0) => {
    const maxRetries = 3;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/v1/analytics');
      setAnalytics(response.data.analytics);
    } catch (err) {
      console.error(`Error fetching analytics (intento ${retryCount + 1}/${maxRetries}):`, err);

      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchAnalytics(retryCount + 1);
        }, 1000);
      } else {
        setError(t('dashboard.error'));
        setLoading(false);
      }
      return;
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!loading && analytics && analytics.total_products === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">📦</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t('dashboard.noProducts')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('dashboard.noProductsDesc')}
          </p>
          <a
            href="/products"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
          >
            {t('dashboard.goToProducts')} →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">📊 {t('dashboard.title')}</h2>
          <button
            onClick={() => fetchAnalytics()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            🔄 {t('dashboard.refresh')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{t('dashboard.totalProducts')}</h3>
            <p className="text-4xl font-bold text-purple-600">{analytics?.total_products || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{t('dashboard.estimatedSales')}</h3>
            <p className="text-4xl font-bold text-green-600">{analytics?.estimated_sales || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{t('dashboard.growth')}</h3>
            <p className="text-4xl font-bold text-blue-600">{analytics?.growth_percentage || 0}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{t('dashboard.opportunities')}</h3>
            <p className="text-4xl font-bold text-orange-600">{analytics?.opportunities_count || 0}</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolución de precios */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.priceEvolution')}</h3>
            {analytics?.price_evolution && analytics.price_evolution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.price_evolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">{t('dashboard.noData')}</p>
            )}
          </div>

          {/* Por marketplace */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.byMarketplace')}</h3>
            {analytics?.by_marketplace && analytics.by_marketplace.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.by_marketplace}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">{t('dashboard.noData')}</p>
            )}
          </div>
        </div>

        {/* Top productos y categorías */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top productos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.topProducts')}</h3>
            {analytics?.top_products && analytics.top_products.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 truncate">{product.title}</p>
                      <p className="text-sm text-gray-500">⭐ {product.rating}</p>
                    </div>
                    <p className="text-lg font-bold text-purple-600 ml-4">€{product.current_price?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">{t('dashboard.noData')}</p>
            )}
          </div>

          {/* Top categorías */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.topCategories')}</h3>
            {analytics?.top_categories && analytics.top_categories.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_categories.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-800 capitalize">{cat._id}</span>
                    <span className="text-lg font-bold text-purple-600">{cat.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">{t('dashboard.noData')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;