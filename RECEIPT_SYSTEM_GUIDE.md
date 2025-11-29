# 🧾 Guia do Sistema de Comprovantes de Venda

## 📋 Visão Geral

Sistema completo de geração de comprovantes de venda em PDF com garantia de 90 dias, logo personalizável e campo para assinatura do cliente.

## ✨ Características do Comprovante

### Cabeçalho
- ✅ Logo da empresa (se configurada)
- ✅ Título "COMPROVANTE DE VENDA"
- ✅ Número do comprovante
- ✅ Dados da empresa (nome, endereço, telefone, email)

### Dados da Venda
- ✅ Data e hora da venda
- ✅ Nome do cliente
- ✅ Forma de pagamento
- ✅ Número de identificação

### Itens Vendidos
- ✅ Tabela formatada com:
  - Descrição do produto/serviço
  - Quantidade
  - Preço unitário
  - Total por item
- ✅ Valor total destacado

### Termos de Garantia
- ✅ **Garantia de 90 dias** a partir da data de compra
- ✅ Data de validade da garantia
- ✅ Condições da garantia:
  - Cobre defeitos de fabricação
  - Não cobre mau uso
  - Requer apresentação do comprovante
  - Reparo ou substituição a critério da empresa
- ✅ Observações importantes

### Campo de Assinatura
- ✅ Linha para assinatura do cliente
- ✅ Campo para data
- ✅ Formatação profissional

### Rodapé
- ✅ Informações da empresa
- ✅ Aviso de documento eletrônico

## 🚀 Como Usar

### 1. Configurar Logo da Empresa (Opcional)

**Passo 1 - Fazer Upload do Logo:**
1. Acesse: **Orçamentos** (mesmo menu)
2. Clique em "Editar/Cadastrar Empresa"
3. Faça upload da logo
4. Salve

**O logo será usado em:**
- Orçamentos
- Comprovantes de venda
- Outros documentos

### 2. Gerar Comprovante

**Após Registrar uma Venda:**
1. Vá para: **Vendas**
2. Na lista de vendas, localize a venda
3. Clique no botão **"Comprovante"** (ícone de impressora)
4. PDF será baixado automaticamente
5. Imprima ou envie para o cliente

### 3. Entregar ao Cliente

**O que o cliente recebe:**
- Comprovante impresso
- Dados completos da compra
- Informações de garantia
- Local para assinar

**Cliente deve:**
1. Ler o comprovante
2. Assinar no campo indicado
3. Datar a assinatura
4. Guardar em local seguro por 90 dias (ou mais)

## 📄 Estrutura do PDF

### Página 1 (Única)
```
┌────────────────────────────────────┐
│         [LOGO DA EMPRESA]          │
│                                    │
│    COMPROVANTE DE VENDA            │
│    Nº XXXXXXXX                     │
│                                    │
│    [Dados da Empresa]              │
│    Nome, Endereço, Contato         │
├────────────────────────────────────┤
│ Data: DD/MM/YYYY às HH:MM          │
│ Cliente: Nome do Cliente           │
│ Pagamento: Forma de Pagamento      │
├────────────────────────────────────┤
│ ITENS VENDIDOS                     │
│                                    │
│ ┌───────────────────────────────┐  │
│ │Desc │ Qtd │ Preço │ Total    │  │
│ ├─────────────────────────────┤  │
│ │Item │  1  │ 100.00│ 100.00  │  │
│ └───────────────────────────────┘  │
│                                    │
│            VALOR TOTAL: R$ 100.00  │
├────────────────────────────────────┤
│ TERMOS DE GARANTIA                 │
│                                    │
│ Garantia: 90 dias                  │
│ Válida até: DD/MM/YYYY             │
│                                    │
│ Condições:                         │
│ • Cobre defeitos de fabricação     │
│ • Não cobre mau uso                │
│ • Apresente este comprovante       │
│ • Reparos ou substituição          │
│                                    │
│ Observações:                       │
│ • Guarde este documento            │
│ • Válido como nota de venda        │
├────────────────────────────────────┤
│ ASSINATURA DO CLIENTE              │
│                                    │
│ _________________________________  │
│ Assinatura do Cliente              │
│                                    │
│ Data: ___/___/______               │
├────────────────────────────────────┤
│ [Rodapé com dados da empresa]     │
└────────────────────────────────────┘
```

## 🎨 Personalização

