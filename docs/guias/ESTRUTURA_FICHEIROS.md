# Estrutura de Ficheiros — GCC

## Mapa completo do projeto

---

```
gcc-GestaoCallCenter/
│
├── index.html                          ← Landing page (formulário de leads)
├── vendas.html                         ← Ferramenta de vendas (script, objeções, KPI)
├── netlify.toml                        ← [CRIAR] Config Netlify (deploy)
│
├── css/
│   └── estilo.css                      ← Estilo do vendas.html (dark mode)
│
├── js/
│   └── main.js                         ← Lógica do vendas.html (KPI, checklists)
│
├── gestao/
│   ├── index.html                      ← Login da gestão
│   ├── dashboard.html                  ← App principal (sidebar, KPIs, CRUD)
│   ├── aprovacao.html                  ← Página pública de aprovação do cliente
│   │
│   ├── css/
│   │   └── style.css                   ← Design system completo (sidebar, cards, modais)
│   │
│   └── js/
│       ├── auth.js                     ← Autenticação atual (localStorage, simulado)
│       ├── app.js                      ← Toda a lógica CRUD (665 linhas)
│       ├── appwrite-config.js          ← [CRIAR] Config Appwrite (endpoint, project ID)
│       ├── db-appwrite.js              ← [CRIAR] Camada de dados Appwrite
│       └── auth-appwrite.js            ← [CRIAR] Autenticação Appwrite
│
└── docs/
    ├── descricao.md                    ← Descrição do projeto
    ├── descricao.pdf                   ← Versão PDF
    ├── pitch.md                        ← Pitch do projeto
    ├── roteiroFuturCabo.odt            ← Roteiro original
    ├── prancha-rapida.md               ← Prancha rápida de vendas
    ├── ensaio-pratica.md               ← Ensaio prático
    │
    ├── docsFuturCabo/
    │   ├── Formação Inicial Futurcabo.pptx
    │   ├── Formação de vendas 2026.pptx
    │   └── PITCH.rtf
    │
    ├── guias/
    │   ├── GUIA_PRODUCAO.md            ← [ANTIGO] Visão geral de produção
    │   ├── MELHORIAS.md                ← [NOVO] Análise + funcionalidades novas
    │   ├── DEPLOY_NETLIFY_APPWRITE.md  ← [NOVO] Guia completo deploy
    │   ├── ROADMAP_MVP.md              ← [NOVO] Roadmap produção
    │   ├── NEXTAUTH.md                 ← [NOVO] Explicação NextAuth.js
    │   └── ESTRUTURA_FICHEIROS.md      ← [NOVO] Este ficheiro
    │
    └── demo/
        ├── APRESENTACAO.md             ← 12 slides de apresentação
        ├── ROTEIRO_DEMO.md             ← 30 min de demonstração
        ├── PROPOSTA_COMERCIAL.md       ← Proposta com ROI
        ├── ONEPAGER.md                 ← Resumo 1 página
        ├── PRECOS.md                   ← Guia de preços
        ├── TESTE_GRATIS.md             ← Processo de trial
        ├── apresentacao.odp            ← 14 slides LibreOffice
        └── apresentacao_original.odp   ← Backup original
```

---

## Legenda de cores

| Marcação | Significado |
|:--------:|-------------|
| ✅ | Funcional / Completo |
| [NOVO] | Criado nesta sessão |
| [CRIAR] | Ficheiro a criar durante o deploy |

---

## Ordem de criação dos novos ficheiros

```
1. netlify.toml                        ← Antes do deploy
2. gestao/js/appwrite-config.js        ← Após criar conta Appwrite
3. gestao/js/db-appwrite.js            ← Após configurar base de dados
4. gestao/js/auth-appwrite.js          ← Após configurar Auth
5. docs/guias/MELHORIAS.md             ← [JÁ CRIADO]
6. docs/guias/DEPLOY_NETLIFY_APPWRITE.md ← [JÁ CRIADO]
7. docs/guias/ROADMAP_MVP.md           ← [JÁ CRIADO]
8. docs/guias/NEXTAUTH.md              ← [JÁ CRIADO]
```

---

## Ficheiros a modificar durante o deploy

| Ficheiro | O que alterar |
|----------|---------------|
| `gestao/index.html` | Trocar `auth.js` por `auth-appwrite.js` |
| `gestao/dashboard.html` | Adicionar scripts: Appwrite SDK, EmailJS, novos JS |
| `gestao/js/app.js` | Substituir localStorage por chamadas Appwrite |
| `gestao/aprovacao.html` | (Opcional) Ligar também ao Appwrite |
