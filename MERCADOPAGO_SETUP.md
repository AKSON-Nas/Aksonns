# 💳 Guia de Configuração - Mercado Pago PIX

## 🎯 Objetivo

Configurar pagamentos via PIX com QR Code usando Mercado Pago e aprovação automática.

## 📋 Pré-requisitos

✅ Conta no Mercado Pago (criar em: https://www.mercadopago.com.br/)
✅ Acesso ao Painel Admin do sistema
✅ Email cadastrado como admin (aksonns4@gmail.com)

## 🔧 Passo a Passo

### 1. Criar Aplicação no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Clique em "Criar aplicação"
3. Preencha:
   - **Nome:** Planeja Negócio (ou o nome que preferir)
   - **Descrição:** Sistema de gestão empresarial
   - **Tipo:** Pagamentos
4. Clique em "Criar aplicação"

### 2. Obter Credenciais

1. Na página da aplicação, vá em **"Credenciais"**
2. Escolha o ambiente:
   - **Teste:** Para testar (usa dinheiro falso)
   - **Produção:** Para pagamentos reais
3. Copie o **"Access Token"**
   - Formato: `APP_USR-XXXXXXXXXX-XXXXXX-XXXXXXXXXX`

### 3. Configurar no Sistema

1. Faça login com: **aksonns4@gmail.com**
2. Acesse: **Admin** (menu lateral)
3. Clique na aba: **"Pagamentos"**
4. Cole o **Access Token** no campo
5. **(Opcional)** Configure Webhook URL:
   ```
   https://seu-dominio.com/api/payments/webhook
   ```
6. Clique em **"Salvar Configuração"**

### 4. Configurar Webhook (Aprovação Automática)

Para que o sistema atualize automaticamente quando o usuário pagar:

1. No Mercado Pago, vá em: **Aplicações → Sua App → Webhooks**
2. Clique em "Configurar Webhook"
3. URL do Webhook:
   ```
   https://seu-dominio.com/api/payments/webhook
   ```
4. Eventos para receber:
   - ✅ **Pagamentos**
   - ✅ **Transações PIX**
5. Salve

## 🚀 Fluxo de Pagamento

### Para o Usuário:

1. Usuário clica em **"Upgrade Premium"** (ou botão similar)
2. Vai para página `/payment`
3. Seleciona o plano desejado
4. Clica em **"Gerar QR Code PIX"**
5. QR Code é exibido + código copia e cola
6. Usuário abre app do banco e paga
7. **Sistema atualiza automaticamente** (via webhook)
8. Plano do usuário é ativado! 🎉

### Para o Admin:

1. Acesse **Admin → aba Pagamentos**
2. Veja todos os pagamentos em tempo real
3. Status:
   - ⏱️ **Pendente:** Aguardando pagamento
   - ✅ **Aprovado:** Pago e plano ativado
   - ❌ **Rejeitado:** Pagamento falhou

## 🧪 Testando o Sistema

### Ambiente de Testes (Sandbox)

1. Use credenciais de **TESTE**
2. Cartões de teste do Mercado Pago:
   ```
   CPF: 123.456.789-00
   PIX: Qualquer chave PIX de teste
   ```

3. Simule pagamento aprovado:
   - Gere QR Code
   - Use ferramentas de teste do MP
   - Ou chame o webhook manualmente

### Testar Webhook Manualmente

```bash
curl -X POST https://seu-dominio.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "1234567890"
    }
  }'
```

## 📊 Endpoints Disponíveis

### Usuário (Autenticado)
```bash
# Criar pagamento PIX
POST /api/payments/create-pix
Body: {"plan_name": "premium"}

# Ver meus pagamentos
GET /api/payments/my-payments
```

### Admin
```bash
# Salvar config MP
POST /api/admin/payment-config
Body: {"mercadopago_access_token": "APP_USR-...", "webhook_url": "..."}

# Ver config
GET /api/admin/payment-config

# Ver todos pagamentos
GET /api/admin/payments
```

### Webhook (Mercado Pago)
```bash
POST /api/payments/webhook
```

## 🔒 Segurança

✅ Access Token nunca é exposto ao frontend
✅ Apenas admin pode configurar
✅ Webhook valida assinatura do MP
✅ Pagamentos são registrados no banco
✅ Logs de todas as transações

## ⚙️ Estrutura do Banco de Dados

### Coleção: `payment_config`
```json
{
  "id": "uuid",
  "mercadopago_access_token": "APP_USR-...",
  "webhook_url": "https://...",
  "created_at": "2025-11-29T..."
}
```

### Coleção: `payments`
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "plan_name": "premium",
  "amount": 49.90,
  "status": "approved",
  "mercadopago_payment_id": "12345",
  "qr_code": "00020101021...",
  "qr_code_base64": "iVBORw0KGgo...",
  "created_at": "2025-11-29T..."
}
```

## 🐛 Troubleshooting

### QR Code não é gerado
- ✅ Verifique se Access Token está correto
- ✅ Confirme que está usando credenciais de PRODUÇÃO
- ✅ Veja logs do backend: `tail -f /var/log/supervisor/backend.err.log`

### Pagamento não atualiza automaticamente
- ✅ Verifique se Webhook está configurado
- ✅ Confirme que URL do webhook está acessível
- ✅ Teste o webhook manualmente
- ✅ Veja logs: procure por "Webhook received"

### Erro 400: "Payment not configured"
- ✅ Admin precisa configurar no painel primeiro
- ✅ Access Token deve estar salvo

## 📞 Suporte Mercado Pago

- Documentação: https://www.mercadopago.com.br/developers/pt/docs
- Suporte: https://www.mercadopago.com.br/developers/pt/support
- Status: https://status.mercadopago.com/

## ✅ Checklist de Implementação

- [ ] Conta criada no Mercado Pago
- [ ] Aplicação criada
- [ ] Access Token copiado
- [ ] Token salvo no Admin → Pagamentos
- [ ] Webhook configurado (opcional mas recomendado)
- [ ] Teste realizado com credenciais de teste
- [ ] Teste realizado com pagamento real
- [ ] Sistema aprovando pagamentos automaticamente

**Pronto para receber pagamentos! 🚀💰**
