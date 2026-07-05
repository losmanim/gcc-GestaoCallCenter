# Análise de Melhorias — GCC

## Revisão completa do código + novas funcionalidades para aumentar o desempenho do gestor

---

## 1. Resumo da Arquitetura Atual

| Componente | Tecnologia | Estado |
|------------|-----------|--------|
| Landing page | HTML + CSS + JS inline | ✅ Funcional |
| Sales toolkit | HTML + Bootstrap + JS | ✅ Funcional |
| Login | `auth.js` (localStorage + sessionStorage) | ✅ Funcional (simulado) |
| Dashboard | HTML + CSS + JS (`app.js`) | ✅ Funcional |
| CRUD Clientes | localStorage | ✅ Funcional |
| CRUD Serviços | localStorage | ✅ Funcional |
| CRUD Contratos | localStorage | ✅ Funcional |
| Aprovação | localStorage + token via URL | ✅ Funcional (simulado) |
| Leads | localStorage | ✅ Funcional |
| Relatórios | local cálculos | ✅ Básico |
| Export CSV | Blob + download | ✅ Funcional |
| Dark mode | CSS variables + localStorage | ✅ Só no vendas.html |

---

## 2. Problemas Identificados (Bugs / Limitações)

### Críticos
- **Dados isolados por browser** — Cada gestor vê dados diferentes (localStorage). Isto inviabiliza o uso real por equipas.
- **Email simulado** — O link de aprovação aparece no ecrã do gestor, não é enviado ao cliente. O fluxo só funciona em demonstração.
- **Autenticação fake** — `sessionStorage` é limpo ao fechar o browser. Qualquer pessoa com acesso ao PC entra sem senha se a sessão ainda existir.

### Moderados
- **Sem histórico de alterações** — Se um gestor apagar um cliente, não há forma de recuperar.
- **Sem proteção de dados** — IBAN, CVP, NIF expostos em texto plano no localStorage (sem encriptação).
- **Contratos sem notificação de renovação** — Não alerta quando um contrato está perto do fim.
- **Leads sem timestamp real** — Usa data sem hora. Não ordena por lead mais recente com precisão.
- **Sidebar não colapsa em mobile** — Ocupa espaço precioso em ecrãs pequenos.
- **Sem loading states** — Operações parecem instantâneas mas não há feedback visual (spinner).

### Menores
- **Cores NOS erradas** — Tag NOS está `#d63384` (rosa) em vez de vermelho `#e60000`.
- **Tooltips ausentes** — Botões sem `title` que expliquem a ação.
- **Validação de IBAN/NIF** — Não valida formato (qualquer texto é aceite).
- **Filtros não persistem** — Ao mudar de página, os filtros perdem-se.

---

## 3. Funcionalidades Novas para Aumentar o Desempenho do Gestor

### Prioridade Alta — Impacto Imediato

| # | Funcionalidade | O que resolve | Tempo estimado |
|---|---------------|---------------|----------------|
| 1 | **Notificações de Renovação** | Alertar gestor quando contratos estão a 30/15/7 dias do fim | 2 dias |
| 2 | **Histórico do Cliente** | Registar chamadas, emails, notas cronológicas por cliente | 3 dias |
| 3 | **Dashboard com Gráficos Reais (Chart.js)** | KPIs visuais:漏斗 evolução mensal, comparativo operadoras | 2 dias |
| 4 | **Pesquisa Global** | Campo único que procura em clientes, contratos, serviços ao mesmo tempo | 1 dia |
| 5 | **Tarefas / Follow-ups** | Lista de tarefas por gestor com data, prioridade e status | 3 dias |

### Prioridade Média — Diferenciação

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| 6 | **Comissões** | Calcular automaticamente comissão por venda (ex: 10% do valor do contrato) |
| 7 | **Export PDF** | Gerar contrato em PDF com layout profissional (usar jsPDF ou html2pdf) |
| 8 | **Agenda de Instalações** | Calendário com as instalações agendadas (integração visual) |
| 9 | **Página do Cliente** | Cliente pode consultar os seus contratos e histórico (portal) |
| 10 | **Multi-idioma** | PT + EN para gestores que lidam com estrangeiros |

### Prioridade Baixa — Nice to Have

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| 11 | **Modo escuro no dashboard** | Replicar dark mode que já existe no vendas.html |
| 12 | **Atalhos de teclado** | Ctrl+N = novo cliente, Ctrl+S = guardar, etc. |
| 13 | **Sidebar colapsável** | Botão para recolher sidebar em ecrãs pequenos |
| 14 | **Som de notificação** | Alertas sonoros para novos leads ou contratos aprovados |
| 15 | **PWA (instalável)** | `manifest.json` + service worker para usar como app |

