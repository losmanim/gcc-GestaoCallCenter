# Roadmap para Produção — MVP do GCC

## Como levar o Gestão Call Center do zero à produção real

---

## O que é um MVP?

**MVP** (Minimum Viable Product) = a versão mais simples do teu produto que já resolve o problema do cliente e gera valor real.

> Não precisas de tudo perfeito. Precisas de algo que funcione, que o gestor use, e que lhe traga resultados.

---

## Fase 0: Pré-produção (Agora — tudo local)

### O que já tens
✅ Landing page com formulário de leads
✅ Ferramenta de vendas completa (script, objeções, KPI)
✅ Login (simulado)
✅ Dashboard com 5 KPIs
✅ CRUD Clientes, Serviços, Contratos
✅ Fluxo de aprovação (simulado)
✅ Leads com badge
✅ Relatórios
✅ Export CSV

### O que deves fazer antes de publicar
- [ ] Rever IBAN/CVP nos clientes (dados sensíveis — ofuscar na tabela)
- [ ] Testar todos os CRUD em sequência (criar cliente → serviço → contrato → aprovar)
- [ ] Confirmar que o formulário de leads guarda corretamente
- [ ] Fazer backup dos dados de teste (exportar CSV de clientes, serviços, contratos)

---

## Fase 1: MVP Grátis (Dia 1-3 · 0€/mês)

### Objetivo
Pôr o sistema online com dados partilhados e email real, sem gastar dinheiro.

### O que fazer

#### Dia 1 — Publicar o site
```bash
# 1. Criar conta Netlify (5 min)
# 2. Arrastar pasta do projeto (2 min)
# 3. Site online em https://gcc-app.netlify.app
```
✅ Landing page pública
✅ Formulário de leads a funcionar
✅ Link "Área do Gestor" acessível

#### Dia 2 — Backend partilhado (Appwrite)
```bash
# 1. Criar conta Appwrite Cloud (5 min)
# 2. Criar base de dados e coleções (30 min)
# 3. Ligar app.js ao Appwrite (2-3h)
```
✅ Dados na cloud (qualquer gestor vê os mesmos dados)
✅ Login seguro (Appwrite Auth)
✅ Leads do site aparecem no dashboard

#### Dia 3 — Email real (EmailJS)
```bash
# 1. Criar conta EmailJS (5 min)
# 2. Ligar Gmail/Outlook como serviço (10 min)
# 3. Substituir preview por envio real (1h)
```
✅ Cliente recebe email com link de aprovação
✅ Gestor recebe notificação quando cliente aprova

### Resultado da Fase 1
```
🚀 Sistema online e funcional
👥 Qualquer gestor pode aceder
📧 Emails reais para clientes
💰 Custo: 0€/mês
```

---

## Fase 2: Profissional (Semana 2-4 · ~5€/mês)

### Objetivo
Adicionar funcionalidades que aumentam a produtividade do gestor.

### O que fazer

#### Semana 2 — CRM melhorado
- [ ] **Histórico do cliente** — registar chamadas, notas, eventos
- [ ] **Pesquisa global** (Ctrl+K) — encontrar clientes em segundos
- [ ] **Notificações de renovação** — alertar contratos a vencer
- [ ] **Validação de NIF, IBAN, CVP** — evitar erros nos contratos

#### Semana 3 — Produtividade
- [ ] **Tarefas / Follow-ups** — o gestor organiza o dia
- [ ] **Gráficos no dashboard** (Chart.js) — métricas visuais
- [ ] **Comissões automáticas** — calcula quanto o gestor ganhou
- [ ] **Export PDF** — contratos profissionais para imprimir

#### Semana 4 — Qualidade
- [ ] **Dark mode no dashboard**
- [ ] **Sidebar colapsável** (mobile-friendly)
- [ ] **Ordenação de colunas** nas tabelas
- [ ] **Loading states** em todas as operações

### Resultado da Fase 2
```
📊 Gestor toma decisões baseado em dados
📋 Nunca mais esquece follow-ups
📄 Contratos profissionais para clientes
💰 Custo: ~5€/mês (domínio + opcionais)
```

---

## Fase 3: Crescimento (Mês 2 · ~10-25€/mês)

### Objetivo
Preparar o sistema para escalar com mais gestores e clientes.

### O que fazer

#### Semana 5-6 — Multi-gestor
- [ ] **Perfis de acesso**: Admin vê tudo, Gestor vê só os seus clientes
- [ ] **Dashboard do admin**: visão global da equipa
- [ ] **Relatório de desempenho** por gestor (vendas, contratos, chamadas)
- [ ] **Audit log**: quem fez o quê e quando

#### Semana 7-8 — Cliente
- [ ] **Portal do cliente**: cliente faz login e vê os seus contratos
- [ ] **Notificações WhatsApp** (opcional, via API)
- [ ] **Faturação**: gerar faturas simples para o cliente
- [ ] **Lembretes de pagamento**: enviar email automático a clientes com pagamento pendente

### Resultado da Fase 3
```
👥 Equipa a trabalhar em simultâneo
🏢 Clientes com acesso ao próprio portal
📈 Admin com visão global do negócio
💰 Custo: ~10-25€/mês (Appwrite Pro + EmailJS pago)
```

---

## Fase 4: Escala (Mês 3+ · 25-100€/mês)

### Objetivo
Sistema robusto para call centers com 10+ gestores e centenas de clientes.

### O que fazer
- [ ] **Backend próprio** (Node.js ou PHP) em VPS (DigitalOcean, ~6€/mês)
- [ ] **Base de dados PostgreSQL** dedicada (performance)
- [ ] **Webhooks**: integração com sistemas externos (faturação, ERP)
- [ ] **API pública** para terceiros
- [ ] **SLA 99.9%** (garantia de disponibilidade)
- [ ] **Suporte prioritário** para clientes Enterprise

### Resultado da Fase 4
```
🏢 Call center totalmente digital
🔗 Integrado com outros sistemas
📈 Crescimento sem limites técnicos
💰 Custo: ~25-100€/mês (consoante escala)
```

---

## Roadmap visual

```
FASE 0         FASE 1             FASE 2              FASE 3              FASE 4
AGORA           DIA 1-3           SEMANA 2-4          MÊS 2               MÊS 3+
┌─────────┐    ┌────────────┐    ┌────────────┐     ┌────────────┐      ┌────────────┐
│ LOCAL   │ →  │ MVP GRÁTIS │ →  │PROFISSIONAL│  →  │CRESCIMENTO │  →  │   ESCALA   │
│         │    │            │    │            │     │            │      │            │
│ Código  │    │ Netlify    │    │ Histórico  │     │ Multi-user │      │ VPS        │
│ pronto  │    │ Appwrite   │    │ Tarefas    │     │ Portal cli │      │ PostgreSQL │
│ Testes  │    │ EmailJS    │    │ Gráficos   │     │ WhatsApp   │      │ API        │
│         │    │ Auth real  │    │ PDF        │     │ Faturas    │      │ SLA        │
└─────────┘    └────────────┘    └────────────┘     └────────────┘      └────────────┘

CUSTOS:    0€                 0€/mês            ~5€/mês           ~10-25€/mês      ~25-100€/mês
UTILIZAD:  1 gestor           1-3 gestores      3-5 gestores      5-15 gestores    15+ gestores
CLIENTES:  testes             10-30             30-100            100-300           300+
```

---

## Tabela de custos detalhada

| Item | Fase 1 (Grátis) | Fase 2 (Prof) | Fase 3 (Crescimento) | Fase 4 (Escala) |
|------|:---:|:---:|:---:|:---:|
| Netlify (hospedagem) | **0€** | 0€ | 0€ | 0€ (ou 15€ Pro) |
| Appwrite (backend) | **0€** | 0€ | ~15€/mês | ~30€/mês |
| EmailJS (email) | **0€** | 0€ | ~10€/mês | ~30€/mês |
| Domínio .pt | 0€ (1º ano) | **~5€/ano** | ~5€/ano | ~5€/ano |
| VPS (servidor) | — | — | — | **~6€/mês** |
| **Total/mês** | **0€** | **~0,42€** | **~25€** | **~70€** |
| **Total/ano** | **0€** | **~5€** | **~300€** | **~850€** |

---

## Riscos e Mitigação

### Risco 1: Perda de dados
| Cenário | Probabilidade | Solução |
|---------|:---:|---------|
| Utilizador limpa localStorage | Alta (Fase 0-1) | Migrar para Appwrite ASAP |
| Appwrite fora de serviço | Baixa | Fallback para localStorage + alerta |
| Erro humano (apagar cliente) | Média | Soft delete (marcar inativo) + histórico |

### Risco 2: Segurança
| Cenário | Probabilidade | Solução |
|---------|:---:|---------|
| Senha fraca | Alta | Appwrite Auth força senha segura |
| Acesso não autorizado | Média | Sessões com expiração + 2FA (Fase 3) |
| Dados expostos (IBAN/CVP) | Alta (Fase 0) | Encriptar ou ofuscar no frontend |

### Risco 3: Escalabilidade
| Cenário | Probabilidade | Solução |
|---------|:---:|---------|
| Appwrite atinge limite grátis | Média | Fazer upgrade ou migrar para PostgreSQL |
| EmailJS atinge 200 emails/mês | Média | Reduzir emails ou pagar plano |
| Netlify atinge 100GB/mês | Baixa | Otimizar imagens ou fazer upgrade |

