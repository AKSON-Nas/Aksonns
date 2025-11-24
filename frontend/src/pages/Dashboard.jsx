import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, TrendingUp, BookOpen, ArrowRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Orçamentos',
      description: 'Crie orçamentos profissionais com logo e exporte em PDF',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      path: '/budgets',
      premium: true
    },
    {
      title: 'Estoque',
      description: 'Gerencie produtos, fornecedores, funcionários e movimentações',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      path: '/stock',
      premium: true
    },
    {
      title: 'Vendas',
      description: 'Registre vendas e acompanhe analytics em tempo real',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      path: '/sales',
      premium: true
    },
    {
      title: 'Guia Financeiro',
      description: 'Aprenda sobre lucro, tributos, DRE e gestão empresarial',
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      path: '/guide',
      premium: false
    }
  ];

  const handleNavigate = (path, premium) => {
    if (premium && user?.plan === 'free') {
      return;
    }
    navigate(path);
  };

  return (
    <div className="animate-fade-in" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Bem-vindo, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
          Escolha um módulo para começar a gerenciar seu negócio
        </p>
        {user?.plan === 'free' && (
          <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-900">Plano Gratuito Ativo</p>
              <p className="text-sm text-amber-700">Faça upgrade para Premium e desbloqueie todos os recursos!</p>
            </div>
            <Crown className="h-8 w-8 text-amber-500" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const isLocked = module.premium && user?.plan === 'free';
          
          return (
            <Card 
              key={index}
              data-testid={`module-card-${module.title.toLowerCase()}`}
              className={`relative overflow-hidden transition-all duration-300 ${
                isLocked 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
              }`}
              onClick={() => handleNavigate(module.path, module.premium)}
            >
              {isLocked && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </div>
                </div>
              )}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${module.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <CardHeader>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {module.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={isLocked ? "ghost" : "default"}
                  data-testid={`module-btn-${module.title.toLowerCase()}`}
                  className={`w-full ${
                    !isLocked && `bg-gradient-to-r ${module.color} hover:opacity-90 text-white`
                  }`}
                  disabled={isLocked}
                >
                  {isLocked ? 'Bloqueado' : 'Acessar'}
                  {!isLocked && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      {user?.plan === 'premium' && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Orçamentos</CardTitle>
              <CardDescription>Total criados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">-</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Produtos</CardTitle>
              <CardDescription>Em estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">-</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Receita</CardTitle>
              <CardDescription>Total de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">R$ -</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}