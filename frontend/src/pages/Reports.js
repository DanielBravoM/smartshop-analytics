import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const { t } = useTranslation();

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/reports/${reportType}`);
      console.log('Report data:', response.data);
      alert('Informe generado correctamente');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 {t('reports.title')}</h1>
          <p className="text-gray-600">{t('reports.description')}</p>
        </div>

        {/* Selector de tipo de informe */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('reports.generateReport')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('reports.reportType')}
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
              >
                <option value="summary">{t('reports.types.summary')}</option>
                <option value="price_history">{t('reports.types.price_history')}</option>
                <option value="sales_analysis">{t('reports.types.sales_analysis')}</option>
                <option value="comparison">{t('reports.types.comparison')}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition duration-200 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('reports.generateReport')}
            </button>
            <button
              className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition"
            >
              📄 {t('reports.downloadPDF')}
            </button>
            <button
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition"
            >
              📊 {t('reports.downloadCSV')}
            </button>
          </div>
        </div>

        {/* Vista previa del informe */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('reports.summary.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">{t('reports.summary.avgPrice')}</p>
              <p className="text-3xl font-bold text-blue-600">€0.00</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">{t('reports.summary.maxPrice')}</p>
              <p className="text-3xl font-bold text-green-600">€0.00</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
              <p className="text-sm text-gray-600 mb-1">{t('reports.summary.minPrice')}</p>
              <p className="text-3xl font-bold text-orange-600">€0.00</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-1">{t('reports.summary.priceChange')}</p>
              <p className="text-3xl font-bold text-purple-600">0%</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500">{t('reports.noData')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;