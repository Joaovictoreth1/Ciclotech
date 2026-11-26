# CicloTech OS

Demonstração em português de logística reversa de ativos eletrônicos. O site permite preencher um manifesto fictício, consultar o código no mesmo navegador, explorar indicadores ESG de exemplo e abrir um mapa ilustrativo.

**Use apenas dados fictícios.** Nenhum ativo é coletado, agendado ou sanitizado. O código do manifesto é uma referência de busca local, não uma credencial. A demonstração não registra cadeia de custódia, não cifra os dados armazenados e não valida conformidade legal.

## Executar

Requisitos: Node.js 24 (veja `.nvmrc`) e npm. Não há servidor de aplicação, banco de dados, chaves ou variáveis de ambiente.

```sh
nvm use
npm ci
npm run dev
```

Abra o endereço informado pelo Vite. Para experimentar sem preencher o formulário, use `CT-A1B2-C3D4` em **Consulta de manifesto**.

## Arquitetura e dados

- `index.html` contém os componentes da página. Vite compila Tailwind CSS e entrega JS, CSS, ícones e fontes locais com nomes baseados em conteúdo. `src/icons.svg` agrupa apenas os ícones Font Awesome usados (CC BY 4.0). O Chart.js é carregado apenas quando o painel ESG é aberto.
- `src/ledger.js` valida os dados, gera referências e salva um registro por código no `localStorage`. `src/wizard.js` e `src/tracker.js` ligam essa lógica ao formulário e à consulta, sem interpretar valores de usuário como HTML.
- A organização fictícia, o CEP de exemplo, as categorias e a data ficam no navegador em texto simples. O armazenamento é separado por origem e perfil do navegador. Para apagar os registros, limpe os dados do site no navegador. Registros válidos da versão anterior no mesmo domínio continuam consultáveis; o site não migra nem regrava esses dados.
- O mapa incorporado só faz requisições ao Google após o clique em **Carregar mapa**. O link **Abrir mapa externo** continua disponível sem JavaScript. A lista de pontos e os indicadores ESG são ilustrativos. O formulário e a consulta não enviam os dados preenchidos.

## Verificações

```sh
npm audit --audit-level=low
npm run lint
npm run format:check
npm run typecheck
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
```

Vitest verifica validação, referências, colisões, armazenamento indisponível e leitura de registros legados. O mínimo é de 90% para funções, instruções, linhas e ramos do módulo de regras e persistência. Playwright usa o build de produção em Chromium desktop e com emulação de celular; ele substitui a resposta do mapa para não depender da rede externa e executa com a política de segurança de produção. Em Linux, se faltarem dependências do Chromium, use `npx playwright install --with-deps chromium`. O GitHub Actions executa essas verificações em pushes e pull requests.

## Publicar

O repositório não publica automaticamente. No Netlify, conecte o repositório, configure `main` como branch de produção e use a raiz como diretório base. `netlify.toml` define Node.js 24, `npm run build` e a publicação de `dist/`. Não publique a raiz do repositório nem ative otimizações que injetem scripts na página.

O build inclui `_headers` com CSP sem scripts inline, proteção contra enquadramento e cache imutável somente para `/assets/*`. O Netlify também aplica HSTS e regras de cache para a página inicial e o cartão social a partir de `netlify.toml`. O canonical, o cartão social, `robots.txt` e `sitemap.xml` usam o domínio de produção `https://ciclotech.online/`.

Depois da primeira publicação, confirme no domínio real os cabeçalhos com `curl -I https://ciclotech.online/`, abra o painel ESG e confira a abertura do mapa e o fluxo completo do formulário à consulta. Para validar localmente após o build, use `npm run preview`.
