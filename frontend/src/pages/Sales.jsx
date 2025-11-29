import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Plus, DollarSign, ShoppingCart, Users, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState('');
  const [saleItems, setSaleItems] = useState([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, clientsRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/sales`),
        axios.get(`${API}/clients`),
        axios.get(`${API}/sales/analytics`)
      ]);
      setSales(salesRes.data);
      setClients(clientsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const items = [...saleItems];
    items[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = items[index].quantity * items[index].unit_price;
    }
    setSaleItems(items);
  };

  const addItem = () => {
    setSaleItems([...saleItems, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleCreateSale = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente');
      return;
    }
    if (saleItems.length === 0 || !saleItems[0].description) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    try {
      await axios.post(`${API}/sales`, {
        client_id: selectedClient,
        items: saleItems,
        payment_method: paymentMethod
      });
      toast.success('Venda registrada!');
      setShowSaleDialog(false);
      setSaleItems([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
      setSelectedClient('');
      setPaymentMethod('dinheiro');
      fetchData();
    } catch (error) {
      toast.error('Erro ao registrar venda');
    }
  };

  return (
    <div className="animate-fade-in" data-testid="sales-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <TrendingUp className="inline h-10 w-10 mr-3 text-green-600" />
            Gestão de Vendas
          </h1>
          <p className="text-gray-600 text-lg">Registre vendas e acompanhe analytics</p>
        </div>
        <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600" data-testid="new-sale-btn">
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Venda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger data-testid="sale-client-select">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg">Itens da Venda</Label>
                  <Button size="sm" variant="outline" onClick={addItem} data-testid="add-sale-item-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
                {saleItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-5">
                      <Input
                        placeholder="Descrição"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        data-testid={`sale-item-description-${index}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Preço"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={`R$ ${item.total.toFixed(2)}`}
                        disabled
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                        disabled={saleItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {saleItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleCreateSale} className="w-full bg-gradient-to-r from-green-600 to-emerald-600" data-testid="create-sale-btn">
                Registrar Venda
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">R$ {analytics.total_revenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{analytics.total_sales}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">R$ {analytics.avg_ticket.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Clientes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{clients.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Clients */}
      {analytics && analytics.top_clients.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Melhores Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_clients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold mr-4">
                      {index + 1}
                    </div>
                    <span className="font-semibold">{client.name}</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">R$ {client.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma venda registrada</h3>
              <p className="text-gray-600 mb-4">Comece registrando sua primeira venda!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} data-testid={`sale-row-${sale.id}`}>
                    <TableCell>{new Date(sale.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{sale.client_name}</TableCell>
                    <TableCell>{sale.items.length}</TableCell>
                    <TableCell className="capitalize">{sale.payment_method.replace('_', ' ')}</TableCell>
                    <TableCell className="font-bold text-green-600">R$ {sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {sale.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
