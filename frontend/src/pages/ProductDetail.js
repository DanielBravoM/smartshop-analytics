import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/api/v1/products/${id}`);
                setProduct(response.data.product);
            } catch (err) {
                console.error('Error:', err);
                setError('Error cargando el producto');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 text-xl">{error || 'Producto no encontrado'}</p>
                    <Link to="/products" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
                        Volver a productos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/products" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
                    ← Volver a productos
                </Link>

                <div className="bg-white rounded-xl shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-600 mb-2"><strong>Marca:</strong> {product.brand}</p>
                            <p className="text-gray-600 mb-2"><strong>Categoría:</strong> {product.category}</p>
                            <p className="text-gray-600 mb-2"><strong>Marketplace:</strong> {product.marketplace}</p>
                            {product.rating && (
                                <p className="text-gray-600 mb-2">
                                    <strong>Rating:</strong> ⭐ {product.rating} ({product.review_count} reviews)
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-4xl font-bold text-green-600 mb-4">
                                {product.current_price ? `${product.current_price}€` : 'Precio no disponible'}
                            </p>
                            <p className="text-gray-600">
                                <strong>Stock:</strong> {product.stock_status === 'in_stock' ? '✅ Disponible' : '❌ Agotado'}
                            </p>
                        </div>
                    </div>

                    {product.url && (
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                        >
                            Ver en Amazon
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;