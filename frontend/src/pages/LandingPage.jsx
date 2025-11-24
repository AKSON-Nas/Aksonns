import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, Package, TrendingUp, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LandingPage() {
  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    {
      icon: <BarChart3 className="h-12 w-12 text-blue-600" />,
      title: 'Orçamentos Inteligentes',
      description: 'Crie orçamentos profissionais com logo personalizada e exporte em PDF'
    },
    {
      icon: <Package className="h-12 w-12 text-purple-600" />,
      title: 'Controle de Estoque',
      description: 'Gerencie produtos, fornecedores, funcionários e movimentações'
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-green-600" />,
      title: 'Gestão de Vendas',
      description: 'Registre vendas, acompanhe receitas e analytics em tempo real'
    },
    {
      icon: <BookOpen className="h-12 w-12 text-orange-600" />,
      title: 'Guia Financeiro',
      description: 'Aprenda sobre lucro, tributos, DRE e gestão empresarial'
    }
  ];

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      features: [
        'Acesso ao Guia Financeiro',
        'Conteúdo educacional completo',
        'Aprenda gestão empresarial'
      ],
      cta: 'Começar Grátis',
      popular: false
    },
    {
      name: 'Premium',
      price: 'R$ 49',
      period: '/mês',
      features: [
        'Tudo do Gratuito',
        'Orçamentos ilimitados',
        'Controle de Estoque completo',
        'Gestão de Vendas',
        'Analytics avançados',
        'Exportação em PDF',
        'Upload de logo',
        'Suporte prioritário'
      ],
      cta: 'Começar Agora',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Planeje seu Negócio
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sistema completo de gestão empresarial. Orçamentos, Estoque, Vendas e Guia Financeiro tudo em um só lugar.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              data-testid="hero-login-btn"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Entrar com Google <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="features-section">
        <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Recursos Poderosos
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              data-testid={`feature-card-${index}`}
              className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 bg-white/80 backdrop-blur-sm"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {feature.title}
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="pricing-section">
        <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Planos Simples
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              data-testid={`plan-card-${index}`}
              className={`p-8 relative ${
                plan.popular 
                  ? 'border-4 border-blue-500 shadow-2xl transform scale-105' 
                  : 'border-2 border-gray-200'
              } bg-white transition-all duration-300 hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    MAIS POPULAR
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleLogin}
                data-testid={`plan-cta-btn-${index}`}
                className={`w-full py-6 text-lg rounded-full transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Pronto para Transformar seu Negócio?
          </h2>
          <p className="text-xl text-white/90 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Comece gratuitamente hoje e descubra como é fácil gerenciar sua empresa.
          </p>
          <Button 
            onClick={handleLogin}
            data-testid="cta-login-btn"
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
          >
            Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}