---

## Necessidades de infraestrutura detalhadas

### O que precisas para o dia-a-dia real

#### 1. Domínio próprio (obrigatório para parecer profissional)
```bash
# Opções baratas em Portugal:
- ptisp.pt: ~5€/ano (.pt)
- amen.pt: ~8€/ano (.pt)
- godaddy.pt: ~10€/ano

Recomendo: ptisp.pt — suporte português, preço justo.
```

#### 2. Email profissional (para enviar os emails de aprovação)
```bash
# Opções:
- Gmail grátis: 0€ (mas aparece "enviado por gmail")
- Zoho Mail: 0€ (até 5 users, domínio próprio)
- Google Workspace: ~6€/mês (mais profissional)
- Outlook.com: 0€ (domínio próprio)

Recomendo: Zoho Mail (grátis) ou Gmail (já deves ter).
```

#### 3. Backup dos dados
```bash
# Diário:
- Exportar CSV de clientes, contratos, leads
- Guardar no Dropbox/Google Drive

# Semanal:
- Exportar Appwrite Database (JSON)
- Guardar backup do código no GitHub
```

#### 4. Monitorização
```bash
# Verificar semanalmente:
- Appwrite: armazenamento, pedidos, erros
- EmailJS: emails enviados, taxa de entrega
- Netlify: visitas, largura de banda
```

---

## Plano de implementação (checklist)

### 🔴 Crítico — fazer antes de mostrar a qualquer cliente
- [ ] 1. Criar conta Netlify + publicar site
- [ ] 2. Configurar domínio próprio (ex: gcc.pt)
- [ ] 3. Criar conta Appwrite + configurar base de dados
- [ ] 4. Migrar dados de localStorage para Appwrite
- [ ] 5. Criar conta EmailJS + configurar template
- [ ] 6. Substituir email simulado por envio real
- [ ] 7. Testar fluxo completo: lead → cliente → contrato → email → aprovação

### 🟡 Importante — fazer na primeira semana
- [ ] 8. Adicionar histórico do cliente
- [ ] 9. Adicionar validação de NIF/IBAN/CVP
- [ ] 10. Ofuscar IBAN/CVP nas tabelas (mostrar só últimos 4)
- [ ] 11. Adicionar notificações de renovação
- [ ] 12. Criar backup automático semanal

### 🟢 Diferenciação — fazer quando tiveres os primeiros clientes
- [ ] 13. Adicionar tarefas / follow-ups
- [ ] 14. Adicionar gráficos no dashboard
- [ ] 15. Adicionar export PDF
- [ ] 16. Criar portal do cliente
- [ ] 17. Adicionar comissões automáticas

---

## FAQ — Perguntas frequentes

### Preciso mesmo de Appwrite? Não posso continuar com localStorage?
Podes continuar com localStorage para testes e demonstração. Para uso real:
- **1 gestor, uso pessoal:** localStorage chega (mas arriscas perder dados)
- **2-3 gestores:** Já precisas de Appwrite (dados partilhados)
- **+3 gestores:** Appwrite é obrigatório

### E se eu não souber programar? Consigo fazer este setup?
O guia acima é passo-a-passo. O Appwrite tem interface visual (point-and-click) para criar a base de dados. O código que precisas de alterar está todo explicado. Se tiveres dúvidas, pergunta-me.

### Quanto tempo demora a implementação total?
- Fase 1 (MVP grátis): **1 tarde** (3-4h)
- Fase 2 (profissional): **1 semana** (trabalhando 2h/dia)
- Fase 3 (crescimento): **1 mês** (trabalhando ao ritmo)

### E se eu quiser algo ainda mais simples que Appwrite?
Alternativas ainda mais fáceis:
- **Airtable** como base de dados (interface tipo Excel, API simples)
- **Google Sheets** como backend (com Sheet.best ou similar)
- **Firebase** (Google, mais fácil para quem já usa Google)

Mas Appwrite é o melhor equilíbrio entre potência, preço e facilidade.

### Como apresento isto a um cliente?
Usa o guia de demonstração (`docs/demo/ROTEIRO_DEMO.md`) e os preços (`docs/demo/PRECOS.md`). Mostra primeiro o valor que o sistema gera, depois o preço.

---

## Conclusão

```
FASE 1 (0€/mês) → Sistema online com dados partilhados e email real
FASE 2 (~5€/mês) → Produtividade máxima do gestor
FASE 3 (~25€/mês) → Equipa a trabalhar em simultâneo
FASE 4 (~70€/mês) → Call center digital completo
```

**A melhor altura para começar? Agora.** A Fase 1 custa 0€ e já resolves o problema principal: dados partilhados e email real.
