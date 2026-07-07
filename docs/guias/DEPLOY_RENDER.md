# Guia de Deploy no Render

## Visão Geral

Este guia explica como hospedar a plataforma **GCC — Gestão Call Center** no [Render](https://render.com) como um site estático.

> **Porquê Render?**  
> Render oferece hosting gratuito para sites estáticos, SSL automático, deploy contínuo a partir do GitHub, e suporte para redirects SPA (Single Page Application).

---

## Pré-requisitos

Antes de começar, certifica-te que tens:

1. **Conta no Render** — Cria em [render.com](https://render.com) (podes usar login do GitHub)
2. **Repositório GitHub** — O código do projeto num repositório GitHub (público ou privado)
3. **Projeto Appwrite** — Já configurado com as coleções: `clientes`, `servicos`, `contratos`, `aprovacoes`, `leads`
4. **Conta EmailJS** — Com serviço e template configurados para envio dos emails de aprovação

---

## Passo 1: Preparar o Projeto

### 1.1 Verificar a estrutura

O projeto é um site 100% estático (HTML + CSS + JS). Não precisa de build step. A estrutura relevante é:

```
/
├── index.html              # Landing page pública
├── vendas.html             # Ferramenta de vendas
├── css/                    # Estilos
├── js/                     # Scripts
├── gestao/
│   ├── index.html          # Login
│   ├── dashboard.html      # Painel admin (SPA)
│   ├── aprovacao.html      # Página de aprovação pública
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── appwrite-config.js
│       ├── auth-appwrite.js
│       ├── db-appwrite.js
│       ├── core.js
│       ├── ui.js
│       ├── dashboard.js
│       ├── clientes.js
│       ├── servicos.js
│       ├── contratos.js
│       ├── leads.js
│       ├── relatorios.js
│       └── app.js
└── docs/                   # Documentação (podes excluir do deploy)
```

### 1.2 (Opcional) Criar ficheiro `render.yaml`

Para configuração avançada (Infra-as-Code), cria na raiz do projeto:

```yaml
# render.yaml
services:
  - type: web
    name: gcc-gestao-callcenter
    env: static
    buildCommand: ""
    staticPublishPath: .
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
    routes:
      - type: rewrite
        source: /gestao/aprovacao.html*
        destination: /gestao/aprovacao.html
      - type: rewrite
        source: /gestao/*
        destination: /gestao/index.html
```

> **Nota:** Se usares o dashboard do Render (recomendado para começar), podes saltar este passo.

---

## Passo 2: Fazer Deploy no Render

### 2.1 Fazer login no Render

1. Vai a [dashboard.render.com](https://dashboard.render.com)
2. Faz login (recomendado: "Sign in with GitHub")

### 2.2 Criar novo Static Site

1. Clica em **"New +"** → **"Static Site"**
2. Liga a tua conta GitHub (se ainda não estiver ligada)
3. Seleciona o repositório do projeto (ex: `gcc-GestaoCallCenter`)
4. Configura o Static Site:

| Campo | Valor |
|-------|-------|
| **Name** | `gcc-gestao-callcenter` (ou outro nome único) |
| **Branch** | `main` (ou a branch que queres publicar) |
| **Root Directory** | Deixar vazio (a raiz do repositório) |
| **Build Command** | Deixar vazio (projeto é estático, sem build) |
| **Publish Directory** | `.` (ponto final — publicar a partir da raiz) |

### 2.3 Configurar Redirects (SPA Support)

Após criar o site, vai a **"Redirects/Rewrites"** e adiciona:

1. **Regra 1** (página de aprovação pública — permite query params):
   - **Source:** `/gestao/aprovacao.html*`
   - **Destination:** `/gestao/aprovacao.html`
   - **Action:** `Rewrite`

2. **Regra 2** (SPA redirect — qualquer rota `/gestao/*` vai para o login):
   - **Source:** `/gestao/*`
   - **Destination:** `/gestao/index.html`
   - **Action:** `Rewrite`

> Estas regras garantem que:
> - O link de aprovação `/gestao/aprovacao.html?token=xxx` funciona corretamente
> - Qualquer rota direta para `/gestao/dashboard.html` (ou páginas internas) redireciona para o login, que depois redireciona para o dashboard após autenticação

### 2.4 Clicar em "Deploy"

Render vai fazer o deploy automaticamente. O URL será algo como:
```
https://gcc-gestao-callcenter.onrender.com
```

---

## Passo 3: Configurar Deploy Automático

Por predefinição, o Render faz deploy automático sempre que fazes push ao branch configurado (ex: `main`).

### Para verificar/alterar:

1. No dashboard do Render, abre o teu Static Site
2. Vai a **"Settings"** → **"Branch Auto-Deploy"**
3. Deve estar **"Yes"** (ativado)

A partir de agora, cada vez que fizeres `git push origin main`, o Render faz deploy automaticamente.

---

## Passo 4: Configurar Domínio Personalizado (Opcional)

1. No dashboard do Render, vai a **"Settings"** → **"Custom Domain"**
2. Clica em **"Add Domain"**
3. Insere o teu domínio (ex: `gestao.futurcabo.pt`)
4. Render mostra os registos DNS que precisas de adicionar no teu provedor de domínio
5. Adiciona um registo **CNAME** apontando para `onrender.com` (ou o que Render indicar)
6. Aguarda a propagação DNS (pode demorar até 48h, mas geralmente é em minutos)

### Atualizar link de aprovação no código

Se usares domínio personalizado, atualiza o link de aprovação em `gestao/js/contratos.js`:

```javascript
// Antes (Render default):
var link = 'https://gcc-gestao-callcenter.onrender.com/gestao/aprovacao.html?token=' + token;

// Depois (domínio personalizado):
var link = 'https://gestao.futurcabo.pt/gestao/aprovacao.html?token=' + token;
```

---

## Passo 5: Verificar o Deploy

### Checklist pós-deploy:

- [ ] **Landing page** acessível: `https://teu-site.onrender.com/`
- [ ] **Formulário de leads** funciona (guarda no Appwrite + localStorage)
- [ ] **Ferramenta de vendas**: `https://teu-site.onrender.com/vendas.html`
- [ ] **Login**: `https://teu-site.onrender.com/gestao/index.html`
- [ ] **Dashboard**: Fazer login, verificar se KPIs, clientes, serviços carregam
- [ ] **Aprovação**: Criar contrato pendente, enviar email de aprovação, clicar no link
- [ ] **HTTPS**: Render ativa SSL automaticamente (gratuito)

---

## Resolução de Problemas

### "Página em branco" no dashboard

**Causa mais comum:** Erro de JavaScript (Appwrite não configurado ou CORS).

**Solução:**
1. Abre o Console do Browser (F12 → Console)
2. Verifica se há erros como `Appwrite is not defined` ou `Failed to load resource`
3. Confirma que as credenciais Appwrite em `gestao/js/appwrite-config.js` estão corretas
4. No Appwrite Console, vai a **"Settings"** → **"Project"** e adiciona o domínio do Render em **"Platforms"** → **"Add Web Platform"**

### "Erro ao carregar leads"

**Causa:** A coleção `leads` pode não existir ou as permissões estão incorretas.

**Solução:**
1. No Appwrite Console, verifica se a coleção `leads` existe na base de dados
2. Verifica as permissões da coleção — deve permitir leitura/escrita para utilizadores autenticados

### EmailJS não envia

**Causa:** Domínio não autorizado no EmailJS.

**Solução:**
1. No [EmailJS Dashboard](https://dashboard.emailjs.com), vai a **"Email Services"**
2. Em cada serviço, clica em **"Settings"** e adiciona o domínio do Render em **"Allowed Domains"**
3. Exemplo: `https://gcc-gestao-callcenter.onrender.com`

### Redirects não funcionam

**Causa:** Regras de redirect não foram aplicadas ou estão com erro.

**Solução:**
1. Vai a **"Redirects/Rewrites"** no dashboard do Render
2. Confirma que as regras estão listadas corretamente (ver Passo 2.3)
3. Render não usa ficheiro `_redirects` como Netlify — as regras são configuradas no dashboard

---

## Comparação: Render vs Netlify

| Funcionalidade | Render | Netlify |
|---------------|--------|---------|
| **Deploy gratuito** | Sim (100GB/mês) | Sim (100GB/mês) |
| **SSL automático** | Sim | Sim |
| **Deploy por git push** | Sim | Sim |
| **Redirects SPA** | Dashboard UI | `_redirects` ou `netlify.toml` |
| **Domínio personalizado** | Sim | Sim |
| **Build step** | Opcional | Opcional |
| **Limite de sites gratuitos** | Ilimitado | 1 por conta (gratuita) |

> **Nota:** Este projeto inclui `netlify.toml` para compatibilidade com Netlify. Se optares por Render, podes remover ou ignorar esse ficheiro.

---

## Manutenção

### Atualizar o site

1. Faz as alterações no código
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição da alteração"
   git push origin main
   ```
3. Render faz deploy automático (1-2 minutos)

### Ver logs do deploy

No dashboard do Render, o teu Static Site → **"Events"** → vê o histórico de deploys e logs.

---

## Recursos

- [Documentação oficial Render - Static Sites](https://render.com/docs/static-sites)
- [Appwrite Docs](https://appwrite.io/docs)
- [EmailJS Docs](https://www.emailjs.com/docs/)
