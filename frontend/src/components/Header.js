import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, BarChart3, FileText, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <h1 className="text-2xl font-bold">SmartShop Analytics</h1>
          </div>
          
          <nav className="hidden md:flex gap-2 items-center">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/') 
                  ? 'bg-white text-purple-600 font-semibold' 
                  : 'hover:bg-purple-700'
              }`}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/products" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/products') 
                  ? 'bg-white text-purple-600 font-semibold' 
                  : 'hover:bg-purple-700'
              }`}
            >
              <Package size={18} />
              <span>Productos</span>
            </Link>

            <Link 
              to="/comparator" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/comparator') 
                  ? 'bg-white text-purple-600 font-semibold' 
                  : 'hover:bg-purple-700'
              }`}
            >
              <BarChart3 size={18} />
              <span>Comparador</span>
            </Link>

            <Link 
              to="/reports" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/reports') 
                  ? 'bg-white text-purple-600 font-semibold' 
                  : 'hover:bg-purple-700'
              }`}
            >
              <FileText size={18} />
              <span>Reportes</span>
            </Link>
            
            <Link 
              to="/alerts" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/alerts') 
                  ? 'bg-white text-purple-600 font-semibold' 
                  : 'hover:bg-purple-700'
              }`}
            >
              <Bell size={18} />
              <span>Alertas</span>
            </Link>

            {/* Mostrar Admin solo si es admin */}
            {isAdmin() && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/admin') 
                    ? 'bg-white text-purple-600 font-semibold' 
                    : 'hover:bg-purple-700'
                }`}
              >
                <span>🛠️</span>
                <span>Admin</span>
              </Link>
            )}

            {/* Separador */}
            <div className="h-8 w-px bg-white/30 mx-2"></div>

            {/* Info de usuario */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <User size={18} />
              <span className="text-sm font-medium">{user?.name}</span>
              {isAdmin() && (
                <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                  ADMIN
                </span>
              )}
            </div>

            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-all"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;