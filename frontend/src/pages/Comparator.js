import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Comparator() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/products');
      setProducts(response.data.products || []);
      if (response.data.products && response.data.products.length > 0) {
        setSelectedProduct(response.data.products[0].external_id);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const mockComparison = [
    { marketplace: 'Amazon.es', price: 59.99, stock: true, rating: 4.7, shipping: 'Gratis (Prime)' },
    { marketplace: 'eBay.es', price: 62.50, stock: true, rating: 4.5, shipping: '€3.99' },
    { marketplace: 'AliExpress', price: 45.99, stock: true, rating: 4.2, shipping: 'Gratis' },
    { marketplace: 'PcComponentes', price: 57.90, stock: true, rating: 4.8, shipping: 'Gratis' }
  ];

  const bestOption = mockComparison.reduce((best, current) => {
    const currentScore = current.rating * 100 - current.price;
    const bestScore = best.rating * 100 - best.price;
    return currentScore > bestScore ? current : best;
  }, mockComparison[0]);

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando comparador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Comparador de Marketplaces</h2>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600 mb-6">
          Compara el precio del mismo producto en diferentes tiendas online
        </p>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona un producto para comparar:
          </label>
          <select 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            {products.map((product, index) => (
              <option key={index} value={product.external_id}>
                {product.title}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Marketplace</th>
                <th className="px-6 py-4 text-left font-semibold">Precio</th>
                <th className="px-6 py-4 text-left font-semibold">Stock</th>
                <th className="px-6 py-4 text-left font-semibold">Rating</th>
                <th className="px-6 py-4 text-left font-semibold">Envío</th>
              </tr>
            </thead>
            <tbody>
              {mockComparison.map((item, index) => (
                <tr 
                  key={index} 
                  className={`border-b hover:bg-gray-50 ${
                    item.marketplace === bestOption.marketplace 
                      ? 'bg-green-50 border-l-4 border-green-500' 
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {item.marketplace}
                    {item.marketplace === bestOption.marketplace && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                        🏆 Mejor opción
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-2xl font-bold text-purple-600">
                    €{item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.stock 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.stock ? '✓ Disponible' : '✗ Agotado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{item.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.shipping}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-500">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🏆</span>
            <div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Mejor opción: {bestOption.marketplace}
              </h3>
              <ul className="space-y-1 text-green-700">
                <li>✓ Precio competitivo: <strong>€{bestOption.price.toFixed(2)}</strong></li>
                <li>✓ Rating más alto: <strong>{bestOption.rating} estrellas</strong></li>
                <li>✓ Envío: <strong>{bestOption.shipping}</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-bold text-gray-800 mb-2">💡 Cómo funciona</h4>
          <p className="text-sm text-gray-600">
            Este comparador analiza precio, rating y opciones de envío para determinar la mejor opción.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Comparator;