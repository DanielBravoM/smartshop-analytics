import React, { useState, useEffect } from 'react';
import { Search, Plus, TrendingDown, Store, Package, RefreshCw } from 'lucide-react';

const Comparator = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'shoes',
    basePrice: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/comparator/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/comparator/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProduct,
          basePrice: parseFloat(newProduct.basePrice)
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAddModal(false);
        setNewProduct({
          name: '',
          brand: '',
          category: 'shoes',
          basePrice: '',
          description: '',
          imageUrl: ''
        });
        fetchProducts();
        alert('¡Producto agregado exitosamente!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error al agregar producto');
    }
    
    setLoading(false);
  };

  const refreshPrices = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/comparator/products/${productId}/refresh-prices`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchProducts();
        alert('¡Precios actualizados!');
      }
    } catch (error) {
      console.error('Error refreshing prices:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Store className="w-8 h-8 text-blue-600" />
                Comparador de Precios
              </h1>
              <p className="text-gray-600 mt-1">
                Compara precios de productos en múltiples tiendas
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Agregar Producto
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-500 mb-4">
              Agrega tu primer producto para comenzar a comparar precios
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Agregar Producto
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProducts.map((product) => (
              <div key={product.productId} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                        <p className="text-gray-600">{product.brand}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            {product.availableStores} de {product.totalStores} tiendas disponibles
                          </span>
                          <button
                            onClick={() => refreshPrices(product.productId)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar precios
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <TrendingDown className="w-5 h-5" />
                        <span className="text-sm font-medium">Precio más bajo</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-800">
                        {product.lowestPrice.toFixed(2)}€
                      </div>
                      <div className="text-sm text-gray-500">
                        Promedio: {product.averagePrice.toFixed(2)}€
                      </div>
                    </div>
                  </div>

                  {/* Tabla de precios por tienda */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Precios por tienda:</h4>
                    <div className="grid gap-3">
                      {product.storePrices.map((store, index) => (
                        <div
                          key={store.storeId}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            index === 0 && store.inStock
                              ? 'bg-green-50 border-2 border-green-200'
                              : 'bg-gray-50'
                          } ${!store.inStock ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full border">
                              {index === 0 && store.inStock ? (
                                <span className="text-green-600 font-bold">★</span>
                              ) : (
                                <span className="text-gray-400">{index + 1}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{store.storeName}</div>
                              <div className="text-sm text-gray-500">
                                {store.inStock ? (
                                  <>
                                    Stock: {store.stockQuantity} | Entrega: {store.deliveryDays} días
                                  </>
                                ) : (
                                  <span className="text-red-600">Sin stock</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">
                              {store.price.toFixed(2)}€
                            </div>
                            {store.discountPercentage > 0 && (
                              <div className="text-sm text-red-600">
                                Antes: {store.previousPrice.toFixed(2)}€ (-{store.discountPercentage}%)
                              </div>
                            )}
                            <div className="text-sm text-yellow-600">
                              ⭐ {store.rating} ({store.reviewCount} reseñas)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para agregar producto */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Agregar Producto</h2>
              <form onSubmit={addProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ej: Adidas Samba Classic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="Ej: Adidas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="shoes">Zapatos</option>
                    <option value="clothing">Ropa</option>
                    <option value="electronics">Electrónica</option>
                    <option value="sports">Deportes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio base (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                    placeholder="89.99"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Descripción del producto..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de imagen
                  </label>
                  <input
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Agregando...' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparator;