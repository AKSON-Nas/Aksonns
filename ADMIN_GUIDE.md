# 🛡️ Guia do Sistema de Administração

## Admin Inicial Configurado

✅ **Email do Admin:** aksonns4@gmail.com

Quando você fizer login com este email, será automaticamente criado como **ADMIN**.

## Acessando o Painel Admin

1. Faça login com seu email: aksonns4@gmail.com
2. Você verá um novo item no menu lateral: **"Admin"** (ícone de escudo vermelho)
3. Clique em "Admin" para acessar o painel

## Funcionalidades do Painel Admin

### 📋 Aba "Planos"

**O que você pode fazer:**
- ✅ Criar novos planos personalizados
- ✅ Editar planos existentes (preço, features)
- ✅ Deletar planos (se nenhum usuário estiver usando)
- ✅ Ativar/desativar planos

**Planos Padrão Criados:**
1. **Gratuito** (R$ 0,00)
   - Apenas Guia Financeiro

2. **Premium** (R$ 49,90)
   - Todas as 10 features habilitadas

**Como criar um novo plano:**
1. Clique em "Novo Plano"
2. Preencha:
   - **Nome (ID):** identificador único sem espaços (ex: `basico`, `empresarial`)
   - **Nome de Exibição:** nome amigável (ex: "Básico", "Empresarial")
   - **Preço:** valor mensal em reais
3. Ative/desative as features desejadas
4. Clique em "Criar Plano"

**Features Disponíveis:**
- 📚 Guia Financeiro
- 📄 Orçamentos
- 📦 Controle de Estoque
- 📈 Gestão de Vendas
- 👥 Cadastro de Clientes
- 📦 Cadastro de Produtos
- 🚚 Cadastro de Fornecedores
- 👷 Cadastro de Funcionários
- 📊 Analytics Avançado
- 📥 Exportação PDF

### 👥 Aba "Usuários"

**O que você pode fazer:**
- ✅ Visualizar todos os usuários cadastrados
- ✅ Ver plano atual de cada usuário
- ✅ Alterar plano de qualquer usuário
- ✅ Ver role (admin/user)
- ✅ Ver data de cadastro

**Como alterar plano de um usuário:**
1. Na aba "Usuários", localize o usuário
2. No dropdown "Ações", selecione o novo plano
3. A alteração é instantânea!

## API Endpoints (para integração)

### Endpoints Públicos
```bash
# Listar planos ativos
GET /api/plans/public

# Ver features do meu plano
GET /api/plans/my-features
```

### Endpoints Admin (requer role=admin)
```bash
# Gerenciar Planos
POST   /api/admin/plans           # Criar plano
GET    /api/admin/plans           # Listar todos
PUT    /api/admin/plans/{id}      # Atualizar
DELETE /api/admin/plans/{id}      # Deletar

# Gerenciar Usuários
GET /api/admin/users              # Listar todos
PUT /api/admin/users/{id}/plan    # Alterar plano
```

## Estrutura de um Plano

```json
{
  "name": "premium",
  "display_name": "Premium",
  "price": 49.90,
  "features": [
    {"name": "guide", "enabled": true},
    {"name": "budgets", "enabled": true},
    {"name": "stock", "enabled": true},
    // ...
  ],
  "is_active": true
}
```

## Exemplos de Uso

### Criar Plano "Básico"
```json
{
  "name": "basico",
  "display_name": "Básico",
  "price": 29.90,
  "features": [
    {"name": "guide", "enabled": true},
    {"name": "budgets", "enabled": true},
    {"name": "clients", "enabled": true},
    {"name": "pdf_export", "enabled": true}
  ]
}
```

### Criar Plano "Empresarial"
```json
{
  "name": "empresarial",
  "display_name": "Empresarial",
  "price": 99.90,
  "features": [
    // Todas as features enabled: true
  ]
}
```

## Controle de Acesso

### Sistema de Roles
- **Admin:** Acesso completo ao painel admin
- **User:** Acesso limitado conforme seu plano

### Sistema de Features
Cada plano define quais features estão habilitadas. O backend valida automaticamente o acesso.

## Logs

Todas as ações admin são registradas:
```
2025-11-29 17:45:23 - server - INFO - ⭐ ADMIN USER CREATED: aksonns4@gmail.com
2025-11-29 17:50:15 - server - INFO - Plan created by admin aksonns4@gmail.com: empresarial
2025-11-29 17:52:30 - server - INFO - Admin aksonns4@gmail.com changed user abc123 to plan premium
```

## Segurança

✅ Apenas email aksonns4@gmail.com pode ser admin
✅ Todos os endpoints admin verificam role
✅ Não é possível deletar planos em uso
✅ Sessões expiram após 7 dias

## Próximos Passos

1. Faça login com aksonns4@gmail.com
2. Acesse o painel admin
3. Crie planos personalizados conforme sua necessidade
4. Gerencie usuários e seus planos

**Pronto para usar!** 🚀
