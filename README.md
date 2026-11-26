# Ciclotech Nexus OS

Demonstração de painel de reciclagem com indicadores e rastreamento simulado. Os registros ficam no navegador, não em um servidor. Use dados fictícios. A página carrega Tailwind e Chart.js de CDNs.

## Rodar localmente

Na raiz do repositório, execute:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra <http://localhost:8000/>.

## Estrutura

`ciclotech_nexus_os_enterprise_v6 (1).html`: painel e lógica local. `index.html`: entrada que preserva a URL anterior.

A CI valida o HTML e verifica arquivos e âncoras locais. Links e serviços externos não são consultados pela CI.