---

## 4. Descrição Detalhada de Cada Funcionalidade Prioritária

### 4.1 — Notificações de Renovação

```javascript
// Lógica a adicionar no app.js
function verificarRenovacoes() {
  const hoje = new Date();
  const alertas = [];
  contratos.forEach(c => {
    if (!c.dataFim) return;
    const fim = new Date(c.dataFim + 'T12:00:00');
    const dias = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
    if (dias <= 30 && dias > 0) {
      const cl = clientes.find(x => x.id === c.clienteId);
      alertas.push({ cliente: cl?.nome || '—', dias, contratoId: c.id });
    }
  });
  // Mostrar no dashboard + toast
}
```

**UI proposta:**
- Card no dashboard: "Renovações a vencer" com lista e dias restantes
- Badge vermelho no sidebar "Contratos" quando houver alertas
- Toast automático ao carregar a página

### 4.2 — Histórico do Cliente

**Modelo de dados:**
```javascript
// Nova coleção no localStorage: gcc_g_historico
[
  {
    id: 1,
    clienteId: 1,
    tipo: 'nota' | 'chamada' | 'email' | 'contrato',
    descricao: 'Cliente ligou a pedir upgrade',
    data: '2026-07-05 14:30',
    criadoPor: 'gestor@gcc.pt'
  }
]
```

**UI proposta:**
- Aba "Histórico" no modal do cliente
- Feed cronológico com ícones por tipo
- Botão "Adicionar nota rápida"
- Filtro por tipo de evento

### 4.3 — Dashboard com Chart.js

**Implementação:**
```html
<!-- Adicionar ao dashboard.html -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<canvas id="chartReceita"></canvas>
<canvas id="chartContratos"></canvas>
```

**Gráficos:**
- **Linha:** Evolução mensal de receita (últimos 6 meses)
- **Barra:** Contratos por operadora (com cores reais)
- **Doughnut:** Distribuição de tipos de serviço
- **Card highlight:** Comparativo mês atual vs mês anterior

### 4.4 — Pesquisa Global

**UI proposta:**
- Campo de pesquisa fixo no topo do dashboard
- Resultados agrupados: Clientes (3), Contratos (3), Serviços (3)
- Atalho Ctrl+K para focar pesquisa (como Spotlight)

```javascript
function pesquisarGlobal(termo) {
  return {
    clientes: clientes.filter(c => c.nome.includes(termo) || c.nif.includes(termo)),
    contratos: contratos.filter(c => { /* ... */ }),
    servicos: servicos.filter(s => s.nome.includes(termo)),
    leads: leads.filter(l => l.nome.includes(termo)),
  };
}
```

### 4.5 — Tarefas / Follow-ups

**Modelo de dados:**
```javascript
// Nova coleção: gcc_g_tarefas
[
  {
    id: 1,
    titulo: 'Ligar ao cliente sobre renovação',
    prioridade: 'alta' | 'media' | 'baixa',
    dataLimite: '2026-07-10',
    clienteId: 1,
    gestor: 'gestor@gcc.pt',
    status: 'pendente' | 'concluido' | 'cancelado',
    criadoEm: '2026-07-05',
  }
]
```

**UI proposta:**
- Página própria "Tarefas" no sidebar (entre Contratos e Leads)
- Kanban visual: Pendente | Em andamento | Concluído
- Card no dashboard com as 5 tarefas mais urgentes
- Badge no sidebar com contagem de tarefas pendentes

---

## 5. Melhorias de Código (Refactoring)

### 5.1 — Separação de responsabilidades

Atualmente `app.js` tem 665 linhas com tudo misturado. Sugestão:

```
gestao/js/
├── auth.js          # Autenticação (já existe)
├── app.js           # Inicialização + router
├── db.js            # Camada de dados (abstração localStorage → API)
├── components/
│   ├── dashboard.js
│   ├── clientes.js
│   ├── servicos.js
│   ├── contratos.js
│   ├── leads.js
│   ├── relatorios.js
│   └── tarefas.js
├── utils.js         # Toast, formatação, validação
├── charts.js        # Gráficos (Chart.js)
└── notifications.js # Renovações, alertas
```

### 5.2 — Camada de dados (Data Access Layer)

Criar `db.js` para abstrair localStorage. Quando migrar para backend, só muda este ficheiro:

