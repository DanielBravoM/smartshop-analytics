import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, TrendingUp } from 'lucide-react';

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [reportData, setReportData] = useState(null);
  const { t } = useTranslation();

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  useEffect(() => {
    if (reportType) {
      generateReport();
    }
  }, [reportType]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/reports/${reportType}`);
      setReportData(response.data.report);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.data) {
      alert(t('reports.noDataToExport') || 'No hay datos para exportar');
      return;
    }

    let csvContent = '';
    const { data } = reportData;

    switch (reportType) {
      case 'summary':
        csvContent = `${t('common.metric')},${t('common.value')}\n`;
        csvContent += `${t('reports.summary.totalProducts')},${data.totalProducts}\n`;
        csvContent += `${t('reports.summary.avgPrice')},€${data.avgPrice}\n`;
        csvContent += `${t('reports.summary.maxPrice')},€${data.maxPrice}\n`;
        csvContent += `${t('reports.summary.minPrice')},€${data.minPrice}\n`;
        csvContent += `${t('reports.summary.avgRating')},${data.avgRating}\n`;
        csvContent += `${t('reports.summary.totalReviews')},${data.totalReviews}\n\n`;

        csvContent += `${t('reports.marketplace')},${t('common.quantity')}\n`;
        Object.entries(data.byMarketplace || {}).forEach(([name, value]) => {
          csvContent += `${name},${value}\n`;
        });

        csvContent += `\n${t('common.category')},${t('common.quantity')}\n`;
        Object.entries(data.byCategory || {}).forEach(([name, value]) => {
          csvContent += `${name},${value}\n`;
        });
        break;

      case 'price_history':
        if (!data.priceHistory || data.priceHistory.length === 0) {
          alert(t('reports.noPriceHistory') || 'No hay datos de historial de precios');
          return;
        }
        csvContent = `${t('reports.product')},${t('common.date')},${t('reports.summary.avgPrice')},${t('reports.summary.minPrice')},${t('reports.summary.maxPrice')}\n`;
        data.priceHistory.forEach(item => {
          csvContent += `"${item.title}",${item._id.date},€${item.avgPrice.toFixed(2)},€${item.minPrice.toFixed(2)},€${item.maxPrice.toFixed(2)}\n`;
        });
        break;

      case 'sales_analysis':
        if (!data.salesAnalysis || data.salesAnalysis.length === 0) {
          alert(t('reports.noSalesData') || 'No hay datos de análisis de ventas');
          return;
        }
        csvContent = `${t('reports.product')},${t('reports.asin')},${t('comparator.price')},${t('reports.estimatedSales')},${t('reports.estimatedRevenue')},Rating,Marketplace\n`;
        data.salesAnalysis.forEach(product => {
          csvContent += `"${product.title}",${product.external_id},€${product.price.toFixed(2)},${product.estimatedSales},€${product.revenue.toFixed(2)},${product.rating},${product.marketplace}\n`;
        });
        break;

      case 'comparison':
        if (!data.products || data.products.length === 0) {
          alert(t('reports.noComparisonData') || 'No hay datos de comparación');
          return;
        }
        csvContent = `${t('reports.product')},${t('comparator.price')},Rating,${t('comparator.reviews')},Marketplace\n`;
        data.products.forEach(product => {
          csvContent += `"${product.title}",€${product.price.toFixed(2)},${product.rating},${product.reviews},${product.marketplace}\n`;
        });
        break;

      default:
        alert(t('reports.unsupportedType') || 'Tipo de reporte no soportado');
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const renderSummaryReport = () => {
    if (!reportData?.data) return null;

    const { data } = reportData;

    const marketplaceData = Object.entries(data.byMarketplace || {}).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    const categoryData = Object.entries(data.byCategory || {}).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">{t('reports.summary.avgPrice')}</p>
            <p className="text-4xl font-bold">€{data.avgPrice}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">{t('reports.summary.maxPrice')}</p>
            <p className="text-4xl font-bold">€{data.maxPrice}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">{t('reports.summary.minPrice')}</p>
            <p className="text-4xl font-bold">€{data.minPrice}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">{t('reports.summary.avgRating')}</p>
            <p className="text-4xl font-bold">⭐ {data.avgRating}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">📦 {t('reports.summary.totalProducts')}</h3>
            <p className="text-5xl font-bold text-purple-600">{data.totalProducts}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">💬 {t('reports.summary.totalReviews')}</h3>
            <p className="text-5xl font-bold text-purple-600">{data.totalReviews?.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 {t('reports.productsByMarketplace')}</h3>
            {marketplaceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={marketplaceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketplaceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">{t('dashboard.noData')}</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏷️ {t('reports.productsByCategory')}</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">{t('dashboard.noData')}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPriceHistoryReport = () => {
    if (!reportData?.data?.priceHistory) return null;

    const { priceHistory } = reportData.data;

    const productGroups = {};
    priceHistory.forEach(item => {
      const productId = item._id.product;
      if (!productGroups[productId]) {
        productGroups[productId] = {
          title: item.title,
          data: []
        };
      }
      productGroups[productId].data.push({
        date: item._id.date,
        avgPrice: parseFloat(item.avgPrice.toFixed(2)),
        minPrice: parseFloat(item.minPrice.toFixed(2)),
        maxPrice: parseFloat(item.maxPrice.toFixed(2))
      });
    });

    return (
      <div className="space-y-6">
        {Object.entries(productGroups).map(([productId, productData]) => (
          <div key={productId} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📈 {productData.title}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgPrice" stroke="#8b5cf6" strokeWidth={2} name={t('reports.summary.avgPrice')} />
                <Line type="monotone" dataKey="minPrice" stroke="#10b981" strokeWidth={2} name={t('reports.summary.minPrice')} />
                <Line type="monotone" dataKey="maxPrice" stroke="#ef4444" strokeWidth={2} name={t('reports.summary.maxPrice')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}

        {Object.keys(productGroups).length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">{t('reports.noData')}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSalesAnalysisReport = () => {
    if (!reportData?.data?.salesAnalysis) return null;

    const { salesAnalysis } = reportData.data;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">💰 {t('reports.estimatedSalesAnalysis')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estimatedSales" fill="#8b5cf6" name={t('reports.estimatedSales')} />
              <Bar dataKey="revenue" fill="#10b981" name={t('reports.estimatedRevenue')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">{t('reports.product')}</th>
                <th className="px-6 py-4 text-center">{t('comparator.price')}</th>
                <th className="px-6 py-4 text-center">{t('reports.estimatedSales')}</th>
                <th className="px-6 py-4 text-center">{t('reports.estimatedRevenue')}</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-center">{t('reports.marketplace')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesAnalysis.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 max-w-xs truncate">{product.title}</td>
                  <td className="px-6 py-4 text-center font-semibold text-green-600">€{product.price?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">{product.estimatedSales?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-bold text-purple-600">€{product.revenue?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">⭐ {product.rating}</td>
                  <td className="px-6 py-4 text-center capitalize">{product.marketplace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderComparisonReport = () => {
    if (!reportData?.data?.products) return null;

    const { products } = reportData.data;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔄 {t('reports.top10Products')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={products} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="title" type="category" width={200} />
            <Tooltip />
            <Bar dataKey="price" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 {t('reports.title')}</h1>
          <p className="text-gray-600">{t('reports.description')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('reports.reportType')}
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition text-lg"
              >
                <option value="summary">{t('reports.types.summary')}</option>
                <option value="price_history">{t('reports.types.price_history')}</option>
                <option value="sales_analysis">{t('reports.types.sales_analysis')}</option>
                <option value="comparison">{t('reports.types.comparison')}</option>
              </select>
            </div>

            <div className="flex items-end gap-4">
              <button
                onClick={generateReport}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition duration-200 disabled:opacity-50"
              >
                <TrendingUp size={20} />
                {loading ? t('common.loading') : t('reports.generateReport')}
              </button>
              <button
                onClick={downloadCSV}
                disabled={!reportData || loading}
                className="flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                CSV
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : reportData ? (
          <div>
            {reportType === 'summary' && renderSummaryReport()}
            {reportType === 'price_history' && renderPriceHistoryReport()}
            {reportType === 'sales_analysis' && renderSalesAnalysisReport()}
            {reportType === 'comparison' && renderComparisonReport()}

            <div className="mt-6 bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} />
                <span>{t('reports.reportGenerated')}: {new Date(reportData.generatedAt).toLocaleString()}</span>
              </div>
              <span className="text-sm text-gray-500">{t('reports.reportTypeLabel')}: {reportData.type}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg">{t('reports.selectReportType')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;