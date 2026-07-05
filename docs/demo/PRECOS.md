# Guia de Preços — GCC

## Como cobrar um valor justo para ambos os lados

---

## 1. A realidade do call center (o lado do cliente)

Antes de definir preço, tens de perceber quanto o cliente **ganha** com o GCC:

**Exemplo realista (call center com 10 gestores):**

| Métrica | Sem GCC | Com GCC | Diferença |
|---------|---------|---------|-----------|
| Chamadas/dia/gestor | 40 | 60 | +20 |
| Chamadas/mês (22d) | 8.800 | 13.200 | +4.400 |
| Taxa de conversão | 2.5% | 4.5% | +2pp |
| Vendas/mês | 220 | 594 | **+374** |
| Ticket médio mensal | 45€ | 45€ | — |
| Receita mensal | 9.900€ | 26.730€ | **+16.830€** |
| Custo comissionamento (20%) | 1.980€ | 5.346€ | +3.366€ |

**Conclusão:** O call center ganha **+16.830€/mês** de receita extra com o GCC.
Se pagarem 99€/mês (10 × 9,90€), o ROI é de **170×**.

> É este número que vais mostrar. Não o preço. O preço é irrelevante quando o retorno é óbvio.

---

## 2. Modelos de preço possíveis

### A) Por gestor/mês (SaaS puro) — RECOMENDADO

| Plano | Preço | Ideal para |
|-------|-------|------------|
| **Start** | Grátis | Até 3 gestores. Toolkit apenas, sem CRM. |
| **Pro** | **9,90€/gestor/mês** | 3-20 gestores. Tudo incluído. |
| **Enterprise** | **7,90€/gestor/mês** | +20 gestores. Desconto volume. |

**Porquê este modelo:**
- Previsível para o cliente (sabe quanto paga)
- Escala contigo (mais gestores = mais receita)
- Justo: quem usa mais, paga mais
- Fácil de explicar: "9,90€ por gestor — menos de 0,33€ por dia"

### B) Preço fixo mensal

| Nº gestores | Preço fixo | Equivalente por gestor |
|-------------|-----------|----------------------|
| Até 5 | 39€/mês | 7,80€ |
| 6-15 | 79€/mês | 5,27-13,17€ |
| 16-30 | 149€/mês | 4,97-9,31€ |
| 31-50 | 249€/mês | 4,98-8,03€ |

**Vantagem:** Receita previsível. **Desvantagem:** Clientes pequenos acham caro, clientes grandes acham barato.

### C) Por lead gerado

- **2-5€ por lead** captado pelo site
- O call center só paga quando recebe leads

**Vantagem:** Risco zero para o cliente. **Desvantagem:** Dificil de escalar, receita imprevisível para ti.

### D) One-time setup + mensalidade reduzida

- Setup inicial: 149-299€ (configuração, formação, personalização)
- Mensalidade reduzida: 4,90€/gestor

**Vantagem:** Cobre o custo de onboarding. **Desvantagem:** Barreira de entrada.

### E) Parceria / Comissão sobre vendas

- 2-5% da comissão que o call center recebe das operadoras
- Ou 0,50-1€ por venda fechada

**Vantagem:** Alinha totalmente os interesses. **Desvantagem:** Precisas de confiança total e acesso aos dados deles.

---

## 3. Tabela comparativa

| Modelo | Preço para 10 gestores | Receita tua/mês | Risco cliente | Facilidade vender |
|--------|----------------------|----------------|---------------|-------------------|
| Por gestor (9,90€) | 99€ | 99€ | Baixo | Fácil |
| Fixo (79€) | 79€ | 79€ | Baixo | Fácil |
| Por lead (3€) | ~180 leads = 540€ | 540€ | Mínimo | Muito fácil |
| Setup + mensalidade | 299€ + 49€ | 49€ + setup | Médio | Médio |
| Comissão (3%) | ~160€ (com base 5.346€) | 160€ | Mínimo | Difícil (exige integração) |

---

## 4. Como justificar 9,90€/gestor/mês

**O argumento de venda:**

> "Sr. Cliente, 9,90€ por gestor por mês. Sabia que cada gestor seu vai fazer **mais 20 chamadas por dia** com o GCC? São **+440 chamadas/mês/gestor**."

> "Com a taxa de conversão do GCC de 4,5%, são **+20 vendas/mês/gestor**. A **comissão só dessas vendas extra paga o sistema 10×**."

> "E isto sem contar com a redução de cancelamentos, leads que não se perdem, e contratos aprovados em minutos em vez de dias."

**Objeção: "É caro para 20 gestores (198€/mês)"**