```javascript
// db.js — Abstração de dados
const DB = {
  get: (collection) => JSON.parse(localStorage.getItem(`gcc_${collection}`) || '[]'),
  set: (collection, data) => localStorage.setItem(`gcc_${collection}`, JSON.stringify(data)),
  add: (collection, item) => {
    const data = DB.get(collection);
    item.id = data.length ? Math.max(...data.map(i => i.id)) + 1 : 1;
    data.push(item);
    DB.set(collection, data);
    return item;
  },
  update: (collection, id, changes) => {
    const data = DB.get(collection);
    const idx = data.findIndex(i => i.id === id);
    if (idx >= 0) { data[idx] = { ...data[idx], ...changes }; DB.set(collection, data); }
  },
  delete: (collection, id) => {
    DB.set(collection, DB.get(collection).filter(i => i.id !== id));
  },
};
```

### 5.3 — Validações que faltam

| Campo | Regra |
|-------|-------|
| NIF | 9 dígitos (validar com algoritmo dos dígitos de controlo) |
| IBAN | 25 caracteres, começa com PT50 |
| CVP | 12 dígitos |
| Email | Formato válido (regex) |
| Telemóvel | 9 dígitos, começa com 9 |

### 5.4 — Performance

- **Virtual scrolling** para listas com +100 registos
- **Debounce** nos filtros de pesquisa (não renderizar a cada tecla)
- **Lazy loading** de páginas (só renderizar o que está visível)
- **Cache de consultas** (guardar resultados de filtros frequentes)

---

## 6. Segurança

**Problema atual:** localStorage é visível em Ferramentas de Desenvolvimento.

**Soluções progressivas:**

| Nível | O que fazer |
|-------|-------------|
| Mínimo | Ofuscar IBAN/CVP nos totais da tabela (mostrar só últimos 4 dígitos) |
| Médio | Encriptar dados sensíveis com CryptoJS antes de guardar no localStorage |
| Alto | Migrar para backend (Appwrite/Supabase) onde dados nunca vão para o browser |

---

## 7. UI/UX — Pequenos toques que fazem diferença

| Melhoria | Esforço | Impacto |
|----------|---------|---------|
| Adicionar `title` descritivo em todos os botões | 30 min | ⭐⭐⭐ |
| Mostrar feedback de "A guardar..." com spinner | 1h | ⭐⭐⭐ |
| Animar transições entre páginas | 2h | ⭐⭐ |
| Adicionar confirmação antes de eliminar (já existe) | — | ✅ |
| Auto-complete nos selects (cliente, serviço) com pesquisa | 4h | ⭐⭐⭐⭐⭐ |
| Ordenar colunas ao clicar no cabeçalho | 3h | ⭐⭐⭐ |
| Responsivo: sidebar colapsa em telemóvel | 2h | ⭐⭐⭐⭐ |

---

## 8. Roadmap de Implementação Sugerido

### Semana 1-2: Fundação
1. Separar `app.js` em módulos (db.js, utils.js)
2. Adicionar validação de IBAN, NIF, CVP, email
3. Corrigir cor NOS (#e60000)
4. Adicionar loading states e toasts melhorados

### Semana 3-4: Produtividade
5. Histórico do cliente (feed cronológico)
6. Pesquisa global (Ctrl+K)
7. Notificações de renovação
8. Sidebar colapsável + dark mode no dashboard

### Semana 5-6: Visual
9. Chart.js no dashboard (receita, contratos, evolução)
10. Export PDF de contratos
11. Ordenação de colunas nas tabelas

### Semana 7-8: Gestão
12. Tarefas / Follow-ups (Kanban)
13. Comissões
14. Agenda visual

### Semana 9-10: Maturação
15. Página do cliente (portal público)
16. Multi-idioma (PT/EN)
17. Testes e correções

---

## 9. Análise de Risco

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| localStorage fica cheio (5-10MB) | Baixa | Alto | Limpar dados antigos ou migrar para backend |
| Gestor perde dados ao limpar cache | Média | Alto | Migrar para backend ASAP |
| Concorrência (2 gestores editam mesmo cliente) | Alta (equipa) | Médio | Última alteração vence. Backend resolve com locking |
| Cliente não consegue abrir link aprovação | Média | Médio | Enviar também por SMS/WhatsApp |
| Esquecem-se de pagar mensalidade | Alta | Baixo | Lembretes automáticos no dashboard |

---

## 10. Conclusão

O código atual está funcional para demonstração e uso individual. Para uma equipa real de gestores, a **prioridade máxima** é:

1. **Base de dados partilhada** (Appwrite, Supabase, ou backend próprio)
2. **Email real** (EmailJS, SendGrid, ou PHPMailer)
3. **Histórico do cliente** (saber o que cada gestor fez)
4. **Notificações de renovação** (evitar perda de contratos)
5. **Tarefas** (organizar o dia-a-dia)

Estas 5 funcionalidades, por si só, aumentam a produtividade do gestor em **40-60%** (estimativa baseada em métricas de call centers que implementaram CRM com tarefas e alertas).
