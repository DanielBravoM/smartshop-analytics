import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Bell, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [followedProducts, setFollowedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const { t } = useTranslation();

  const [newAlert, setNewAlert] = useState({
    product_external_id: '',
    alert_type: 'price_drop',
    threshold_price: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener alertas
      const alertsRes = await axios.get('/api/v1/alerts');
      setAlerts(alertsRes.data.alerts || []);

      // Obtener IDs de productos seguidos
      const followingRes = await axios.get('/api/v1/user-products/following');
      const followedIds = followingRes.data.following || []; // ← Debe ser .following

      // Obtener todos los productos
      const productsRes = await axios.get('/api/v1/products');
      const allProducts = productsRes.data.products || [];

      // Filtrar solo los productos seguidos
      const followed = allProducts.filter(p =>
        followedIds.includes(p.external_id)
      );

      console.log('Followed products:', followed); // Debug
      setFollowedProducts(followed);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();

    // Validar datos
    if (!newAlert.product_external_id) {
      alert(t('alerts.selectProduct') || 'Por favor selecciona un producto');
      return;
    }

    if (needsThreshold(newAlert.alert_type) && !newAlert.threshold_price) {
      alert(t('alerts.enterThreshold') || 'Por favor ingresa un precio umbral');
      return;
    }

    try {
      const alertData = {
        product_external_id: newAlert.product_external_id,
        alert_type: newAlert.alert_type,
        threshold_price: needsThreshold(newAlert.alert_type)
          ? parseFloat(newAlert.threshold_price)
          : null
      };

      console.log('Sending alert data:', alertData); // Debug

      await axios.post('/api/v1/alerts', alertData);

      setShowCreateModal(false);
      setNewAlert({
        product_external_id: '',
        alert_type: 'price_drop',
        threshold_price: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating alert:', error);
      console.error('Response:', error.response?.data); // Debug
      alert(error.response?.data?.error || t('common.error'));
    }
  };

  const handleToggleActive = async (alertId, currentStatus) => {
    try {
      await axios.put(`/api/v1/alerts/${alertId}`, {
        is_active: !currentStatus
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm(t('alerts.confirmDelete') || '¿Eliminar esta alerta?')) return;

    try {
      await axios.delete(`/api/v1/alerts/${alertId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleUpdateThreshold = async (alertId, newThreshold) => {
    try {
      await axios.put(`/api/v1/alerts/${alertId}`, {
        threshold_price: parseFloat(newThreshold)
      });
      setEditingAlert(null);
      fetchData();
    } catch (error) {
      console.error('Error updating threshold:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return '🔻';
      case 'price_increase':
        return '🔺';
      case 'stock_available':
        return '✅';
      case 'stock_out':
        return '❌';
      default:
        return '🔔';
    }
  };

  const needsThreshold = (alertType) => {
    return alertType === 'price_drop' || alertType === 'price_increase';
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔔 {t('alerts.title')}</h1>
            <p className="text-gray-600">{t('alerts.description')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition"
          >
            <Plus size={20} />
            {t('alerts.createAlert')}
          </button>
        </div>

        {/* Lista de alertas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('alerts.myAlerts')}</h2>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔕</div>
              <p className="text-gray-500 text-lg mb-2">{t('alerts.noAlerts')}</p>
              <p className="text-gray-400 text-sm">{t('alerts.createFirst')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition ${alert.is_active
                    ? 'bg-white border-purple-200 hover:border-purple-300'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{getAlertIcon(alert.alert_type)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{alert.product_title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {t(`alerts.types.${alert.alert_type}`)}
                        </span>
                        {needsThreshold(alert.alert_type) && (
                          <span className="text-sm text-gray-600">
                            {editingAlert === alert.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={alert.threshold_price}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateThreshold(alert.id, e.target.value);
                                    } else if (e.key === 'Escape') {
                                      setEditingAlert(null);
                                    }
                                  }}
                                  className="w-24 px-2 py-1 border border-purple-300 rounded"
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => {
                                    const input = e.target.parentElement.querySelector('input');
                                    handleUpdateThreshold(alert.id, input.value);
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingAlert(null)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="font-semibold">€{alert.threshold_price}</span>
                                <button
                                  onClick={() => setEditingAlert(alert.id)}
                                  className="text-purple-600 hover:text-purple-700 ml-2"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </>
                            )}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 capitalize">
                          {alert.marketplace}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle activo/inactivo */}
                    <button
                      onClick={() => handleToggleActive(alert.id, alert.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${alert.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${alert.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>

                    {/* Estado */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${alert.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {alert.is_active ? t('alerts.active') : t('alerts.inactive')}
                    </span>

                    {/* Eliminar */}
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-800 transition p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal crear alerta */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {t('alerts.createAlert')}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                {/* Producto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('alerts.productLabel')}
                  </label>
                  <select
                    value={newAlert.product_external_id}
                    onChange={(e) => setNewAlert({ ...newAlert, product_external_id: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="">-- {t('common.select')} --</option>
                    {followedProducts.map((product) => (
                      <option key={product.external_id} value={product.external_id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de alerta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('alerts.typeLabel')}
                  </label>
                  <select
                    value={newAlert.alert_type}
                    onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="price_drop">🔻 {t('alerts.types.price_drop')}</option>
                    <option value="price_increase">🔺 {t('alerts.types.price_increase')}</option>
                    <option value="stock_available">✅ {t('alerts.types.stock_available')}</option>
                    <option value="stock_out">❌ {t('alerts.types.stock_out')}</option>
                  </select>
                </div>

                {/* Precio umbral (solo para alertas de precio) */}
                {needsThreshold(newAlert.alert_type) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('alerts.thresholdLabel')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAlert.threshold_price}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold_price: e.target.value })}
                      placeholder="49.99"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
                  >
                    {t('alerts.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;