### Logo da Empresa
**Formato suportado:**
- PNG, JPG, JPEG
- Tamanho recomendado: 300x300px
- Fundo transparente (recomendado)

**Como alterar:**
1. Orçamentos → Empresa
2. Upload nova logo
3. Todos documentos serão atualizados

### Dados da Empresa
**Editáveis:**
- Nome da empresa
- Endereço
- Telefone
- Email

**Como alterar:**
1. Orçamentos → Empresa
2. Edite os campos
3. Salve

### Termos de Garantia
**Atualmente fixo em:**
- 90 dias a partir da compra
- Condições padrão

**Para personalizar:**
- Editar arquivo: `/app/backend/server.py`
- Procurar: `warranty_text`
- Modificar termos conforme necessário

## 💼 Casos de Uso

### 1. Venda em Loja Física
```
Cliente compra → Registra venda → 
Gera comprovante → Imprime → 
Cliente assina → Entrega cópia ao cliente
```

### 2. Venda com Entrega
```
Registra venda → Gera comprovante → 
Entregador leva impresso → 
Cliente assina na entrega → 
Entregador traz assinado de volta
```

### 3. Venda Online (Digital)
```
Registra venda → Gera PDF → 
Envia por email ao cliente → 
Cliente imprime e guarda
```

## 🔒 Validade Legal

### O Comprovante Serve Como:
- ✅ Prova de compra
- ✅ Documento para garantia
- ✅ Recibo de pagamento
- ✅ Nota fiscal simplificada*

*Consulte contador para saber se precisa emitir nota fiscal oficial

### Recomendações Legais:
1. **Guarde cópia:** Empresa também deve guardar
2. **Numeração sequencial:** Cada venda tem ID único
3. **Data e hora:** Registradas automaticamente
4. **Assinatura:** Comprova ciência do cliente

## 📊 Relatórios

### Comprovantes Gerados
Para saber quantos comprovantes foram gerados:
1. Acesse: Vendas
2. Conta o número de vendas
3. Cada venda pode gerar 1 comprovante

### Rastreamento
- ID da venda: Primeiros 8 caracteres no título
- Data e hora: Na venda e no comprovante
- Cliente: Nome registrado

## 🐛 Solução de Problemas

### Comprovante não gera
**Possíveis causas:**
1. ❌ Plano Free (apenas Premium)
2. ❌ Venda não existe
3. ❌ Erro no servidor

**Solução:**
1. Verifique se é Premium
2. Confirme ID da venda
3. Veja logs do backend

### Logo não aparece
**Possíveis causas:**
1. ❌ Logo não foi configurada
2. ❌ Formato inválido
3. ❌ Arquivo corrompido

**Solução:**
1. Orçamentos → Empresa
2. Faça novo upload
3. Formatos: PNG, JPG

### PDF em branco
**Solução:**
1. Tente novamente
2. Verifique conexão
3. Veja console (F12)

## 📈 Estatísticas de Uso

### KPIs Úteis
- Comprovantes gerados por dia
- Taxa de assinatura (se rastreado)
- Garantias acionadas
- Clientes que retornam

## 🚀 Melhorias Futuras

1. **Templates personalizáveis**
   - Escolher cores
   - Fontes diferentes
   - Layouts variados

2. **Garantia flexível**
   - 30, 60, 90, 180 dias
   - Por categoria de produto
   - Garantia estendida

3. **QR Code**
   - No comprovante
   - Link para verificação online
   - Rastreamento de autenticidade

4. **Email automático**
   - Enviar comprovante por email
   - Após registrar venda
   - Com link para download

5. **Assinatura digital**
   - Cliente assina no tablet
   - Integra com comprovante
   - Totalmente digital

## ✅ Checklist

**Antes de usar:**
- [ ] Logo da empresa configurada (opcional)
- [ ] Dados da empresa preenchidos
- [ ] Plano Premium ativo
- [ ] Teste com venda real
- [ ] Imprima e revise qualidade

**Para cada venda:**
- [ ] Registre venda corretamente
- [ ] Gere comprovante
- [ ] Imprima ou envie PDF
- [ ] Cliente assina
- [ ] Guarde cópia

**Manutenção:**
- [ ] Revise termos de garantia mensalmente
- [ ] Atualize dados da empresa se mudar
- [ ] Mantenha logo atualizada

**Sistema completo de comprovantes profissionais!** 🧾✨
