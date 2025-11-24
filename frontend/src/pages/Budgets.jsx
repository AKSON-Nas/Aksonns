import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Download, Trash2, Upload, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Budgets() {
  const { user } = useContext(AppContext);
  const [budgets, setBudgets] = useState([]);
  const [clients, setClients] = useState([]);
  const [company, setCompany] = useState(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [budgetItems, setBudgetItems] = useState([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
  const [selectedClient, setSelectedClient] = useState('');
  const [budgetDiscount, setBudgetDiscount] = useState(0);
  const [budgetTax, setBudgetTax] = useState(0);
  const [budgetNotes, setBudgetNotes] = useState('');
  
  const [companyForm, setCompanyForm] = useState({ name: '', address: '', phone: '', email: '' });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budgetsRes, clientsRes, companyRes] = await Promise.all([
        axios.get(`${API}/budgets`),
        axios.get(`${API}/clients`),
        axios.get(`${API}/company`).catch(() => ({ data: null }))
      ]);
      setBudgets(budgetsRes.data);
      setClients(clientsRes.data);
      setCompany(companyRes.data);
      if (companyRes.data) {
        setCompanyForm({
          name: companyRes.data.name,
          address: companyRes.data.address || '',
          phone: companyRes.data.phone || '',
          email: companyRes.data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateClient = async () => {
    try {
      await axios.post(`${API}/clients`, newClient);
      toast.success('Cliente criado!');
      setShowClientDialog(false);
      setNewClient({ name: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar cliente');
    }
  };

  const handleItemChange = (index, field, value) => {
    const items = [...budgetItems];
    items[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = items[index].quantity * items[index].unit_price;
    }
    setBudgetItems(items);
  };

  const addItem = () => {
    setBudgetItems([...budgetItems, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const handleCreateBudget = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente');
      return;
    }
    if (budgetItems.length === 0 || !budgetItems[0].description) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    try {
      await axios.post(`${API}/budgets`, {
        client_id: selectedClient,
        items: budgetItems,
        discount: budgetDiscount,
        tax: budgetTax,
        notes: budgetNotes
      });
      toast.success('Orçamento criado!');
      setShowBudgetDialog(false);
      setBudgetItems([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
      setSelectedClient('');
      setBudgetDiscount(0);
      setBudgetTax(0);
      setBudgetNotes('');
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar orçamento');
    }
  };

  const handleExportPDF = async (budgetId) => {
    try {
      const response = await axios.get(`${API}/budgets/${budgetId}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orcamento_${budgetId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF exportado!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleSaveCompany = async () => {
    try {
      if (company) {
        await axios.put(`${API}/company/${company.id}`, companyForm);
      } else {
        await axios.post(`${API}/company`, companyForm);
      }
      toast.success('Empresa salva!');
      setShowCompanyDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar empresa');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/company/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Logo enviada!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao enviar logo');
    }
  };

  return (
    <div className="animate-fade-in" data-testid="budgets-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <FileText className="inline h-10 w-10 mr-3 text-blue-600" />
            Orçamentos
          </h1>
          <p className="text-gray-600 text-lg">Crie orçamentos profissionais e exporte em PDF</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="company-btn">
                <Building2 className="h-4 w-4 mr-2" />
                {company ? 'Editar Empresa' : 'Cadastrar Empresa'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Informações da Empresa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    data-testid="company-name-input"
                  />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Logo da Empresa</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    data-testid="logo-upload-input"
                  />
                  {company?.logo_url && (
                    <img src={company.logo_url} alt="Logo" className="mt-2 h-20 w-20 object-contain" />
                  )}
                </div>
                <Button onClick={handleSaveCompany} className="w-full" data-testid="save-company-btn">
                  Salvar Empresa
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="new-client-btn">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    data-testid="client-name-input"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Textarea
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateClient} className="w-full" data-testid="create-client-btn">
                  Criar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600" data-testid="new-budget-btn">
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Orçamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cliente</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger data-testid="client-select">
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
                    <Label className="text-lg">Itens do Orçamento</Label>
                    <Button size="sm" variant="outline" onClick={addItem} data-testid="add-item-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  {budgetItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-3">
                      <div className="col-span-5">
                        <Input
                          placeholder="Descrição"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          data-testid={`item-description-${index}`}
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
                          disabled={budgetItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Desconto (R$)</Label>
                    <Input
                      type="number"
                      value={budgetDiscount}
                      onChange={(e) => setBudgetDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Impostos (R$)</Label>
                    <Input
                      type="number"
                      value={budgetTax}
                      onChange={(e) => setBudgetTax(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={budgetNotes}
                    onChange={(e) => setBudgetNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span className="font-bold">R$ {budgetItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                  {budgetDiscount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Desconto:</span>
                      <span>- R$ {budgetDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {budgetTax > 0 && (
                    <div className="flex justify-between mb-2 text-red-600">
                      <span>Impostos:</span>
                      <span>+ R$ {budgetTax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>R$ {(budgetItems.reduce((sum, item) => sum + item.total, 0) - budgetDiscount + budgetTax).toFixed(2)}</span>
                  </div>
                </div>

                <Button onClick={handleCreateBudget} className="w-full bg-gradient-to-r from-blue-600 to-purple-600" data-testid="create-budget-btn">
                  Criar Orçamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {budgets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum orçamento criado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro orçamento!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos Criados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget.id} data-testid={`budget-row-${budget.id}`}>
                    <TableCell className="font-medium">{budget.client_name}</TableCell>
                    <TableCell>{new Date(budget.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{budget.items.length}</TableCell>
                    <TableCell className="font-bold text-green-600">R$ {budget.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {budget.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportPDF(budget.id)}
                        data-testid={`export-pdf-btn-${budget.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
