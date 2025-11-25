import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, Edit, Trash2 } from 'lucide-react';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/alerts');
      setAlerts(response.data.alerts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id) => {
    if (!window.confirm('¿Eliminar esta alerta?')) return;

    try {
      await axios.delete(`/api/v1/alerts/${id}`);
      setAlerts(alerts.filter(alert => alert.id !== id));
    } catch (err) {
      console.error('Error deleting alert:', err);
      alert('Error al eliminar la alerta');
    }
  };

  const toggleAlert = async (id, currentState) => {
    try {
      await axios.put(`/api/v1/alerts/${id}`, {
        active: !currentState
      });
      setAlerts(alerts.map(alert =>
        alert.id === id ? { ...alert, active: !currentState } : alert
      ));
    } catch (err) {
      console.error('Error updating alert:', err);
      alert('Error al actualizar la alerta');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Mis Alertas</h2>
          <p className="text-gray-600 mt-1">Gestiona tus notificaciones personalizadas</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          <Plus size={20} />
          Nueva Alerta
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-800">
          {error}
        </div>
      )}

      {/* Lista de alertas */}
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                alert.active ? 'border-green-200' : 'border-gray-200 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">
                    {alert.condition_met ? '🚨' : '🔔'}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-800 text-lg capitalize">
                        {alert.alert_type.replace('_', ' ')}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {alert.active ? '🟢 ACTIVA' : '⚫ PAUSADA'}
                      </span>
                      {alert.condition_met && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                          ¡ACTIVADA!
                        </span>
                      )}
                    </div>
                    {alert.threshold_value && (
                      <p className="text-gray-700 mb-1">
                        Umbral: <span className="font-semibold">€{alert.threshold_value}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Creada: {new Date(alert.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id, alert.active)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      alert.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {alert.active ? 'Pausar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} className="text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Bell size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-600 mb-4">No tienes alertas configuradas</p>
          <button className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            <Plus size={20} />
            Crear primera alerta
          </button>
        </div>
      )}

      {/* Info de tipos de alertas */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Tipos de Alertas Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '💰', title: 'Bajada de precio', desc: 'Umbral personalizado' },
            { icon: '📦', title: 'Cambio de stock', desc: 'Sin stock → Disponible' },
            { icon: '⭐', title: 'Cambio en rating', desc: 'Subida o bajada de estrellas' },
            { icon: '💬', title: 'Reseñas negativas', desc: 'Nueva reseña < 3 estrellas' },
            { icon: '📈', title: 'Tendencia de demanda', desc: 'Demanda aumenta' },
            { icon: '🏆', title: 'Competidor', desc: 'Competidor cambia precio' }
          ].map((type, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <div className="font-semibold text-gray-800">{type.title}</div>
                  <div className="text-sm text-gray-600">{type.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Alerts;