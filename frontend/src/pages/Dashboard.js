import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Package, DollarSign, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/analytics');
      setAnalytics(response.data.analytics);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Ene', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Abr', value: 61 },
    { name: 'May', value: 55 },
    { name: 'Jun', value: 67 },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="text-red-800 font-semibold">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard General</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <Package size={32} className="mb-2" />
          <p className="text-sm opacity-90">Productos Seguidos</p>
          <h3 className="text-4xl font-bold mt-2">{analytics?.total_products || 0}</h3>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <DollarSign size={32} className="mb-2" />
          <p className="text-sm opacity-90">Ventas Estimadas</p>
          <h3 className="text-4xl font-bold mt-2">€4.5K</h3>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <TrendingUp size={32} className="mb-2" />
          <p className="text-sm opacity-90">Crecimiento</p>
          <h3 className="text-4xl font-bold mt-2">+12%</h3>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <AlertCircle size={32} className="mb-2" />
          <p className="text-sm opacity-90">Oportunidades</p>
          <h3 className="text-4xl font-bold mt-2">8</h3>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Evolución de Precios (Últimos 6 meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Marketplaces */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Productos por Marketplace</h3>
        {analytics?.by_marketplace && analytics.by_marketplace.length > 0 ? (
          <div className="space-y-4">
            {analytics.by_marketplace.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-800 capitalize">{item._id}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.count} productos)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">Precio promedio:</span>
                  <span className="font-bold text-gray-800 ml-2">€{item.avgPrice?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;