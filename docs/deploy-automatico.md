# Deploy Automático — Netlify + GitHub

## 1. Criar conta no Netlify

1. Acede a [netlify.com](https://netlify.com) e regista-te com o GitHub
2. Autoriza o Netlify a aceder aos teus repositórios

## 2. Ligar o repositório

1. Clica em **"Add new site"** → **"Import an existing project"**
2. Escolhe **GitHub** como provider
3. Seleciona o repositório `losmanim/gcc-GestaoCallCenter`
4. Netlify deteta automaticamente o `netlify.toml` com:
   ```toml
   [build]
   publish = "."
   ```
5. Clica em **"Deploy site"**

## 3. Configurar o domínio (opcional)

1. Em **Site settings** → **Domain management**
2. Altera o subdomínio ou adiciona um domínio personalizado
3. Exemplo: `gcc-ap.netlify.app`

## 4. Deploy automático

A partir deste momento, **cada `git push` para o branch `main`**:
1. O GitHub notifica o Netlify
2. O Netlify faz o build (copia os ficheiros para o CDN)
3. O site é atualizado em segundos

Para forçar um deploy manual:
- **Opção A:** Fazer `git commit --allow-empty -m "deploy" && git push`
- **Opção B:** No dashboard do Netlify, clicar em **"Trigger deploy"** → **"Deploy site"**

## 5. Verificar o estado

No terminal:
```bash
curl -s "https://api.netlify.com/api/v1/sites/gcc-ap.netlify.app/deploys" | \
  python3 -c "import sys,json; [print(d['title'], d['state']) for d in json.load(sys.stdin)[:3]]"
```

Ou visualmente em [app.netlify.com](https://app.netlify.com).

## 6. Problemas comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Build skipped | Vários deploys em fila | Esperar ou forçar manual |
| Build error | Conflito no `netlify.toml` | Verificar sintaxe (usar espaços, não tabs) |
| 404 após deploy | Regras de redirect ausentes | Confirmar `[[redirects]]` no `netlify.toml` |
| Minutos de build esgotados | Limite do plano gratuito (300 min/mês) | Aguardar próximo mês ou fazer upgrade |

## 7. Ficheiros importantes

- `netlify.toml` — configuração de build e redirects
- `README.md` — documentação geral do projeto

## 8. Fluxo de trabalho recomendado

```bash
git add -A
git commit -m "descrição da alteração"
git push
# Aguardar 1-2 minutos
# Hard refresh (Ctrl+Shift+R) no browser
```
