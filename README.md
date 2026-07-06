# Gestão Call Center

Plataforma web para gestão de clientes, contratos e aprovações de operadoras de telecomunicações (NOS, MEO, Vodafone).

## Funcionalidades

- **Dashboard** — KPIs, gráficos por operadora e tipo de serviço, últimos clientes
- **Clientes** — CRUD completo com filtros, IBAN, CVP, notas
- **Serviços** — Catálogo de planos (3P, 4P) com preços, velocidade, canais
- **Contratos** — Gestão de contratos ativos/pendentes/suspensos
- **Aprovações** — Envio de email com link de aprovação/rejeição ao cliente
- **Leads** — Captura de leads via página pública, conversão em cliente
- **Relatórios** — Ranking de clientes por faturação, receita por operadora
- **Exportação CSV** — Clientes, serviços e contratos
- **Autenticação** — Login seguro com alteração de senha

## Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend:** [Appwrite](https://appwrite.io) (Auth + Database)
- **Email:** [EmailJS](https://www.emailjs.com)
- **Hospedagem:** Netlify (deploy automático via GitHub)

## Estrutura

```
├── index.html              # Página pública (landing + formulário de leads)
├── netlify.toml            # Configuração de deploy Netlify
├── gestao/
│   ├── index.html          # Página de login
│   ├── dashboard.html      # Painel principal
│   ├── aprovacao.html      # Página pública de aprovação/rejeição
│   ├── css/
│   │   └── style.css       # Estilos globais
│   └── js/
│       ├── app.js          # Lógica principal (CRUD, sync, gráficos)
│       ├── appwrite-config.js  # Configuração Appwrite
│       ├── auth-appwrite.js    # Autenticação
│       └── db-appwrite.js      # Helpers de base de dados
└── README.md
```

## Configuração

### Appwrite

1. Cria um projeto em [cloud.appwrite.io](https://cloud.appwrite.io)
2. Cria uma base de dados com as coleções: `clientes`, `servicos`, `contratos`, `aprovacoes`, `leads`
3. Adiciona os atributos necessários em cada coleção
4. Define as permissões de cada coleção conforme a necessidade
5. Actualiza as constantes em `gestao/js/appwrite-config.js`

### EmailJS

1. Cria uma conta em [emailjs.com](https://www.emailjs.com)
2. Adiciona um serviço de email
3. Cria um template com as variáveis: `{{clienteNome}}`, `{{servicoNome}}`, `{{operadora}}`, `{{valor}}`, `{{link}}`, `{{to_email}}`
4. No template, define o campo **To Email** como `{{to_email}}`
5. Actualiza a chave pública e os IDs no código

### Netlify

O deploy é automático ao fazer push para o branch `main`. O ficheiro `netlify.toml` já inclui as regras de redirect necessárias.

## Licença

Uso interno.
