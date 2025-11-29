# 🎧 Guia do Sistema de Suporte

## 📋 Visão Geral

Sistema completo de tickets de suporte com comunicação bidirecional entre usuários e admin.

## 🎯 Funcionalidades

### Para Usuários
- ✅ Criar tickets de suporte
- ✅ Visualizar histórico de tickets
- ✅ Enviar mensagens em tickets abertos
- ✅ Acompanhar status (Aberto, Em Andamento, Fechado)
- ✅ Receber respostas do admin

### Para Admin
- ✅ Visualizar todos os tickets
- ✅ Ver estatísticas (Total, Abertos, Em Andamento, Fechados)
- ✅ Responder tickets
- ✅ Alterar status dos tickets
- ✅ Badge de notificação para tickets abertos

## 🚀 Como Usar

### Usuário Normal

**1. Acessar Suporte:**
- Menu lateral → **"Suporte"**

**2. Criar Ticket:**
- Clique em **"Novo Ticket"**
- Preencha:
  - **Assunto:** Título do problema
  - **Mensagem:** Descrição detalhada
- Clique em **"Criar Ticket"**

**3. Acompanhar Ticket:**
- Na lista, clique no ticket para abrir
- Veja todas as mensagens
- Envie novas mensagens se necessário
- Status aparece colorido:
  - 🔵 **Aberto:** Aguardando resposta
  - 🟡 **Em Andamento:** Admin respondeu
  - 🟢 **Fechado:** Resolvido

### Admin

**1. Acessar Painel:**
- Menu lateral → **"Admin"**
- Aba → **"Suporte"**

**2. Visualizar Dashboard:**
- **Total:** Todos os tickets
- **Abertos:** Aguardando primeira resposta
- **Em Andamento:** Com resposta do admin
- **Fechados:** Resolvidos

**3. Responder Ticket:**
- Clique no ticket na lista
- Leia todas as mensagens
- Digite sua resposta no campo "Responder como Admin"
- Clique em **"Enviar Resposta"**
- Status muda automaticamente para "Em Andamento"

**4. Gerenciar Status:**
- No diálogo do ticket, use o dropdown no topo
- Opções:
  - **Aberto:** Novo ticket
  - **Em Andamento:** Admin está trabalhando
  - **Fechado:** Problema resolvido

## 📊 Estrutura de Dados

### SupportTicket
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "user_name": "João Silva",
  "user_email": "joao@email.com",
  "subject": "Problema com pagamento",
  "status": "open",
  "messages": [
    {
      "sender_id": "user-uuid",
      "sender_name": "João Silva",
      "message": "Não consigo finalizar o pagamento",
      "created_at": "2025-11-29T..."
    },
    {
      "sender_id": "admin-uuid",
      "sender_name": "Admin",
      "message": "Olá! Vou verificar...",
      "created_at": "2025-11-29T..."
    }
  ],
  "created_at": "2025-11-29T...",
  "updated_at": "2025-11-29T..."
}
```

## 🔌 Endpoints API

### Usuário (Autenticado)
```bash
# Criar ticket
POST /api/support/tickets
Body: {
  "subject": "Assunto",
  "message": "Mensagem inicial"
}

# Listar meus tickets
GET /api/support/tickets

# Ver ticket específico
GET /api/support/tickets/{ticket_id}

# Adicionar mensagem
POST /api/support/tickets/{ticket_id}/messages
Body: {
  "ticket_id": "...",
  "message": "Nova mensagem"
}
```

### Admin
```bash
# Listar todos tickets
GET /api/admin/support/tickets

# Ver ticket específico
GET /api/admin/support/tickets/{ticket_id}

# Responder ticket
POST /api/admin/support/tickets/{ticket_id}/reply
Body: {
  "ticket_id": "...",
  "message": "Resposta do admin"
}

# Alterar status
PUT /api/admin/support/tickets/{ticket_id}/status?status=closed

# Ver estatísticas
GET /api/admin/support/stats
Response: {
  "total": 10,
  "open": 3,
  "in_progress": 5,
  "closed": 2
}
```

## 🎨 Interface

### Página de Suporte (Usuário)
- **Header:** Título + Botão "Novo Ticket"
- **Lista de Tickets:** Cards clicáveis com:
  - Assunto
  - Status (badge colorido)
  - Data de criação
  - Número de mensagens
- **Diálogo do Ticket:**
  - Todas as mensagens
  - Campo para nova mensagem
  - Botão "Enviar Mensagem"

### Painel Admin (Aba Suporte)
- **Stats Cards:** 4 cards com métricas
- **Lista de Tickets:** 
  - Assunto
  - Usuário (nome + email)
  - Status
  - Data + número de mensagens
- **Diálogo do Ticket:**
  - Dropdown para alterar status
  - Histórico de mensagens (Admin destaca em azul)
  - Campo de resposta
  - Botão "Enviar Resposta"

## 🔔 Notificações

### Badge no Menu (Futuro)
```javascript
// Contar tickets abertos
const openTickets = tickets.filter(t => t.status === 'open').length;
// Mostrar badge vermelho se > 0
```

## 💡 Boas Práticas

### Para Admin:
1. **Responda rapidamente** tickets abertos
2. **Mude para "Em Andamento"** ao começar a trabalhar
3. **Feche** apenas quando problema resolvido
4. **Seja claro e objetivo** nas respostas
5. **Pergunte** se o usuário tem mais dúvidas antes de fechar

### Para Usuários:
1. **Título claro** no assunto
2. **Detalhe** o problema na mensagem
3. **Aguarde resposta** antes de criar novo ticket
4. **Responda perguntas** do admin rapidamente
5. **Confirme** quando problema for resolvido

## 🔐 Segurança

- ✅ Usuários só veem seus próprios tickets
- ✅ Admin vê todos os tickets
- ✅ Autenticação necessária
- ✅ Role-based access control

## 📈 Métricas Úteis

### KPIs de Suporte
- **Tempo médio de primeira resposta**
- **Tempo médio de resolução**
- **Taxa de satisfação** (pode adicionar rating)
- **Tickets por categoria** (pode adicionar categorias)

## 🚀 Melhorias Futuras

1. **Notificações em tempo real** (WebSocket)
2. **Upload de imagens** em mensagens
3. **Categorias de tickets** (Técnico, Pagamento, etc)
4. **Prioridade** (Baixa, Média, Alta, Urgente)
5. **Rating de satisfação** após fechamento
6. **Templates de resposta** para admin
7. **Busca e filtros** avançados
8. **Exportar relatórios** de tickets

## ✅ Checklist de Teste

- [ ] Usuário cria ticket
- [ ] Ticket aparece na lista do usuário
- [ ] Ticket aparece no admin
- [ ] Admin visualiza ticket
- [ ] Admin responde ticket
- [ ] Status muda para "Em Andamento"
- [ ] Usuário vê resposta do admin
- [ ] Usuário envia nova mensagem
- [ ] Admin altera status para "Fechado"
- [ ] Ticket fechado não permite mais mensagens
- [ ] Stats atualizados corretamente

**Sistema de suporte completo e funcional!** 🎉
