# Guia de Produção — GCC (Gestão Call Center)
 
## Cenário atual
O projeto funciona 100% no navegador com `localStorage`. Para usar no mundo real, precisas de:
- Base de dados partilhada (para vários agentes usarem ao mesmo tempo)
- Envio real de emails
- Autenticação segura
- Hospedagem acessível pela internet

---

## 1. Hospedagem

### Grátis

| Plataforma | Ideal para | Limitações |
|---|---|---|
| **GitHub Pages** | Site de propaganda (`index.html`) | Só ficheiros estáticos (HTML/CSS/JS). Sem backend. |
| **Netlify** | Site + gestão (frontend) | Ótimo para estáticos. Plano grátis: 100GB/mês, 300min build. |
| **Vercel** | Site + gestão (frontend) | Semelhante ao Netlify. Bom para projetos pequenos. |
| **InfinityFree** | Backend PHP/MySQL | Grátis com anúncios, base de dados MySQL incluída. |

### Pagas (recomendado)

| Plataforma | Preço | Ideal para |
|---|---|---|
| **Shared Hosting** (cPanel) | ~3€/mês | Tudo. PHP + MySQL + email. Alojamento pt: **ptisp**, **webfaction**, **hostiger** |
| **VPS** (DigitalOcean, Vultr, Linode) | ~6€/mês | Projetos maiores. Controlo total. |
| **AWS Free Tier** | 12 meses grátis | EC2 + RDS. Mais complexo. |

---

## 2. Backend (base de dados partilhada)

O `localStorage` atual só funciona num computador. Para vários gestores, precisas de backend.

### Grátis

| Opção | Como funciona |
|---|---|
| **Supabase** (free tier) | Base de dados PostgreSQL online + API REST. Projeto ilimitado. Ótimo para começar. |
| **Firebase Firestore** (free tier) | Base NoSQL da Google. 1GB armazenamento grátis. |
| **Appwrite** (self-hosted) | Open-source. Podes instalar no teu servidor. |
| **JSON Server + Render** | Transformar o `gestao/js/app.js` para chamar API REST. |

### Pagas

| Opção | Preço | Notas |
|---|---|---|
| **Supabase Pro** | ~25€/mês | Mais espaço, backup automático |
| **Firebase Blaze Plan** | Pay-as-you-go | Só pagas pelo que usares |
| **MySQL + PHP** (hosting partilhado) | Já incluído no alojamento | Solução clássica e robusta |

---

## 3. Envio de email real

Atualmente o email é "simulado" (mostra o link no ecrã).

### Grátis

| Serviço | Limite | Como usar |
|---|---|---|
| **EmailJS** | 200 emails/mês grátis | Chamas API diretamente do JS. Sem servidor. |
| **SendGrid** (Twilio) | 100 emails/dia grátis | API poderosa. Precisa de servidor. |
| **Mailtrap** | Testing grátis | Só para ambiente de teste (não entrega). |

### Pagas

| Serviço | Preço | Notas |
|---|---|---|
| **SendGrid** (pago) | ~20€/mês (50k emails) | Muito confiável |
| **Mailgun** | ~35€/mês (50k emails) | Boa reputação de entrega |
| **PHPMailer** + hosting | Incluído no alojamento | Funciona com qualquer plano cPanel |
| **Brevo (Sendinblue)** | 300 emails/dia grátis | Até 9k/mês grátis |

---

## 4. Autenticação

Para login real (não simulado em `sessionStorage`):

| Opção | Tipo | Preço |
|---|---|---|
| **Supabase Auth** | Integrado com Supabase | Grátis (50k users) |
| **Firebase Auth** | Google/Facebook/Email | Grátis |
| **Auth0** | SSO, social login | Grátis até 7k users |
| **PHP + sessions** | Clássico | Incluído no hosting |
| **NextAuth.js** | Se migrares para Next.js | Grátis |

---

## 5. Roadmap para produção (recomendado)

### Fase 1 — Grátis / MVP (< 0€)

1. Publica o `index.html` (site propaganda) no **Netlify** ou **GitHub Pages**
2. Publica a pasta `gestao/` no mesmo local
3. Usa **Supabase** para base de dados partilhada
4. Usa **EmailJS** para enviar emails reais

### Fase 2 — Profissional (~5-10€/mês)

1. Contrata **alojamento partilhado** (cPanel) por ~3€/mês
2. Instala **PHP + MySQL**
3. Converte `app.js` para chamar API PHP com PDO
4. Usa **PHPMailer** para envio de email
5. Adiciona `.htaccess` para proteger pastas

### Fase 3 — Escalável (~25-50€/mês)

1. VPS na **DigitalOcean** (~6€/mês)
2. Backend em **Node.js (Express)** ou **Laravel**
3. Banco **PostgreSQL** (Supabase ou directo)
4. API RESTful com autenticação JWT
5. Redis para cache/sessões

---

## 6. Exemplo de stack recomendada (início)

```
Frontend: HTML + CSS + JS (o que já tens)
Hospedagem: Netlify (grátis)
Backend: Supabase (grátis — PostgreSQL + Auth)
Email: EmailJS (200/mês grátis)
Domínio: .pt (~5€/ano na ptisp/pt)
```

### Ou tudo num só sítio (mais simples):

```
Hospedagem: Alojamento partilhado (~3€/mês)
Backend: PHP + MySQL (incluído)
Email: PHPMailer (incluído)
Domínio: incluído ou ~5€/ano
```

---

## 7. Conversão mínima para backend

Para sair do `localStorage`, o `app.js` precisa de 4 funções:

```javascript
// Em vez de localStorage, chamas a API:
async function api(method, recurso, dados) {
  const res = await fetch(`https://teu-site.com/api/${recurso}`, {
    method, headers: { 'Content-Type': 'application/json' },
    body: dados ? JSON.stringify(dados) : undefined
  });
  return res.json();
}

// Exemplo:
// await api('GET', 'clientes')
// await api('POST', 'clientes', { nome: '...', ... })
// await api('PUT', 'clientes/1', { ... })
// await api('DELETE', 'clientes/1')
```

O backend (PHP ou Node) faz as operações na base de dados em vez do `localStorage`.
