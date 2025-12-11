import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
            {/* Selector de idioma en la esquina */}
            <div className="absolute top-4 right-4">
                <LanguageSelector />
            </div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">📊</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {t('auth.welcome')}
                    </h1>
                    <h2 className="text-2xl font-bold text-purple-600 mb-2">
                        {t('auth.platformName')}
                    </h2>
                    <p className="text-gray-600">
                        {t('auth.platformDesc')}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('auth.password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t('common.loading') : t('auth.loginButton')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        {t('auth.noAccount')}{' '}
                        <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                            {t('auth.register')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;