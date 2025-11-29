import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, QrCode, Check, Clock, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentPage() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [myPayments, setMyPayments] = useState([]);

  useEffect(() => {
    fetchPlans();
    fetchMyPayments();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans/public`);
      const availablePlans = response.data.filter(p => p.name !== user.plan && p.price > 0);
      setPlans(availablePlans);
      if (availablePlans.length > 0) {
        setSelectedPlan(availablePlans[0].name);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchMyPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments/my-payments`);
      setMyPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!selectedPlan) {
      toast.error('Selecione um plano');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/payments/create-pix`, {
        plan_name: selectedPlan
      });

      setPaymentData(response.data);
      toast.success('QR Code gerado! Escaneie para pagar.');
      
      // Refresh payments list
      setTimeout(() => {
        fetchMyPayments();
      }, 1000);
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('not configured')) {
        toast.error('Pagamento não configurado. Entre em contato com o administrador.');
      } else {
        toast.error('Erro ao gerar QR Code. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      approved: { icon: Check, color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      rejected: { icon: X, color: 'bg-red-100 text-red-800', label: 'Rejeitado' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const selectedPlanData = plans.find(p => p.name === selectedPlan);

  return (
    <div className="animate-fade-in" data-testid="payment-page">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center mb-4">
          <CreditCard className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Pagamento via PIX
            </h1>
            <p className="text-gray-600 text-lg">Atualize seu plano e tenha acesso completo</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar QR Code PIX</CardTitle>
            <CardDescription>Selecione um plano e gere o QR Code para pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum plano disponível para upgrade</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Selecione o Plano</label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger data-testid="plan-select">
                      <SelectValue placeholder="Escolha um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.name} value={plan.name}>
                          {plan.display_name} - R$ {plan.price.toFixed(2)}/mês
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlanData && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">{selectedPlanData.display_name}</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-3">
                      R$ {selectedPlanData.price.toFixed(2)}<span className="text-sm text-gray-600">/mês</span>
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Recursos incluídos:</p>
                      {selectedPlanData.features.filter(f => f.enabled).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-600 mr-2" />
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerateQRCode}
                  disabled={loading || !selectedPlan}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  data-testid="generate-qr-btn"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Gerar QR Code PIX
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* QR Code Display */}
        {paymentData && (
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center">
                <QrCode className="h-6 w-6 mr-2 text-blue-600" />
                QR Code Gerado
              </CardTitle>
              <CardDescription>Escaneie com o app do seu banco</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg inline-block">
                  {paymentData.qr_code_base64 && (
                    <img
                      src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-64 h-64 mx-auto"
                    />
                  )}
                </div>
                
                <div className="text-left bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Código PIX Copia e Cola:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentData.qr_code || ''}
                      readOnly
                      className="flex-1 text-xs p-2 border rounded bg-white font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.qr_code);
                        toast.success('Código copiado!');
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">R$ {paymentData.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{paymentData.plan_name}</p>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>⏱️ Aguardando pagamento...</p>
                  <p>✅ Após o pagamento, seu plano será ativado automaticamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment History */}
      {myPayments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  data-testid={`payment-${payment.id}`}
                >
                  <div>
                    <p className="font-semibold">{payment.plan_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-lg">R$ {payment.amount.toFixed(2)}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