> "198€/mês. Quantas vendas extra precisam para pagar isso? Com o ticket médio de 45€, são **5 vendas**. Os vossos 20 gestores fazem 5 vendas extra num dia. **O sistema paga-se num dia.** "

---

## 5. E se o cliente disser que não tem dinheiro?

**Opção 1 — Teste grátis (7 dias)**
> "Usa 7 dias grátis. No final vês os resultados e decides."

**Opção 2 — Start grátis permanente**
> "Começa com o plano Start — é grátis para até 3 gestores. Quando quiseres mais funcionalidades, fazemos upgrade."

**Opção 3 — Paga só metade no primeiro mês**
> "Primeiro mês por 4,90€/gestor. Se não vires resultados, cancelas."

**Opção 4 — Comissão (sem risco)**
> "Não pagas nada agora. Fico com 3% da comissão extra que o GCC gerar. Se não gerar vendas extra, não pagas."

---

## 6. Quanto deves cobrar (o teu lado)

**Cálculo dos teus custos:**

| Item | Custo/mês (estágio inicial) |
|------|---------------------------|
| Alojamento (Netlify grátis + Supabase grátis) | 0€ |
| Domínio (.pt) | ~0,42€ (5€/ano) |
| Email (EmailJS grátis) | 0€ |
| Teu tempo (suporte, updates) | ~5h/mês |
| **Custo total** | **~0,42€/mês + tempo** |

**Margem:** Com 99€/mês (10 gestores × 9,90€), a margem é de **99,5%** após custos fixos.

**Ponto de equilíbrio:** Precisas de **1 cliente com 3 gestores** (29,70€/mês) para pagar o domínio e internet durante anos.

**Quando deves subir o preço:**
- Quando tiveres 10+ clientes e não conseguires dar suporte
- Quando adicionares funcionalidades pagas (API, integração WhatsApp, relatórios avançados)
- Quando tiveres provas reais de clientes teus (não benchmarks)

---

## 7. Estratégia recomendada (começar)

**Fase 1 — Lançamento (primeiros 5 clientes)**
- Preço promocional: **4,90€/gestor/mês** (metade do preço final)
- Ou: **49€ fixo/mês** independente do nº de gestores
- Objetivo: conseguir casos de sucesso e testemunhos reais

**Fase 2 — Consolidação (5-20 clientes)**
- Preço normal: **9,90€/gestor/mês**
- Planos: Start (grátis), Pro (9,90€), Enterprise (sob consulta)
- Clientes da Fase 1 mantêm o preço antigo (são os teus embaixadores)

**Fase 3 — Escala (+20 clientes)**
- Preço: **12,90€/gestor/mês** (novos clientes)
- Planos anuais com 2 meses grátis (10,75€/mês pagando anual)
- Enterprise com SLA e suporte prioritário

---

## 8. Resumo — o preço justo

| Para o cliente | Para ti |
|---------------|---------|
| Paga 9,90€/gestor/mês | Recebes 9,90€/gestor/mês |
| Ganha +16.830€/mês em receita | Gastas ~0,42€/mês em infraestrutura |
| ROI de 170× | Margem de ~99% |
| Teste grátis de 7 dias | Risco zero (pagamento só após teste) |

> **O preço justo é aquele em que ambos ganham. O cliente ganha 170× o que paga. Tu ganhas um negócio sustentável. Todos saem a ganhar.**

---

## 9. Ferramentas para gerir subscrições

Quando começares a ter clientes a pagar:

| Ferramenta | Preço | Notas |
|-----------|-------|-------|
| **Stripe** | 1,4% + 0,25€/transação | O standard. Integração tranquila. |
| **Paypal** | 1,9% + 0,35€ | Mais conhecido do público geral. |
| **MBNet** | Grátis | Para pagamentos portugueses. |
| **Referência Multibanco** | ~0,50€/pagamento | Preferido em PT para B2B. |

**Recomendação inicial:** Stripe + Referência Multibanco (via Stripe ou entidade própria).

---

## 10. Modelo de contrato simples

Podes usar este esboço para o contracto com o cliente:

```
MENSALIDADE: [VALOR]€/mês ([Nº] gestores × [PREÇO]€)
FORMA DE PAGAMENTO: Referência Multibanco / Transferência
CICLO DE FATURAÇÃO: Mensal, até dia 8 de cada mês
PERÍODO MÍNIMO: 3 meses (ajustável)
AVISO PRÉVIO: 30 dias (qualquer lado)
TESTE: 7 dias grátis sem compromisso
SUPORTE: WhatsApp, resposta em 24h úteis
SLA: 99% uptime (excluindo manutenção programada)
```

---

> **Regra de ouro:** Mostra primeiro o valor que o GCC gera. Depois mostra o preço. Quem vê primeiro o valor, não reclama do preço.
