import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configurar axios para incluir token en todas las peticiones
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Verificar token al cargar
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const response = await axios.get('http://localhost:3000/api/v1/auth/verify');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Token inválido:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
                email,
                password
            });

            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    };

    const register = async (email, password, name) => {
        try {
            const response = await axios.post('http://localhost:3000/api/v1/auth/register', {
                email,
                password,
                name
            });

            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Error en registro:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al registrarse'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAdmin,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};