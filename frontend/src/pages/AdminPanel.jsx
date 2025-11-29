import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, CreditCard, Plus, Edit, Trash2, Check, X, MessageCircle, Clock, CheckCircle, Send, HeadphonesIcon } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPanel() {
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [planForm, setPlanForm] = useState({
    name: '',
    display_name: '',
    price: 0,
    features: []
  });

  const [paymentConfig, setPaymentConfig] = useState({
    mercadopago_access_token: '',
    webhook_url: ''
  });
  const [configSaved, setConfigSaved] = useState(false);
  
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [supportStats, setSupportStats] = useState({total: 0, open: 0, in_progress: 0, closed: 0});

  const availableFeatures = [
    { name: 'guide', label: 'Guia Financeiro' },
    { name: 'budgets', label: 'Orçamentos' },
    { name: 'stock', label: 'Controle de Estoque' },
    { name: 'sales', label: 'Gestão de Vendas' },
    { name: 'clients', label: 'Cadastro de Clientes' },
    { name: 'products', label: 'Cadastro de Produtos' },
    { name: 'suppliers', label: 'Cadastro de Fornecedores' },
    { name: 'employees', label: 'Cadastro de Funcionários' },
    { name: 'analytics', label: 'Analytics Avançado' },
    { name: 'pdf_export', label: 'Exportação PDF' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, usersRes, paymentsRes, configRes, ticketsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/plans`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/payments`),
        axios.get(`${API}/admin/payment-config`).catch(() => ({ data: null })),
        axios.get(`${API}/admin/support/tickets`),
        axios.get(`${API}/admin/support/stats`)
      ]);
      setPlans(plansRes.data);
      setUsers(usersRes.data);
      setPayments(paymentsRes.data);
      setSupportTickets(ticketsRes.data);
      setSupportStats(statsRes.data);
      
      if (configRes.data) {
        setConfigSaved(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403) {
        toast.error('Acesso negado. Você precisa ser admin.');
      }
    }
  };

  const handleFeatureToggle = (featureName) => {
    setPlanForm(prev => {
      const features = [...prev.features];
      const index = features.findIndex(f => f.name === featureName);
      
      if (index >= 0) {
        features[index].enabled = !features[index].enabled;
      } else {
        features.push({ name: featureName, enabled: true });
      }
      
      return { ...prev, features };
    });
  };

  const isFeatureEnabled = (featureName) => {
    const feature = planForm.features.find(f => f.name === featureName);
    return feature ? feature.enabled : false;
  };

  const handleCreatePlan = async () => {
    if (!planForm.name || !planForm.display_name) {
      toast.error('Preencha nome e nome de exibição');
      return;
    }

    try {
      if (editingPlan) {
        await axios.put(`${API}/admin/plans/${editingPlan.id}`, planForm);
        toast.success('Plano atualizado!');
      } else {
        await axios.post(`${API}/admin/plans`, planForm);
        toast.success('Plano criado!');
      }
      
      setShowPlanDialog(false);
      setEditingPlan(null);
      setPlanForm({ name: '', display_name: '', price: 0, features: [] });
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar plano');
      console.error(error);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      display_name: plan.display_name,
      price: plan.price,
      features: plan.features
    });
    setShowPlanDialog(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return;

    try {
      await axios.delete(`${API}/admin/plans/${planId}`);
      toast.success('Plano deletado!');
      fetchData();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao deletar plano');
      }
    }
  };

  const handleChangeUserPlan = async (userId, newPlan) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/plan`, null, {
        params: { new_plan: newPlan }
      });
      toast.success('Plano do usuário alterado!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao alterar plano');
    }
  };

  const handleSavePaymentConfig = async () => {
    if (!paymentConfig.mercadopago_access_token) {
      toast.error('Preencha o Access Token do Mercado Pago');
      return;
    }

    try {
      await axios.post(`${API}/admin/payment-config`, paymentConfig);
      toast.success('Configuração de pagamento salva!');
      setConfigSaved(true);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar configuração');
      console.error(error);
    }
  };

  const handleOpenTicket = async (ticket) => {
    try {
      const response = await axios.get(`${API}/admin/support/tickets/${ticket.id}`);
      setSelectedTicket(response.data);
      setShowTicketDialog(true);
    } catch (error) {
      toast.error('Erro ao abrir ticket');
    }
  };

  const handleReplyToTicket = async () => {
    if (!adminReply.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    try {
      await axios.post(`${API}/admin/support/tickets/${selectedTicket.id}/reply`, {
        ticket_id: selectedTicket.id,
        message: adminReply
      });
      
      toast.success('Resposta enviada!');
      setAdminReply('');
      
      // Refresh ticket
      const response = await axios.get(`${API}/admin/support/tickets/${selectedTicket.id}`);
      setSelectedTicket(response.data);
      fetchData();
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleChangeTicketStatus = async (ticketId, status) => {
    try {
      await axios.put(`${API}/admin/support/tickets/${ticketId}/status?status=${status}`);
      toast.success('Status atualizado!');
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        const response = await axios.get(`${API}/admin/support/tickets/${ticketId}`);
        setSelectedTicket(response.data);
      }
      
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <div className="animate-fade-in" data-testid="admin-panel">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Shield className="h-10 w-10 text-red-600 mr-4" />
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Painel Admin
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Gerencie planos, usuários e configurações do sistema</p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans" data-testid="tab-plans">
            <CreditCard className="h-4 w-4 mr-2" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">
            <Shield className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="support" data-testid="tab-support">
            <Shield className="h-4 w-4 mr-2" />
            Suporte
          </TabsTrigger>
        </TabsList>

        {/* PLANS TAB */}
        <TabsContent value="plans">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Planos</CardTitle>
                <CardDescription>Crie e edite planos de assinatura</CardDescription>
              </div>
              <Dialog open={showPlanDialog} onOpenChange={(open) => {
                setShowPlanDialog(open);
                if (!open) {
                  setEditingPlan(null);
                  setPlanForm({ name: '', display_name: '', price: 0, features: [] });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-600 to-pink-600" data-testid="new-plan-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome (ID)</Label>
                        <Input
                          value={planForm.name}
                          onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                          placeholder="ex: premium"
                          disabled={editingPlan}
                          data-testid="plan-name-input"
                        />
                        <p className="text-xs text-gray-500 mt-1">Identificador único (sem espaços)</p>
                      </div>
                      <div>
                        <Label>Nome de Exibição</Label>
                        <Input
                          value={planForm.display_name}
                          onChange={(e) => setPlanForm({ ...planForm, display_name: e.target.value })}
                          placeholder="ex: Premium"
                          data-testid="plan-display-name-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Preço (R$)</Label>
                      <Input
                        type="number"
                        value={planForm.price}
                        onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) })}
                        placeholder="0.00"
                        data-testid="plan-price-input"
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <Label className="text-lg mb-3 block">Features</Label>
                      <div className="space-y-3">
                        {availableFeatures.map((feature) => (
                          <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <Label className="cursor-pointer" htmlFor={`feature-${feature.name}`}>
                              {feature.label}
                            </Label>
                            <Switch
                              id={`feature-${feature.name}`}
                              checked={isFeatureEnabled(feature.name)}
                              onCheckedChange={() => handleFeatureToggle(feature.name)}
                              data-testid={`feature-toggle-${feature.name}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleCreatePlan} className="w-full bg-gradient-to-r from-red-600 to-pink-600" data-testid="save-plan-btn">
                      {editingPlan ? 'Atualizar Plano' : 'Criar Plano'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{plan.display_name}</CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditPlan(plan)} data-testid={`edit-plan-${plan.name}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePlan(plan.id)} data-testid={`delete-plan-${plan.name}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        <span className="text-2xl font-bold text-green-600">R$ {plan.price.toFixed(2)}</span>/mês
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold mb-2">Features:</p>
                        {plan.features.map((feature) => {
                          const featureLabel = availableFeatures.find(f => f.name === feature.name)?.label || feature.name;
                          return (
                            <div key={feature.name} className="flex items-center text-sm">
                              {feature.enabled ? (
                                <Check className="h-4 w-4 text-green-600 mr-2" />
                              ) : (
                                <X className="h-4 w-4 text-red-500 mr-2" />
                              )}
                              <span className={feature.enabled ? '' : 'line-through text-gray-400'}>
                                {featureLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">ID: {plan.name}</p>
                        <p className="text-xs text-gray-500">Status: {plan.is_active ? '✅ Ativo' : '❌ Inativo'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>Visualize e altere planos dos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano Atual</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.plan === 'premium' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={user.plan}
                          onChange={(e) => handleChangeUserPlan(user.id, e.target.value)}
                          data-testid={`change-plan-${user.id}`}
                        >
                          {plans.map((plan) => (
                            <option key={plan.name} value={plan.name}>
                              {plan.display_name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments">
          <div className="space-y-6">
            {/* Payment Configuration */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center">
                  {configSaved && <Check className="h-5 w-5 text-green-600 mr-2" />}
                  Configuração do Mercado Pago
                </CardTitle>
                <CardDescription>
                  Configure sua conta do Mercado Pago para receber pagamentos via PIX
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Access Token do Mercado Pago *</Label>
                  <Input
                    type="password"
                    value={paymentConfig.mercadopago_access_token}
                    onChange={(e) => setPaymentConfig({...paymentConfig, mercadopago_access_token: e.target.value})}
                    placeholder="APP_USR-..."
                    data-testid="mercadopago-token-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obtenha em: <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Painel de Desenvolvedor</a>
                  </p>
                </div>

                <div>
                  <Label>Webhook URL (Opcional)</Label>
                  <Input
                    value={paymentConfig.webhook_url}
                    onChange={(e) => setPaymentConfig({...paymentConfig, webhook_url: e.target.value})}
                    placeholder="https://seu-site.com/api/payments/webhook"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL para receber notificações de pagamento. Configure em: Aplicações → Webhooks
                  </p>
                </div>

                <Button 
                  onClick={handleSavePaymentConfig} 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                  data-testid="save-payment-config-btn"
                >
                  {configSaved ? 'Atualizar Configuração' : 'Salvar Configuração'}
                </Button>

                {configSaved && (
                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Pagamentos configurados! Usuários já podem gerar QR Codes.
                      </p>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${
                      paymentConfig.mercadopago_access_token?.startsWith('TEST-') 
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className="text-sm font-semibold mb-1">
                        {paymentConfig.mercadopago_access_token?.startsWith('TEST-')
                          ? '⚠️ Modo TESTE Ativo'
                          : '✅ Modo PRODUÇÃO Ativo'
                        }
                      </p>
                      <p className="text-xs">
                        {paymentConfig.mercadopago_access_token?.startsWith('TEST-')
                          ? 'Pagamentos simulados. Para pagamentos reais, use credenciais de produção.'
                          : 'Recebendo pagamentos reais via PIX.'
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold mb-2">📚 Como configurar:</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Acesse <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mercado Pago Developers</a></li>
                    <li>Crie uma aplicação ou use uma existente</li>
                    <li>Copie o "Access Token" de produção</li>
                    <li>Cole aqui e salve</li>
                    <li>Pronto! Pagamentos via PIX estarão ativos 🎉</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Todos os pagamentos realizados no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum pagamento registrado ainda
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>ID MP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.created_at).toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="font-medium">{payment.user_id}</TableCell>
                          <TableCell>{payment.plan_name}</TableCell>
                          <TableCell className="font-bold text-green-600">R$ {payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                              payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status === 'approved' ? '✅ Aprovado' :
                               payment.status === 'rejected' ? '❌ Rejeitado' :
                               '⏱️ Pendente'}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{payment.mercadopago_payment_id || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SUPPORT TAB */}
        <TabsContent value="support">
          <div className="space-y-6">
            {/* Support Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{supportStats.total}</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">Abertos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{supportStats.open}</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-600">Em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{supportStats.in_progress}</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Fechados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{supportStats.closed}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tickets List */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets de Suporte</CardTitle>
                <CardDescription>Gerencie todas as solicitações de suporte</CardDescription>
              </CardHeader>
              <CardContent>
                {supportTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <HeadphonesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum ticket de suporte ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportTickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleOpenTicket(ticket)}
                        data-testid={`admin-ticket-${ticket.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {ticket.status === 'open' ? 'Aberto' :
                                 ticket.status === 'in_progress' ? 'Em Andamento' :
                                 'Fechado'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{ticket.user_name} ({ticket.user_email})</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(ticket.created_at).toLocaleString('pt-BR')} • {ticket.messages.length} mensagens
                            </p>
                          </div>
                          <MessageCircle className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ticket Details Dialog */}
            {selectedTicket && (
              <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle>{selectedTicket.subject}</DialogTitle>
                      <div className="flex gap-2">
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleChangeTicketStatus(selectedTicket.id, e.target.value)}
                          className="border rounded px-3 py-1 text-sm"
                          data-testid="ticket-status-select"
                        >
                          <option value="open">Aberto</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="closed">Fechado</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedTicket.user_name} ({selectedTicket.user_email})
                    </p>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                      {selectedTicket.messages.map((msg, idx) => {
                        const isAdmin = msg.sender_name.includes('Admin');
                        return (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-lg ${
                              isAdmin 
                                ? 'bg-blue-100 border-blue-200 border ml-8' 
                                : 'bg-white border border-gray-200 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-semibold text-sm ${isAdmin ? 'text-blue-900' : 'text-gray-900'}`}>
                                {msg.sender_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.created_at).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin Reply */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="space-y-2">
                        <Label>Responder como Admin</Label>
                        <Textarea
                          value={adminReply}
                          onChange={(e) => setAdminReply(e.target.value)}
                          placeholder="Digite sua resposta..."
                          rows={4}
                          data-testid="admin-reply-input"
                        />
                        <Button 
                          onClick={handleReplyToTicket} 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                          data-testid="admin-reply-btn"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Resposta
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
