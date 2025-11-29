# 🔧 Solução: Erro "Unauthorized use of live credentials"

## ❌ O Problema

Sua conta do Mercado Pago ainda não está homologada para usar credenciais de PRODUÇÃO.

## ✅ Solução Imediata: Usar Credenciais de TESTE

### Passo 1: Obter Credenciais de Teste

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em "Credenciais"
4. Escolha modo: **TESTE** (não Produção)
5. Copie o **Access Token de Teste**
   - Formato: `TEST-XXXXXXXX-XXXXXX-XXXXXXXX`

### Passo 2: Configurar no Sistema

1. Admin → Pagamentos
2. Cole o **Access Token de TESTE**
3. Salve

### Passo 3: Testar

1. Usuário → Pagamento
2. Gerar QR Code
3. **Agora vai funcionar!** ✅

## 💰 Como Simular Pagamento (Modo Teste)

No modo teste, você pode simular pagamentos:

1. Gere o QR Code
2. Use cartões de teste do Mercado Pago
3. Ou use a API de testes para aprovar manualmente

## 🚀 Para Usar em PRODUÇÃO (Pagamentos Reais)

Sua conta precisa ser homologada:

### Requisitos Mercado Pago:

1. **Conta Verificada:**
   - CPF/CNPJ validado
   - Dados bancários cadastrados
   - Email verificado

2. **Completar Formulário de Homologação:**
   - Acesse: Painel → Sua App → "Homologar"
   - Preencha informações sobre seu negócio
   - Aguarde aprovação (1-3 dias úteis)

3. **Certificação PIX:**
   - Para PIX, pode precisar de certificação adicional
   - Mercado Pago irá te guiar no processo

### Depois de Homologado:

1. Use credenciais de **PRODUÇÃO** (APP_USR-...)
2. Configure no Admin → Pagamentos
3. Pagamentos reais funcionarão! 💰

## 📊 Comparação

| Característica | TESTE | PRODUÇÃO |
|---------------|-------|----------|
| Token | TEST-... | APP_USR-... |
| Dinheiro Real | ❌ Não | ✅ Sim |
| QR Code | ✅ Funciona | ✅ Funciona |
| Pagamentos | Simulados | Reais |
| Homologação | ❌ Não precisa | ✅ Necessária |

## 🎯 Recomendação

**Para desenvolvimento/testes:**
→ Use credenciais de TESTE

**Para receber pagamentos reais:**
→ Complete homologação e use PRODUÇÃO

