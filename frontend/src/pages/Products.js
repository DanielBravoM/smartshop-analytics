import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Heart } from 'lucide-react';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [followedProducts, setFollowedProducts] = useState([]);
  const [followingLoading, setFollowingLoading] = useState({});

  useEffect(() => {
    // Delay inicial de 300ms para asegurar que los servicios están listos
    const timer = setTimeout(() => {
      fetchProducts();
      fetchFollowedProducts();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchProducts = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/v1/products');
      setProducts(response.data.products || []);
    } catch (err) {
      console.error(`Error fetching products (intento ${retryCount + 1}/${maxRetries}):`, err);
      
      if (retryCount < maxRetries) {
        // Reintentar después de 1 segundo
        setTimeout(() => {
          fetchProducts(retryCount + 1);
        }, 1000);
      } else {
        setError('Error al cargar productos');
        setLoading(false);
      }
      return;
    }
    
    setLoading(false);
  };

  const fetchFollowedProducts = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      const response = await axios.get('/api/v1/user-products/following');
      setFollowedProducts(response.data.following || []);
    } catch (err) {
      console.error(`Error fetching followed products (intento ${retryCount + 1}/${maxRetries}):`, err);
      
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchFollowedProducts(retryCount + 1);
        }, 1000);
      }
    }
  };

  const isFollowing = (productId) => {
    return followedProducts.includes(productId);
  };

  const toggleFollow = async (productId, e) => {
    e.stopPropagation();
    
    setFollowingLoading(prev => ({ ...prev, [productId]: true }));

    try {
      if (isFollowing(productId)) {
        await axios.delete(`/api/v1/user-products/unfollow/${productId}`);
        setFollowedProducts(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post(`/api/v1/user-products/follow/${productId}`);
        setFollowedProducts(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Error al actualizar seguimiento');
    } finally {
      setFollowingLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marketplace?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">📦 Productos Disponibles</h2>

      {/* Información de productos seguidos */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4 mb-6 border-2 border-purple-200">
        <p className="text-purple-800 font-semibold">
          ❤️ Sigues <span className="text-2xl font-bold">{followedProducts.length}</span> productos
        </p>
        <p className="text-purple-600 text-sm">Los datos del dashboard se calculan solo con tus productos seguidos</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-8 flex items-center gap-3">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos por nombre, marca o marketplace..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-gray-700"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-800">
          {error}
          <button
            onClick={fetchProducts}
            className="ml-4 text-red-600 underline hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Contador de productos */}
      <div className="mb-4 text-gray-600">
        Mostrando {filteredProducts.length} de {products.length} productos
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => {
            const following = isFollowing(product.external_id);
            const loadingFollow = followingLoading[product.external_id];

            return (
              <div
                key={product._id || index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-300 transform hover:-translate-y-1 relative"
              >
                {/* Botón de seguir en la esquina */}
                <button
                  onClick={(e) => toggleFollow(product.external_id, e)}
                  disabled={loadingFollow}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                    following
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } ${loadingFollow ? 'opacity-50 cursor-wait' : ''}`}
                  title={following ? 'Dejar de seguir' : 'Seguir producto'}
                >
                  <Heart
                    size={20}
                    fill={following ? 'currentColor' : 'none'}
                  />
                </button>

                <div className="flex flex-col h-full">
                  {/* Header del producto */}
                  <div className="flex items-start gap-4 mb-4 pr-8">
                    <div className="text-5xl">📦</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                        {product.title}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold capitalize">
                          {product.marketplace}
                        </span>
                        {product.brand && (
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            {product.brand}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenido del producto */}
                  <div className="space-y-3 flex-1">
                    {/* Precio */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold text-purple-600">
                          €{product.current_price?.toFixed(2)}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock_status === 'in_stock'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock_status === 'in_stock' ? '✓ En stock' : '✗ Sin stock'}
                      </span>
                    </div>

                    {/* Rating y reviews */}
                    {product.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-gray-500">
                          ({product.review_count?.toLocaleString() || 0} reseñas)
                        </span>
                      </div>
                    )}

                    {/* Última actualización */}
                    <div className="text-xs text-gray-500">
                      Actualizado: {new Date(product.last_updated).toLocaleDateString('es-ES')}
                    </div>

                    {/* Estado de seguimiento */}
                    {following && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                        <span className="text-red-700 text-xs font-semibold">
                          ❤️ Siguiendo este producto
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <button
                      onClick={() => openProductDetail(product)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold transform hover:scale-105"
                    >
                      Ver Detalle →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">No se encontraron productos</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm">
                Intenta con otro término de búsqueda
              </p>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE DETALLES */}
      {showModal && selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.title}</h2>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold capitalize">
                    {selectedProduct.marketplace}
                  </span>
                  {selectedProduct.brand && (
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                      {selectedProduct.brand}
                    </span>
                  )}
                  {isFollowing(selectedProduct.external_id) && (
                    <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Heart size={14} fill="currentColor" />
                      Siguiendo
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Precio destacado */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Precio actual</p>
                <p className="text-5xl font-bold text-green-600">
                  {selectedProduct.current_price ? `€${selectedProduct.current_price.toFixed(2)}` : 'No disponible'}
                </p>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">ASIN / ID</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.external_id}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Estado de Stock</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedProduct.stock_status === 'in_stock'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedProduct.stock_status === 'in_stock' ? '✓ En stock' : '✗ Sin stock'}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Categoría</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedProduct.category}</p>
                </div>

                {selectedProduct.rating && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Valoración</p>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-xl">⭐</span>
                      <span className="font-semibold text-gray-900 text-lg">{selectedProduct.rating}</span>
                      <span className="text-gray-500 text-sm">
                        ({selectedProduct.review_count?.toLocaleString() || 0} reviews)
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Última actualización</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedProduct.last_updated).toLocaleString('es-ES', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={(e) => {
                    toggleFollow(selectedProduct.external_id, e);
                    closeModal();
                  }}
                  disabled={followingLoading[selectedProduct.external_id]}
                  className={`flex-1 py-3 px-6 rounded-lg transition font-semibold ${
                    isFollowing(selectedProduct.external_id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isFollowing(selectedProduct.external_id) ? '💔 Dejar de seguir' : '❤️ Seguir producto'}
                </button>
                {selectedProduct.url && (
                  <a
                    href={selectedProduct.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold text-center"
                  >
                    🛒 Ver en {selectedProduct.marketplace}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;