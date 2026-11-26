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

- `index.html` contém os componentes da página. Vite compila Tailwind CSS e entrega JS, CSS, ícones e fontes locais com nomes baseados em conteúdo. O Chart.js é carregado apenas quando o painel ESG é aberto.
- `public/ciclotech_nexus_os_enterprise_v6 (1).html` mantém a URL antiga, redirecionando para a página inicial.
- `src/ledger.js` valida os dados, gera referências e salva um registro por código no `localStorage`. `src/wizard.js` e `src/tracker.js` ligam essa lógica ao formulário e à consulta, sem interpretar valores de usuário como HTML.
- A organização fictícia, o CEP de exemplo, as categorias e a data ficam no navegador em texto simples. O armazenamento é separado por origem e perfil do navegador. Para apagar os registros, limpe os dados do site no navegador. Registros válidos da versão anterior no mesmo domínio continuam consultáveis; o site não migra nem regrava esses dados.
- O mapa incorporado é a única dependência de rede do site em uso e faz requisições ao Google quando carregado. A lista de pontos e os indicadores ESG são ilustrativos. O formulário e a consulta não enviam os dados preenchidos.

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

O build inclui `_headers` com CSP sem scripts inline, proteção contra enquadramento e cache imutável somente para `/assets/*`. Em outro provedor estático, configure os mesmos cabeçalhos no servidor e exija HTTPS. Depois da primeira publicação, confirme no domínio real os cabeçalhos com `curl -I https://<domínio>/`, abra o painel ESG e confira a abertura do mapa e o fluxo completo do formulário à consulta. Para validar localmente após o build, use `npm run preview`.
