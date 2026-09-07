# 🌊 Sistema de Monitoramento e Cultivo de Microvida e Organismos Aquáticos

Aplicação web responsiva e modular para acompanhamento diário, controle de parâmetros físico-químicos e registro em vídeo de cultivos de organismos aquáticos e plâncton (Gigapods, Amphipodes, Tisbe, etc.).

O sistema opera no modelo *client-side* resiliente, combinando captura de metadados ambientais, gravação de bancada via Web APIs nativas, isolamento dinâmico de dados e integração com Supabase ou LocalStorage.

---

## 🚀 Principais Atualizações e Funcionalidades

### 📱 Novas Páginas e Módulos de Cultivo
* **Módulo de Amphipodes (`amphipodes.html`)**: Nova página dedicada para o cultivo de *Gammarus spp.* / Amphipoda, com layout padronizado, banners oficiais e formulários adaptados.
* **Dashboard Atualizado (`index.html`)**: Ativação do card funcional de Amphipodes ("Abrir Cultura"), unificando o acesso centralizado a todos os organismos monitorados.

### 🧠 Inteligência e Roteamento Dinâmico (`script.js`)
* **Detecção Automática de Cultura**: O script identifica a cultura ativa a partir do contexto da URL, eliminando a necessidade de scripts individuais por página.
* **Isolamento de Histórico por Espécie**: Persistência segregada no armazenamento local para cada tipo de cultivo, evitando contaminação cruzada de dados.
* **Dropdowns Dinâmicos**: O formulário de anotações diárias carrega automaticamente apenas os lotes/culturas iniciados no módulo correspondente.
* **Filtros e Relatórios PDF/Impressão**: Filtragem rápida por categoria de registro (*Início* vs. *Diário*) e CSS direcionado para exportação limpa em impressoras e relatórios PDF via `@media print`.

### 🎥 Captura Visual e Metadados Nativos
* **Gravação de Vídeo de Bancada (MediaRecorder API)**: Gravação obrigatória de 10 segundos com seleção dinâmica da câmera traseira e suporte de *fallback* para codecs (`video/mp4`, `video/webm`).
* **Telemetria de Clima Automática**: Captura automática da temperatura ambiente local via `Geolocation API` integrada à API do Open-Meteo.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5**: Semântica modular, elementos de mídia e captura de câmera.
* **Tailwind CSS**: Estilização responsiva em tema escuro (*Dark Mode*).
* **JavaScript ES6+ Vanilla**: Manipulação do DOM, manipulação de Blobs de mídia e roteamento inteligente.
* **Supabase Client SDK / LocalStorage**: Persistência híbrida resiliente em nuvem com *fallback* offline local.
* **Open-Meteo API**: Serviço de telemetria meteorológica sem chave de API.

---

## 📂 Estrutura do Projeto

```text
/
├── index.html         # Dashboard principal com navegação entre cultivos
├── gigapods.html      # Módulo dedicado ao cultivo de Tigriopus californicus (Gigapods)
├── amphipodes.html    # Módulo dedicado ao cultivo de Gammarus spp. (Amphipodes)
├── style.css          # Estilos customizados, animações e regras de impressão (@media print)
├── script.js          # Lógica global, detecção de URL, gravação e persistência
└── README.md          # Documentação do projeto
