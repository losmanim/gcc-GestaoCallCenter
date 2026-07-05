# NextAuth.js — Autenticação para o GCC

## O que é, quando usar, e porquê (ou não) deves usar

---

## 1. O que é NextAuth.js?

**NextAuth.js** (agora chamado **Auth.js**) é uma biblioteca de autenticação para **Next.js** (framework React).

**Traduzindo:** Se o teu site fosse feito em Next.js (React com rotas e servidor), o NextAuth.js trataria do login com email/senha, Google, Facebook, etc.

### Como funciona (simplificado):
```
Browser                   Servidor Next.js              Base de dados
  │                             │                            │
  │  "Quero fazer login"        │                            │
  ├────────────────────────────►│                            │
  │                             │  Verifica credenciais      │
  │                             ├───────────────────────────►│
  │                             │◄───────────────────────────┤
  │  "Aqui está o teu token"    │                            │
  │◄────────────────────────────┤                            │
  │                             │                            │
  │  Envia token em cada        │                            │
  │  pedido para API            │                            │
  ├────────────────────────────►│                            │
```

---

## 2. Devo usar NextAuth.js no GCC?

### Resposta curta: **NÃO, a não ser que migres para Next.js.**

O teu projeto é HTML + CSS + JS puro (sem React, sem framework). O NextAuth.js **só funciona dentro do Next.js**.

### Alternativas para o teu projeto atual:

| Solução | Funciona com HTML/JS puro? | Dificuldade |
|---------|:--------------------------:|:-----------:|
| **Appwrite Auth** (recomendado) | ✅ Sim | Fácil |
| **Supabase Auth** | ✅ Sim | Fácil |
| **Firebase Auth** | ✅ Sim | Fácil |
| **Auth0** | ✅ Sim | Médio |
| **PHP + sessions** | ✅ Sim | Médio |
| **NextAuth.js** | ❌ Só com Next.js | Complexa |

---

## 3. Se quiseres mesmo migrar para Next.js

Se um dia quiseres transformar o GCC numa aplicação React profissional, este é o caminho:

### Passo 1: Instalar Next.js
```bash
npx create-next-app@latest gcc-next
cd gcc-next
```

### Passo 2: Copiar o código
- `index.html` → `app/page.jsx` (landing page)
- `gestao/dashboard.html` → `app/dashboard/page.jsx`
- `gestao/index.html` → `app/login/page.jsx`
- `gestao/aprovacao.html` → `app/aprovacao/page.jsx`
- Lógica JS → componentes React separados

### Passo 3: Instalar NextAuth.js
```bash
npm install next-auth
```

### Passo 4: Configurar (exemplo mínimo)
```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // Aqui consultas a base de dados (Appwrite, Supabase, etc.)
        const user = { id: 1, name: "Admin", email: "admin@gcc.pt" };
        if (credentials?.email === "admin@gcc.pt" && credentials?.password === "admin123") {
          return user;
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: '/login' },
});

export { handler as GET, handler as POST };
```

### Passo 5: Usar no dashboard
```jsx
// app/dashboard/page.jsx
'use client';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  
  if (!session) {
    return <p>A redirecionar para login...</p>;
  }

  return (
    <div>
      <h1>Bem-vindo, {session.user.name}</h1>
      <button onClick={() => signOut()}>Sair</button>
    </div>
  );
}
```

---

## 4. Comparação: Appwrite Auth vs NextAuth.js

| Característica | Appwrite Auth | NextAuth.js |
|----------------|:---:|:---:|
| Funciona com HTML puro | ✅ | ❌ |
| Funciona com Next.js | ✅ | ✅ |
| Setup inicial | 15 min | 1-2h |
| Manutenção | Automática (cloud) | Tu geres |
| Login social (Google, etc.) | ✅ | ✅ |
| 2FA | ✅ | ❌ (nativo) |
| Recuperação de senha | ✅ | ❌ (manual) |
| Sessões | JWT + Cookies | JWT + Cookies |
| Preço | Grátis até 50k users | Grátis |
| Ideal para | Projeto atual (HTML) | Se migrares para Next.js |

---

## 5. Recomendação final

```
Projeto atual (HTML/CSS/JS puro)
        │
        ▼
Usa Appwrite Auth (mais simples, já integrado com a base de dados)
        │
        ▼
Se no futuro migrares para Next.js/React
        │
        ▼
Podes trocar Appwrite Auth por NextAuth.js
(ou manter Appwrite Auth — também funciona com Next.js)
```

**Appwrite Auth é a melhor escolha AGORA.** Não compliques com NextAuth.js a não ser que já estejas a usar Next.js.

---

## 6. Para referência futura

Quando estiveres pronto para migrar para Next.js, avisa-me e eu ajudo-te a:

1. Converter HTML/JS para componentes React
2. Configurar NextAuth.js com a base de dados existente
3. Manter o mesmo visual (CSS) durante a transição
4. Garantir que as rotas atuais (aprovacao.html?token=...) continuam a funcionar

**Nota:** A migração para Next.js é um projeto de 2-4 semanas. Faz sentido quando tiveres 5+ clientes pagantes.
