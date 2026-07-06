# Guia de Deploy — Netlify + Appwrite + EmailJS

## Como levar o GCC do computador para a internet (passo a passo)

---

## Índice
1. [O que é cada serviço e como funciona](#1-o-que-é-cada-serviço)
2. [Criar conta no Netlify e fazer deploy](#2-netlify)
3. [Criar conta no Appwrite e configurar backend](#3-appwrite)
4. [Criar conta no EmailJS para email real](#4-emailjs)
5. [Ligar Appwrite ao frontend (substituir localStorage)](#5-integrar-appwrite)
6. [Ligar EmailJS ao fluxo de aprovação](#6-integrar-emailjs)
7. [Autenticação com Appwrite Auth](#7-autenticação)
8. [Testar tudo](#8-testar)
9. [Manutenção e próximos passos](#9-manutenção)

---
 
## 1. O que é cada serviço

### Netlify
**O que é?** Serviço que aloja sites estáticos (HTML, CSS, JS) na internet. Grátis.

**Como funciona (explicação simples):**
```
Tu tens os ficheiros no teu PC (index.html, gestao/, etc.)
          │
          ▼
Envias para o Netlify (arrastar pasta ou ligar ao GitHub)
          │
          ▼
Netlify publica na internet: https://teu-site.netlify.app
          │
          ▼
Qualquer pessoa pode aceder pelo link
```

**O que o Netlify faz:**
- Guarda os teus ficheiros em servidores mundiais (CDN)
- Atribui um link público (ex: `gcc-app.netlify.app`)
- Podes usar domínio próprio (ex: `gcc.pt`)
- HTTPS grátis (cadeado verde no browser)

### Appwrite
**O que é?** Backend completo (base de dados + autenticação + armazenamento) alojado na nuvem. Grátis para começar.

**Como funciona:**
```
Browser do gestor (dashboard.html)
          │
          ▼ busca dados via API
Appwrite Cloud
          │
          ├── Database (PostgreSQL)
          ├── Auth (users, sessões)
          └── Storage (ficheiros, se necessário)
```

**O que substitui:**
- ✅ `localStorage` → **Appwrite Database** (dados partilhados entre todos)
- ✅ `auth.js` (fake) → **Appwrite Auth** (autenticação segura)
- ✅ Dados isolados → **Dados na cloud** (qualquer gestor vê o mesmo)

### EmailJS
**O que é?** Serviço que permite enviar emails diretamente do JavaScript do browser, sem precisar de servidor.

**Como funciona:**
```
Browser do gestor
          │
          ▼ envia pedido para API do EmailJS
EmailJS API
          │
          ▼ reencaminha
Servidor de email (Gmail, Outlook, etc.)
          │
          ▼
Cliente recebe email com link de aprovação
```

**O substituto:**
- Antes: mostrava link no ecrã (simulado)
- Agora: envia email real para o cliente com o link

---

## 2. Netlify — Publicar o site

### 2.1 Criar conta
1. Abre [https://app.netlify.com](https://app.netlify.com)
2. Clica **"Sign up"**
3. Escolhe **"GitHub"** (recomendado) ou **"Email"**
4. Confirma o email

### 2.2 Preparar o projeto
Antes de enviar, precisas de um ficheiro especial para o Netlify saber como servir as páginas:

**Cria o ficheiro `netlify.toml` na raiz do projeto:**
```toml
[build]
  publish = "."

[[redirects]]
  from = "/gestao/*"
  to = "/gestao/index.html"
  status = 200

[[redirects]]
  from = "/gestao/aprovacao.html*"
  to = "/gestao/aprovacao.html"
  status = 200
```

**Explicação:** Isto garante que o Netlify sabe que as páginas da pasta `gestao/` são HTML normais.

### 2.3 Fazer deploy (método Drag & Drop — mais fácil)

```
1. Abre https://app.netlify.com
2. Clica "Sites" no menu
3. Arrasta a pasta do projeto para a zona "Drag and drop here"
   (a pasta completa: com index.html, gestao/, vendas.html, etc.)
4. Aguarda 1-2 minutos enquanto o Netlify publica
5. Clica no link gerado (ex: https://random-name-123.netlify.app)
```

### 2.4 Fazer deploy (método GitHub — recomendado para atualizações)

```
1. Cria um repositório no GitHub (ex: gcc-gestao)
2. Faz upload dos ficheiros para o repositório:
   git add .
   git commit -m "Primeiro deploy"
   git push origin main
3. No Netlify, clica "Add new site" → "Import an existing project"
4. Escolhe GitHub e seleciona o repositório
5. Clica "Deploy site"
6. Sempre que fizeres git push, o Netlify atualiza automaticamente
```

### 2.5 (Opcional) Adicionar domínio próprio
```
1. No Netlify, vai a "Site settings" → "Domain management"
2. Clica "Add custom domain"
3. Escreve o teu domínio (ex: gcc.pt)
4. Segue as instruções para configurar os DNS do teu domínio
   (normalmente: adicionar registos CNAME apontando para o Netlify)
5. O Netlify trata do SSL grátis automaticamente
```

### 2.6 Verificar se está online
```
Abre no browser: https://teu-site.netlify.app

Deves ver:
✅ Landing page (index.html) com formulário de leads
✅ Link "Área do Gestor" que leva para login
✅ Login funciona
✅ Dashboard aparece
```

---

## 3. Appwrite — Backend na cloud

### 3.1 Criar conta
1. Abre [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Clica **"Sign up"**
3. Podes usar GitHub ou Google
4. Após login, cria uma **"Project"** (projeto)
   - Nome: `GCC — Gestão Call Center`
   - Clica **"Create"**

### 3.2 Criar a base de dados
Appwrite organiza os dados assim:

```
Project (GCC)
  └── Database (gcc_db)
        ├── Collection (clientes)  →  Documentos (cada cliente)
        ├── Collection (servicos)  →  Documentos (cada serviço)
        ├── Collection (contratos) →  Documentos (cada contrato)
        ├── Collection (aprovacoes) → Documentos (cada aprovação)
        ├── Collection (leads)     →  Documentos (cada lead)
        └── Collection (historico) →  Documentos (cada evento)
```

**Passo a passo:**

1. No painel do Appwrite, vai a **"Databases"**
2. Clica **"Create database"**
   - Name: `gcc_db`
   - Clica **"Create"**

3. Agora cria cada coleção (como se fossem tabelas):

**Coleção: clientes**
```
Name: clientes
Clica "Create collection"

Atributos (colunas):
  nome         → string (tamanho: 200, obrigatório)
  email        → string (tamanho: 200)
  telefone     → string (tamanho: 20)
  nif          → string (tamanho: 20)
  operadora    → string (tamanho: 50)
  iban         → string (tamanho: 50)
  cvp          → string (tamanho: 20)
  morada       → string (tamanho: 500)
  codPostal    → string (tamanho: 20)
  estado       → string (tamanho: 50)
  notas        → string (tamanho: 500)
  criadoEm     → string (tamanho: 50)
  criadoPor    → string (tamanho: 200)

Permissions (quem pode aceder):
  Clica "Add permission" → Role: "Any" → Read, Create, Update, Delete
  (Em produção, limitar a utilizadores autenticados)
```

**Coleção: servicos**
```
Name: servicos
Atributos:
  nome       → string (tamanho: 200, obrigatório)
  operadora  → string (tamanho: 50, obrigatório)
  tipo       → string (tamanho: 50)
  velocidade → string (tamanho: 50)
  preco      → double
  canais     → string (tamanho: 50)
  moveis     → string (tamanho: 100)
  descricao  → string (tamanho: 500)
```

**Coleção: contratos**
```
Name: contratos
Atributos:
  clienteId   → string (tamanho: 50)
  servicoId   → string (tamanho: 50)
  dataInicio  → string (tamanho: 20)
  dataFim     → string (tamanho: 20)
  valor       → double
  estado      → string (tamanho: 50)
```

**Coleção: aprovacoes**
```
Name: aprovacoes
Atributos:
  token       → string (tamanho: 100, obrigatório)
  contratoId  → string (tamanho: 50)
  status      → string (tamanho: 20)  // pendente, aprovado, rejeitado
  dataEnvio   → string (tamanho: 20)
  dataResposta → string (tamanho: 20)
  clienteNome → string (tamanho: 200)
  servicoNome → string (tamanho: 200)
  operadora   → string (tamanho: 50)
  valor       → string (tamanho: 20)
```

**Coleção: leads**
```
Name: leads
Atributos:
  nome       → string (tamanho: 200, obrigatório)
  email      → string (tamanho: 200)
  telefone   → string (tamanho: 20)
  operadora  → string (tamanho: 50)
  mensagem   → string (tamanho: 1000)
  data       → string (tamanho: 20)
  lido       → boolean
```

### 3.3 Obter credenciais de API
Para ligar o frontend ao Appwrite, precisas de 3 informações:

```
1. No painel do Appwrite, vai a "Settings"
2. Anota:
   - Project ID: - 6a4a96ae00150f4aa36a
   - API Endpoint:  https://fra.cloud.appwrite.io/v1
3. Vai a "Databases" → clica na base de dados "gcc_db"
4. Anota o Database ID: - 6a4a97150006afe07f8a
5. Anota o ID de cada coleção (clica em cada uma e vê o ID)
```

### 3.4 Instalar Appwrite no projeto
Adiciona ao `dashboard.html` antes do `app.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/appwrite@14/dist/umd/sdk.js"></script>
```

E cria `gestao/js/appwrite-config.js`:

```javascript
// gestao/js/appwrite-config.js
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT = '64a1b2c3d4e5f6'; // O TEU Project ID
const APPWRITE_DATABASE = '64f1a2b3c4d5e6'; // O TEU Database ID

const sdk = new Appwrite.Client();
sdk
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

const database = new Appwrite.Databases(sdk);

// NOTA: Os IDs das coleções vais buscar no painel Appwrite
const COLLECTIONS = {
  clientes: 'ID_DA_COLECAO_CLIENTES',
  servicos: 'ID_DA_COLECAO_SERVICOS',
  contratos: 'ID_DA_COLECAO_CONTRATOS',
  aprovacoes: 'ID_DA_COLECAO_APROVACOES',
  leads: 'ID_DA_COLECAO_LEADS',
};
```

---

## 4. EmailJS — Enviar emails reais

### 4.1 Criar conta
1. Abre [https://www.emailjs.com](https://www.emailjs.com)
2. Clica **"Sign up"** (grátis)
3. Confirma o email

### 4.2 Ligar um serviço de email
EmailJS precisa de um "serviço" (que é a conta de email que vai enviar).

```
1. No painel do EmailJS, vai a "Email Services"
2. Clica "Add New Service"
3. Escolhe Gmail (ou Outlook, ou outro)
4. Segue as instruções para autorizar o EmailJS a enviar emails pela tua conta
5. Anota o Service ID (ex: service_abc123) - service_mail_gcc
```

**Dica:** Cria um email específico para o GCC (ex: `gcc@seudominio.pt` ou `gcc.app@gmail.com`). Não uses o teu email pessoal. gestorApp#26(senha gmail - )

### 4.3 Criar um template de email
```
1. Vai a "Email Templates"
2. Clica "Create New Template"
3. Dá o nome: "Aprovação de Contrato"
4. Desenha o template (podes usar HTML):
```

**Template:**
```html
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#0d1b2a;color:#fff;padding:20px;border-radius:10px 10px 0 0;text-align:center">
    <h1 style="margin:0">Gestão Call Center</h1>
  </div>
  
  <div style="padding:20px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px">
    <p>Olá <strong>{{clienteNome}}</strong>,</p>
    
    <p>O seu gestor enviou-lhe um contrato para aprovação.</p>
    
    <div style="background:#f8fafc;padding:15px;border-radius:8px;margin:15px 0">
      <p><strong>Serviço:</strong> {{servicoNome}}</p>
      <p><strong>Operadora:</strong> {{operadora}}</p>
      <p><strong>Valor:</strong> {{valor}}€/mês</p>
    </div>
    
    <p>Clique no botão abaixo para ver os detalhes e aprovar ou rejeitar:</p>
    
    <div style="text-align:center;margin:25px 0">
      <a href="{{link}}" style="background:#1b7a3d;color:#fff;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
        Ver e Aprovar Contrato
      </a>
    </div>
    
    <p style="color:#64748b;font-size:12px">Se o botão não funcionar, copie este link para o navegador:<br>
    <span style="color:#1b7a3d">{{link}}</span></p>
    
    <p>Obrigado,<br><strong>Equipa GCC</strong></p>
  </div>
</div>
```

5. Anota o **Template ID** (ex: `template_xyz789`) -> template_yodp801

### 4.4 Obter a chave de API (Public Key)
```
1. Vai a "Account" → "API Keys" 
2. Anota a "Public Key" (ex: abc123def456_public) -> JtK8dORbF0QLA_MMa
```

---

## 5. Integrar Appwrite no app.js

### 5.1 Substituir localStorage por Appwrite

Cria `gestao/js/db-appwrite.js`:

```javascript
// gestao/js/db-appwrite.js
// Substitui completamente o localStorage pelo Appwrite

async function carregarDados() {
  try {
    // Buscar todas as coleções em paralelo
    const [clientesRes, servicosRes, contratosRes, aprovacoesRes, leadsRes] = await Promise.all([
      database.listDocuments(APPWRITE_DATABASE, COLLECTIONS.clientes),
      database.listDocuments(APPWRITE_DATABASE, COLLECTIONS.servicos),
      database.listDocuments(APPWRITE_DATABASE, COLLECTIONS.contratos),
      database.listDocuments(APPWRITE_DATABASE, COLLECTIONS.aprovacoes),
      database.listDocuments(APPWRITE_DATABASE, COLLECTIONS.leads),
    ]);

    // Converter documentos Appwrite para o formato que o app.js espera
    window.clientes = clientesRes.documents.map(formatDoc);
    window.servicos = servicosRes.documents.map(formatDoc);
    window.contratos = contratosRes.documents.map(formatDoc);
    window.aprovacoes = aprovacoesRes.documents.map(formatDoc);
    window.leads = leadsRes.documents.map(formatDoc);

    console.log('✅ Dados carregados do Appwrite');
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    // Fallback: usar localStorage se Appwrite falhar
    carregarFallback();
  }
}

function formatDoc(doc) {
  // Appwrite usa $id, $createdAt, etc.
  // Converter para formato antigo (id, nome, ...)
  return { id: doc.$id, ...doc, id: doc.$id };
}

function carregarFallback() {
  // Se Appwrite falhar, carrega do localStorage (modo offline)
  window.clientes = JSON.parse(localStorage.getItem('gcc_g_clientes') || '[]');
  window.servicos = JSON.parse(localStorage.getItem('gcc_g_servicos') || '[]');
  window.contratos = JSON.parse(localStorage.getItem('gcc_g_contratos') || '[]');
  window.aprovacoes = JSON.parse(localStorage.getItem('gcc_g_aprovacoes') || '[]');
  window.leads = JSON.parse(localStorage.getItem('gcc_g_leads') || '[]');
}
```

### 5.2 Funções de CRUD para Appwrite

```javascript
// Adicionar ao db-appwrite.js

async function salvarCliente(dados) {
  try {
    const res = await database.createDocument(
      APPWRITE_DATABASE,
      COLLECTIONS.clientes,
      'unique()',
      dados
    );
    return res;
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    throw error;
  }
}

async function atualizarCliente(id, dados) {
  try {
    const res = await database.updateDocument(
      APPWRITE_DATABASE,
      COLLECTIONS.clientes,
      id,
      dados
    );
    return res;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
}

async function eliminarCliente(id) {
  try {
    await database.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTIONS.clientes,
      id
    );
  } catch (error) {
    console.error('Erro ao eliminar cliente:', error);
    throw error;
  }
}

// Repetir para: servicos, contratos, aprovacoes, leads
```

### 5.3 Substituir no app.js

Todas as funções que usam `localStorage.getItem()` passam a chamar as funções acima.

```javascript
// ANTES (app.js original):
function saveClientes() { localStorage.setItem(STORAGE_CLIENTES, JSON.stringify(clientes)); }

// DEPOIS (com Appwrite):
async function saveClientes() {
  await atualizarCliente(dados.id, dados);
  clientes = await carregarClientes();
}
```

---

## 6. Integrar EmailJS no fluxo de aprovação

### 6.1 Adicionar EmailJS ao dashboard.html

```html
<!-- Antes do app.js -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>
  emailjs.init('abc123def456_public'); // A TUA Public Key
</script>
```

### 6.2 Substituir a função de enviar aprovação

No `app.js`, substituir `window.enviarAprovacao`:

```javascript
window.enviarAprovacao = async function(contratoId) {
  const c = contratos.find(x => x.id === contratoId);
  if (!c) return;
  const cl = clientes.find(x => x.id === c.clienteId);
  const s = servicos.find(x => x.id === c.servicoId);
  if (!cl || !s) { toast('Cliente ou serviço não encontrado', 'error'); return; }

  // 1. Criar token
  const token = 'aprov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const link = window.location.origin + '/gestao/aprovacao.html?token=' + token;

  // 2. Guardar aprovação no Appwrite
  await salvarAprovacao({
    token,
    contratoId: c.id,
    status: 'pendente',
    dataEnvio: today(),
    clienteNome: cl.nome,
    servicoNome: s.nome,
    operadora: s.operadora,
    valor: c.valor
  });

  // 3. Enviar email REAL via EmailJS
  try {
    const response = await emailjs.send(
      'service_abc123',        // O TEU Service ID
      'template_xyz789',       // O TEU Template ID
      {
        clienteNome: cl.nome,
        servicoNome: s.nome,
        operadora: s.operadora,
        valor: c.valor,
        link: link,
        to_email: cl.email      // Email do cliente
      }
    );
    
    toast(`✅ Email enviado com sucesso para ${cl.nome}`, 'success');
    
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    toast('⚠️ Não foi possível enviar o email. Mostrando link manual.', 'error');
    // Fallback: mostrar preview
    mostrarPreviewEmail(cl, link);
  }

  renderContratos();
};
```

---

## 7. Autenticação com Appwrite Auth

### 7.1 Substituir auth.js por Appwrite Auth

O `auth.js` atual é simulado (compara email/senha em localStorage). O Appwrite Auth faz autenticação segura:

**Como funciona o Appwrite Auth:**
```
Browser do gestor
     │
     │ email + senha
     ▼
Appwrite Auth
     │
     ├── Verifica se user existe
     ├── Cria sessão (cookie + token JWT)
     └── Devolve dados do user
     
Browser guarda a sessão num cookie seguro
(fica ativa até fazer logout ou expirar)
```

**Substituir `auth.js` por `auth-appwrite.js`:**

```javascript
// gestao/js/auth-appwrite.js

const sdk = new Appwrite.Client();
sdk
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('TEU_PROJECT_ID');

const account = new Appwrite.Account(sdk);

window.Auth = {
  // Criar conta (só para o admin)
  register: async (email, password, nome) => {
    try {
      await account.create('unique()', email, password, nome);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      await account.createEmailSession(email, password);
      const user = await account.get();
      return { success: true, user: { email: user.email, nome: user.name, tipo: 'gestor' } };
    } catch (error) {
      return { success: false, error: 'Email ou senha inválidos.' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await account.deleteSession('current');
    } catch (e) { /* ignore */ }
  },

  // Verificar sessão
  getUser: async () => {
    try {
      const user = await account.get();
      return { email: user.email, nome: user.name, tipo: 'gestor' };
    } catch (e) {
      return null;
    }
  },

  isLoggedIn: async () => {
    const user = await Auth.getUser();
    return !!user;
  },

  requireAuth: async () => {
    const user = await Auth.getUser();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  changePassword: async (newPassword) => {
    try {
      await account.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

### 7.2 Atualizar o login.html

```html
<script>
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.email.value.trim();
    const senha = this.senha.value.trim();
    
    const result = await Auth.login(email, senha);
    if (result.success) {
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('loginErrorText').textContent = result.error;
      document.getElementById('loginError').style.display = 'flex';
    }
  });
</script>
```

### 7.3 (Opcional) Próximo passo — Gestão de utilizadores

No painel do Appwrite:
```
1. Vai a "Auth" → "Users"
2. Clica "Create user" para adicionar gestores manualmente
3. Podes definir:
   - Email + Senha (cada gestor muda a senha depois)
   - Nome (aparece no sidebar)
   - Labels (ex: "admin", "gestor") para controlar permissões
```

---

## 8. Testar tudo

### Checklist de teste

- [ ] **Netlify:** Site online, landing page carrega, formulário de leads funciona
- [ ] **Leads na cloud:** Lead preenchido no site aparece no dashboard
- [ ] **Login real:** Login com email/senha do Appwrite funciona
- [ ] **CRUD remoto:** Criar/editar/eliminar cliente na cloud (outro gestor vê)
- [ ] **Email real:** Enviar aprovação → cliente recebe email mesmo
- [ ] **Aprovação real:** Cliente abre link, aprova, status atualiza
- [ ] **Segurança:** Dados não ficam visíveis em localStorage (só na cloud)
- [ ] **Offline:** Se internet cair, mostra erro (ou cai no fallback)

### Como testar o email real
```
1. No dashboard, cria um contrato com estado "Pendente"
2. Clica "Enviar" (botão de email)
3. Abre o email que recebeste (usa o teu próprio email para testar)
4. Clica no link de aprovação
5. Escolhe "Aprovar" ou "Rejeitar"
6. Volta ao dashboard — o estado do contrato deve ter mudado
```

---

## 9. Manutenção

### Backup
```bash
# Appwrite tem backup automático (plano grátis já inclui)
# Podes também exportar manualmente:
# No painel Appwrite → Databases → Export (JSON)
```

### Monitorização
```bash
# Appwrite mostra:
# - Nº de pedidos/dia
# - Armazenamento usado
# - Erros de API
# - Users ativos

# EmailJS mostra:
# - Emails enviados
# - Taxa de abertura
# - Erros de entrega
```

### Limites dos planos grátis
| Serviço | Limite | O que acontece se exceder |
|---------|--------|--------------------------|
| Netlify | 100GB/mês, 300 min build | Cobrança ou throttling |
| Appwrite | 50k docs, 50k users, 2GB storage | Pedir upgrade |
| EmailJS | 200 emails/mês | Emails falham |

**Quando fazer upgrade:**
- Appwrite: quando tiveres +1000 contratos ou +50 utilizadores
- EmailJS: quando enviares +200 emails/mês (~50 clientes)
- Netlify: quando tiveres +50k visitas/mês

---

## 10. Resumo dos ficheiros a criar/alterar

### Ficheiros NOVOS a criar

| Nº | Ficheiro | O que faz |
|----|----------|-----------|
| 1 | `netlify.toml` | Configuração do Netlify (raiz do projeto) |
| 2 | `gestao/js/appwrite-config.js` | Config do Appwrite (endpoint, project, collections) |
| 3 | `gestao/js/db-appwrite.js` | Camada de dados para Appwrite (CRUD) |
| 4 | `gestao/js/auth-appwrite.js` | Autenticação com Appwrite Auth |

### Ficheiros a ALTERAR

| Nº | Ficheiro | O que mudar |
|----|----------|-------------|
| 1 | `gestao/dashboard.html` | Add scripts Appwrite + EmailJS |
| 2 | `gestao/js/app.js` | Substituir localStorage por chamadas Appwrite |
| 3 | `gestao/index.html` | Usar `auth-appwrite.js` em vez de `auth.js` |
| 4 | `gestao/aprovacao.html` | Se quiser que a aprovação também use Appwrite |

---

## Fluxo completo (resumo visual)

```
CLIENTE                     GESTOR                      SISTEMA
  │                           │                            │
  │  Preenche lead no site    │                            │
  ├──────────────────────────►│  Lead aparece no           │
  │                           │  dashboard (badge)         │
  │                           ├──────────────────────────►│ Appwrite guarda
  │                           │                            │
  │                           │  Cria cliente + contrato   │
  │                           ├──────────────────────────►│ Appwrite guarda
  │                           │                            │
  │                           │  Clica "Enviar" aprovação  │
  │                           ├──────────────────────────►│ EmailJS envia
  │                           │                            │ email para cliente
  │                           │                            │
  │  Recebe email com link    │                            │
  │◄──────────────────────────┤                            │
  │                           │                            │
  │  Abre link, aprova        │                            │
  ├──────────────────────────►│                            │
  │                           │  Contrato fica "Ativo"     │
  │                           │◄───────────────────────────│ Appwrite atualiza
```
