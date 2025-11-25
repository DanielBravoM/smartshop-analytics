import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/analytics');
      setAnalytics(response.data.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const salesData = [
    { month: 'Ene', sales: 3200 },
    { month: 'Feb', sales: 3800 },
    { month: 'Mar', sales: 3500 },
    { month: 'Abr', sales: 4200 },
    { month: 'May', sales: 3900 },
    { month: 'Jun', sales: 4500 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 35 },
    { name: 'Home & Garden', value: 25 },
    { name: 'Fashion', value: 20 },
    { name: 'Sports', value: 12 },
    { name: 'Books', value: 8 }
  ];

  const COLORS = ['#667eea', '#56ab2f', '#f83600', '#ff6b6b', '#4ecdc4'];

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Generando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Reportes y Analytics</h2>
          <p className="text-gray-600 mt-1">Análisis detallado del rendimiento</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option>Último mes</option>
            <option>Últimos 3 meses</option>
            <option>Último año</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            <Download size={20} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-sm text-blue-700 mb-1">Margen Promedio</p>
          <p className="text-4xl font-bold text-blue-900">18.5%</p>
          <p className="text-xs text-blue-600 mt-2">↑ +2.3% vs período anterior</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
          <p className="text-sm text-green-700 mb-1">Productos Analizados</p>
          <p className="text-4xl font-bold text-green-900">{analytics?.total_products || 125}</p>
          <p className="text-xs text-green-600 mt-2">↑ +15 nuevos</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-500">
          <p className="text-sm text-orange-700 mb-1">Oportunidades</p>
          <p className="text-4xl font-bold text-orange-900">8</p>
          <p className="text-xs text-orange-600 mt-2">Acción requerida</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Evolución de Ventas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-gray-600 mt-4">
            Total período: <span className="font-bold text-purple-600">€23,100</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Distribución por Categorías</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análisis de Sentimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Análisis de Sentimiento</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
              <div className="text-4xl mb-2">😊</div>
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-green-700 mt-1">Positivas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center border-2 border-gray-200">
              <div className="text-4xl mb-2">😐</div>
              <div className="text-3xl font-bold text-gray-600">10%</div>
              <div className="text-sm text-gray-700 mt-1">Neutras</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-red-200">
              <div className="text-4xl mb-2">😞</div>
              <div className="text-3xl font-bold text-red-600">5%</div>
              <div className="text-sm text-red-700 mt-1">Negativas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tendencias de Demanda</h3>
          <div className="space-y-3">
            {[
              { term: 'echo dot', trend: 'up', change: '+45%' },
              { term: 'teclado mecánico', trend: 'up', change: '+32%' },
              { term: 'funda iphone', trend: 'stable', change: '0%' },
              { term: 'cable usb-c', trend: 'down', change: '-12%' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium capitalize">{item.term}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${
                    item.trend === 'up' ? 'text-green-600' : 
                    item.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {item.change}
                  </span>
                  {item.trend === 'up' ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : item.trend === 'down' ? (
                    <TrendingDown className="text-red-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Conclusiones y Recomendaciones
        </h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <div className="font-semibold text-gray-800">Oportunidad de crecimiento</div>
                <div className="text-sm text-gray-600 mt-1">
                  Electronics muestra un crecimiento del 35%. Considera ampliar el catálogo.
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold text-gray-800">Atención requerida</div>
                <div className="text-sm text-gray-600 mt-1">
                  Cable USB-C muestra tendencia a la baja (-12%). Revisa la competencia.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;