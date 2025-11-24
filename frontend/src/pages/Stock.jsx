import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, AlertTriangle, TrendingUp, TrendingDown, Users, Truck } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [movements, setMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  
  const [productForm, setProductForm] = useState({ name: '', sku: '', category: '', quantity: 0, min_quantity: 0, unit_price: 0, supplier_id: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', contact: '', phone: '', email: '', address: '' });
  const [employeeForm, setEmployeeForm] = useState({ name: '', role: '', email: '', phone: '', salary: 0 });
  const [movementForm, setMovementForm] = useState({ product_id: '', type: 'entrada', quantity: 0, reason: '', employee_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, suppliersRes, employeesRes, movementsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/suppliers`),
        axios.get(`${API}/employees`),
        axios.get(`${API}/stock-movements`),
        axios.get(`${API}/products/alerts`)
      ]);
      setProducts(productsRes.data);
      setSuppliers(suppliersRes.data);
      setEmployees(employeesRes.data);
      setMovements(movementsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await axios.post(`${API}/products`, productForm);
      toast.success('Produto criado!');
      setShowProductDialog(false);
      setProductForm({ name: '', sku: '', category: '', quantity: 0, min_quantity: 0, unit_price: 0, supplier_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar produto');
    }
  };

  const handleCreateSupplier = async () => {
    try {
      await axios.post(`${API}/suppliers`, supplierForm);
      toast.success('Fornecedor criado!');
      setShowSupplierDialog(false);
      setSupplierForm({ name: '', contact: '', phone: '', email: '', address: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar fornecedor');
    }
  };

  const handleCreateEmployee = async () => {
    try {
      await axios.post(`${API}/employees`, employeeForm);
      toast.success('Funcionário criado!');
      setShowEmployeeDialog(false);
      setEmployeeForm({ name: '', role: '', email: '', phone: '', salary: 0 });
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar funcionário');
    }
  };

  const handleCreateMovement = async () => {
    try {
      await axios.post(`${API}/stock-movements`, movementForm);
      toast.success('Movimentação registrada!');
      setShowMovementDialog(false);
      setMovementForm({ product_id: '', type: 'entrada', quantity: 0, reason: '', employee_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao registrar movimentação');
    }
  };

  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);

  return (
    <div className="animate-fade-in" data-testid="stock-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Package className="inline h-10 w-10 mr-3 text-purple-600" />
            Controle de Estoque
          </h1>
          <p className="text-gray-600 text-lg">Gerencie produtos, fornecedores e movimentações</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">R$ {totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{suppliers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((product) => (
                <div key={product.id} className="p-3 bg-white rounded-lg border border-red-200">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600">Quantidade: {product.quantity} (Mín: {product.min_quantity})</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" data-testid="tab-products">Produtos</TabsTrigger>
          <TabsTrigger value="movements" data-testid="tab-movements">Movimentações</TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="employees" data-testid="tab-employees">Funcionários</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos</CardTitle>
              <div className="flex gap-2">
                <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="new-movement-btn">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Nova Movimentação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Movimentação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Produto</Label>
                        <Select value={movementForm.product_id} onValueChange={(v) => setMovementForm({ ...movementForm, product_id: v })}>
                          <SelectTrigger data-testid="movement-product-select">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select value={movementForm.type} onValueChange={(v) => setMovementForm({ ...movementForm, type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="saida">Saída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={movementForm.quantity}
                          onChange={(e) => setMovementForm({ ...movementForm, quantity: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Motivo</Label>
                        <Input
                          value={movementForm.reason}
                          onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Funcionário (Opcional)</Label>
                        <Select value={movementForm.employee_id} onValueChange={(v) => setMovementForm({ ...movementForm, employee_id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateMovement} className="w-full" data-testid="create-movement-btn">
                        Registrar Movimentação
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600" data-testid="new-product-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Produto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          data-testid="product-name-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={productForm.sku}
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <Input
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            value={productForm.quantity}
                            onChange={(e) => setProductForm({ ...productForm, quantity: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Estoque Mínimo</Label>
                          <Input
                            type="number"
                            value={productForm.min_quantity}
                            onChange={(e) => setProductForm({ ...productForm, min_quantity: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Preço Unitário</Label>
                        <Input
                          type="number"
                          value={productForm.unit_price}
                          onChange={(e) => setProductForm({ ...productForm, unit_price: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Fornecedor</Label>
                        <Select value={productForm.supplier_id} onValueChange={(v) => setProductForm({ ...productForm, supplier_id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateProduct} className="w-full" data-testid="create-product-btn">
                        Criar Produto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku || '-'}</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell>
                        <span className={product.quantity <= product.min_quantity ? 'text-red-600 font-bold' : ''}>
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>R$ {product.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="font-bold">R$ {(product.quantity * product.unit_price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{new Date(mov.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{mov.product_name}</TableCell>
                      <TableCell>
                        {mov.type === 'entrada' ? (
                          <span className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Entrada
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Saída
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{mov.quantity}</TableCell>
                      <TableCell>{mov.employee_name || '-'}</TableCell>
                      <TableCell>{mov.reason || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fornecedores</CardTitle>
              <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="new-supplier-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Fornecedor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Fornecedor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                        data-testid="supplier-name-input"
                      />
                    </div>
                    <div>
                      <Label>Contato</Label>
                      <Input
                        value={supplierForm.contact}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={supplierForm.phone}
                          onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={supplierForm.email}
                          onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Endereço</Label>
                      <Input
                        value={supplierForm.address}
                        onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleCreateSupplier} className="w-full" data-testid="create-supplier-btn">
                      Criar Fornecedor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <Truck className="h-10 w-10 text-blue-600 mr-4" />
                        <div>
                          <h3 className="font-bold text-lg">{supplier.name}</h3>
                          <p className="text-sm text-gray-600">{supplier.contact}</p>
                          <p className="text-sm text-gray-600">{supplier.phone}</p>
                          <p className="text-sm text-gray-600">{supplier.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Funcionários</CardTitle>
              <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="new-employee-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Funcionário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Funcionário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={employeeForm.name}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                        data-testid="employee-name-input"
                      />
                    </div>
                    <div>
                      <Label>Cargo</Label>
                      <Input
                        value={employeeForm.role}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={employeeForm.phone}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Salário</Label>
                      <Input
                        type="number"
                        value={employeeForm.salary}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, salary: parseFloat(e.target.value) })}
                      />
                    </div>
                    <Button onClick={handleCreateEmployee} className="w-full" data-testid="create-employee-btn">
                      Criar Funcionário
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <Users className="h-10 w-10 text-green-600 mr-4" />
                        <div>
                          <h3 className="font-bold text-lg">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                          <p className="text-sm text-gray-600">{employee.phone}</p>
                          {employee.salary && (
                            <p className="text-sm font-semibold text-green-600 mt-2">
                              R$ {employee.salary.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
