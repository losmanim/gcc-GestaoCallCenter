# Deploy Manual — Netlify

## Método 1: Arrastar e soltar (mais rápido)

1. Acede a [app.netlify.com](https://app.netlify.com)
2. Faz login com o GitHub
3. Clica em **"Sites"** → seleciona **gcc-ap**
4. Vai a **Deploys** → arrasta a pasta do projeto para a caixa **"Drag and drop your site folder here"**
5. Aguarda o deploy (segundos)

A pasta a arrastar é a raiz do projeto (`/GestaoCallCenter`).

## Método 2: CLI do Netlify

1. Instala o CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Faz login:
   ```bash
   netlify login
   ```

3. Liga ao site existente:
   ```bash
   netlify link --id gcc-ap
   ```

4. Faz o deploy manual:
   ```bash
   netlify deploy --prod --dir=.
   ```

## Método 3: Pelo dashboard (trigger manual)

1. Acede a [app.netlify.com](https://app.netlify.com)
2. **Sites** → **gcc-ap** → **Deploys**
3. Clica em **"Trigger deploy"** → **"Deploy site"**

## Verificar se funcionou

Após o deploy, faz **hard refresh (Ctrl+Shift+R)** no browser e confirma que as alterações estão visíveis.

Se o deploy falhar, verifica o log de build no separador **Deploys** para identificar o erro.
