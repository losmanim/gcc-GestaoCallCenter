# Roteiro de Demonstração ao Vivo
## Duração: 25-30 minutos

---

## Setup (fazer antes do cliente chegar)

```
1. Abrir no browser:
   ─ index.html          (site propaganda)
   ─ vendas.html         (toolkit de vendas)
   ─ gestao/dashboard.html  (sistema de gestão)

2. Fazer login em gestao/dashboard.html
   → admin@gcc.pt / admin123

3. Abrir o telemóvel com o link de aprovação
   (ou ter o apravacao.html aberto noutro separador)
```

---

## Parte 1 — O Site de Propaganda (3 min)

**Objetivo:** Mostrar como o cliente chega até nós.

> *Abre o `index.html`*

"Este é o site público. Qualquer cliente interessado em serviços NOS, MEO ou Vodafone chega aqui."

**Pontos a destacar:**
- [ ] Design profissional, moderno, responsivo
- [ ] Operadoras parceiras com preços reais
- [ ] Formulário de registo simples (nome, email, telefone, operadora)

**Acção:** Rolar até ao formulário.
> "O cliente preenche, clica em enviar, e o lead aparece automaticamente no nosso sistema de gestão."

**Prova:** Mostrar o `localStorage` ou abrir o dashboard com o badge.

---

## Parte 2 — O Sistema de Gestão — Dashboard (5 min)

**Objetivo:** Mostrar a visão geral do negócio.

> *Abre o `gestao/dashboard.html` (já logado)*

**Acção:** Apontar para os 5 KPIs no topo.

| KPI | O que mostra |
|-----|-------------|
| Total Clientes | Quantos clientes tens na base |
| Contratos Ativos | Quantos estão a facturar |
| Receita Mensal | Quanto entra por mês |
| Pendentes Aprovação | Contratos à espera do cliente |
| Novos Leads | Geração nova (badge vermelho na sidebar) |

**Frase de impacto:**
> "Num golpe de vista, o gestor sabe exatamente como está o negócio. Sem Excel, sem reuniões."

**Acção:** Mostrar os gráficos de barras.
- Clientes por Operadora → "Vês qual operadora vende mais."
- Serviços Ativos → "Vês qual pacote é o mais popular."

**Prova:** Apontar para "Últimos Clientes Registados".
> "Dados reais, actualizados automaticamente."

---

## Parte 3 — Clientes (5 min)

**Objetivo:** Mostrar o CRM.

> *Clica em "Clientes" na sidebar*

**Acção:** Mostrar a tabela.
- [ ] Nome, Email, NIF, Telefone, Operadora, IBAN, CVP, Estado
- [ ] Pesquisar por nome
- [ ] Filtrar por operadora

**Frase de impacto:**
> "IBAN e CVP são obrigatórios nas telecomunicações. O GCC já os tem como campos nativos. Um CRM genérico não faz isto."

**Acção:** Clicar "Editar" num cliente.
> "Todos os dados do cliente num só sítio."

**Acção:** Clicar "Eliminar" (cancelar).
> "Gestão completa. Tudo em segundos."

---

## Parte 4 — Serviços (3 min)

**Objetivo:** Mostrar o catálogo de produtos.

> *Clica em "Serviços"*

**Acção:** Mostrar os cards visuais.
- [ ] Nome + Operadora + Preço
- [ ] Velocidade, Canais, Telemóveis
- [ ] Filtrar por operadora

**Frase de impacto:**
> "Quando a NOS lança um novo pacote, adicionas aqui em 30 segundos. Toda a equipa passa a ter o preço correcto."

---

## Parte 5 — Contratos + Aprovação (7 min)

**Objetivo:** Mostrar o workflow mais importante do sistema.

> *Clica em "Contratos"*

**Acção:** Mostrar a lista de contratos com estados.
- [ ] Cliente, Serviço, Operadora, Valor, Datas, Estado
- [ ] Filtrar por estado

**Acção:** Criar um novo contrato:
1. Clicar "+ Novo Contrato"
2. Selecionar cliente "Ana Silva"
3. Selecionar serviço "4P 1Gbps NOS"
4. Definir datas e valor (ex: 56.99€)
5. Estado: Pendente
6. Clicar "Guardar"

> *Volta à lista. O contrato aparece como "Pendente".*

**Acção:** Clicar "Enviar" (botão com ícone de email).

> *Aparece o preview do email.*

**Frase de impacto:**
> "O cliente recebe um email com um link. Abre no telemóvel, vê os detalhes do contrato, e aprova ou rejeita em segundos."

**Acção:** Se possível, abrir o link de aprovação num separador ou telemóvel.
> *Mostra a página de aprovação com os dados do contrato.*

**Acção:** Clicar "Aprovar".

> *Volta ao dashboard. O contrato passa a "Ativo". Automaticamente.*

**Prova:**
> "Sem papéis, sem scanned docs, sem demoras. O cliente aprova do telemóvel enquanto está no café."

---

## Parte 6 — Relatórios + Exportação (3 min)

**Objetivo:** Mostrar que o sistema serve para análise de negócio.

> *Clica em "Relatórios"*

**Acção:** Mostrar "Top Clientes".
> "Sabes quem são os teus melhores clientes. Quanto pagam. Quantos contratos têm."

**Acção:** Mostrar "Receita por Operadora".
> "Sabes qual operadora está a gerar mais receita."

**Acção:** Clicar "Exportar Clientes" (ou Contratos).
> "CSV compatível com Excel. Para faturação, contabilidade, ou o que precisares."

---

## Parte 7 — Leads (2 min)

**Objetivo:** Fechar o ciclo (site → lead → cliente → contrato).

> *Clica em "Leads". Se houver badge vermelho, melhor.*

**Acção:** Mostrar a tabela de leads.
- [ ] Data, Nome, Email, Telefone, Operadora, Mensagem
- [ ] Estado (lido/não lido)

**Acção:** Clicar "Marcar lido".
> "O gestor vê que há um lead novo, marca como lido para não se perder."

**Acção:** Clicar "Cliente" (converter).
> *O lead é automaticamente adicionado aos Clientes com os dados todos.*

**Frase de impacto:**
> "Site → Lead → Cliente → Contrato → Aprovação. O ciclo completo. Tudo integrado."

---

## Encerramento (2 min)

**Resumo dos 3 maiores benefícios:**

| # | Benefício | Prova |
|---|-----------|-------|
| 1 | **+129% conversão** | Script padronizado + objeções mapeadas |
| 2 | **-69% tempo de fecho** | Aprovação digital por email |
| 3 | **Zero perda de leads** | Badge de notificação + CRM integrado |

**Frase final:**
> "O GCC não é só um software. É um método comprovado de vendas para telecomunicações. Os vossos gestores vão vender mais, os vossos clientes vão aprovar mais rápido, e a vossa equipa vai ter dados para tomar decisões."

**Call to Action:**
- Oferecer teste grátis de 7 dias
- Agendar follow-up
- Deixar contacto

---

## Troubleshooting durante a demo

| Problema | Solução |
|----------|---------|
| Dados desapareceram | O localStorage pode ter sido limpo. Recarregar a página para re-seed. |
| Link de aprovação não abre | Copiar o link manualmente. Verificar que o token está correto. |
| Botão "Enviar" não aparece | O contrato precisa de estar com estado "Pendente". |
| Leads não aparecem | Precisam de ser registados no site `index.html` primeiro. |
