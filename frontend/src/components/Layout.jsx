import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, FileText, Package, TrendingUp, BookOpen, LogOut, Crown, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Layout({ children }) {
  const { user, setUser } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
      setUser(null);
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      await axios.post(`${API}/auth/upgrade-plan`);
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
      toast.success('Plano atualizado para Premium!');
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Erro ao atualizar plano');
    }
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/budgets', icon: FileText, label: 'Orçamentos', premium: true },
    { path: '/stock', icon: Package, label: 'Estoque', premium: true },
    { path: '/sales', icon: TrendingUp, label: 'Vendas', premium: true },
    { path: '/guide', icon: BookOpen, label: 'Guia' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50" data-testid="sidebar">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Planeje Negócio
          </h1>
          {user?.plan === 'free' && (
            <Button
              onClick={handleUpgrade}
              data-testid="upgrade-premium-btn"
              size="sm"
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Premium
            </Button>
          )}
        </div>
        <nav className="px-3" data-testid="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isLocked = item.premium && user?.plan === 'free';
            
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : isLocked
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={(e) => isLocked && e.preventDefault()}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
                {isLocked && <Crown className="h-4 w-4 ml-auto text-amber-500" />}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start" data-testid="user-menu-btn">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.plan}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}