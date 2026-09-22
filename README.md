O CicloTech é uma plataforma avançada (Single-Page Application) de logística reversa para ativos de TI (e-waste). O projeto foca em resolver a principal barreira do descarte eletrônico: a segurança da informação. Através de protocolos de sanitização de dados (Data Wiping) aderentes à LGPD, o projeto recondiciona hardwares ociosos e os destina à educação pública, promovendo a economia circular.

🔗 Acesse a demonstração ao vivo aqui (ciclotech.online)

🚀 Funcionalidades Principais

Manifesto de Coleta Inteligente (Wizard): Formulário multi-etapas (Step-by-step) com validação de dados em tempo real e aceite de termos de sanitização LGPD.

Ledger Tracker: Sistema de rastreabilidade de custódia utilizando hashes gerados dinamicamente para acompanhamento do status do lote (Agendado ➔ Trânsito ➔ Sanitizado ➔ Reaproveitado).

Painel ESG (Data Intelligence): Dashboard analítico renderizado via Chart.js mostrando métricas de mitigação de CO2, volume arrecadado e distribuição de tipologia de e-waste.

Rede Node (Mapeamento Geoespacial): Integração com Leaflet.js mapeando Ecopontos e parceiros locais para entrega voluntária, com funcionalidade "Fly-to" na interface.

UI/UX Premium: Design imersivo em "Dark Mode" utilizando Glassmorphism, animações interativas (blobs, tilt-cards, mouse glow) e feedback visual sem a utilização de alertas nativos do navegador (Custom Toast Notifications).

🛠️ Arquitetura e Tecnologias

O projeto foi construído utilizando uma arquitetura Vanilla JS modular, sem frameworks pesados, garantindo performance e facilidade de manutenção.

Frontend UI: HTML5 semântico + Tailwind CSS (via CDN para facilitar o deploy estático).

Comportamento / Lógica: Vanilla JavaScript (ES6+).

Gerenciamento de Estado: Utilização de Proxy reativo para controlar o fluxo da interface (ex: avanço do Wizard).

Persistência de Dados: Padrão de serviço (Storage Service) utilizando localStorage para simular um banco de dados relacional no front-end.

Bibliotecas Externas:

Chart.js (Visualização de dados).

Leaflet.js (Mapas interativos).

FontAwesome (Ícones vetoriais).

🌍 Impacto e Sustentabilidade (Agenda 2030 - ONU)

Este projeto de extensão universitária está alinhado com os Objetivos de Desenvolvimento Sustentável (ODS):

📚 ODS 4 (Educação de Qualidade): Inclusão digital através do fornecimento de infraestrutura tecnológica para estudantes carentes.

♻️ ODS 12 (Consumo e Produção Responsáveis): Mitigação do descarte tóxico e fomento à economia circular através da logística reversa.

⚙️ Como Executar o Projeto

Como a aplicação foi arquitetada para ser 100% Client-Side (Client-Side Rendering) e contida em um único arquivo, a execução é extremamente simples.

Execução Local

Faça o clone deste repositório:

git clone https://github.com/SEU-USUARIO/ciclotech.git


Abra o arquivo index.html em qualquer navegador moderno (Chrome, Edge, Firefox, Safari). Nenhuma compilação (build step) é necessária.

Deploy na Nuvem (Netlify / Vercel / GitHub Pages)

O projeto está "Deploy Ready". Para publicar no Netlify, por exemplo:

Crie uma conta no Netlify.

Arraste a pasta do projeto (ou conecte este repositório do GitHub) na aba "Sites".

O deploy será concluído em segundos.

👨‍💻 Estrutura do Código (Vanilla JS Enterprise Pattern)

O arquivo HTML contém scripts modulares divididos em classes responsabilidades claras:

AppConfig: Constantes globais do sistema.

AppState: Estado reativo da aplicação.

StorageService: Abstração de banco de dados (CRUD no localStorage).

UIController: Manipulação direta do DOM, Modais e Toasts.

WizardController: Lógica de negócio do formulário de coleta.

ChartService & MapService: Encapsulamento das bibliotecas externas.
