# 🌊 MonitoraMicrovida — Sistema de Monitoramento e Cultivo de Organismos Aquáticos

Aplicação web responsiva e modular para acompanhamento diário, controle de parâmetros físico-químicos e registro em vídeo de cultivos de organismos aquáticos e plâncton (Gigapods, Amphipodes, Tisbe, Rotíferos, Nano, etc.)[cite: 4, 5].

O sistema opera em modelo *client-side* resiliente e seguro, combinando captura de metadados ambientais, gravação de bancada via Web APIs nativas, controle de acesso por PIN, sanitização contra XSS e persistência híbrida via Supabase PostgreSQL e LocalStorage[cite: 4, 5].

---

## 🚀 Principais Atualizações e Funcionalidades

### 🛡️ Segurança e Proteção de Front-End (Passo 1)
* **Barreira de Acesso por PIN (Front-End Gate)**: Autenticação simples por PIN com persistência em `sessionStorage` para liberar formulários e ações de gravação[cite: 4].
* **Prevenção de Duplo Envio (Race Conditions)**: Bloqueio automático do botão de envio (`#btnSalvar`) com spinner de carregamento interativo durante o processamento do payload[cite: 4].
* **Sanitização de Dados (Anti-XSS)**: Tratamento sistemático de entradas de texto via função nativa `sanitizarEntrada()` para prevenir injeção de scripts maliciosos[cite: 4].
* **Validação Flexibilizada & Mídia Opcional**: Exigência de apenas **um campo mínimo** para salvamento (Identificação do Lote no Início ou Seleção do Lote Ref. no Diário)[cite: 4]. O vídeo de 10s tornou-se opcional sem quebrar a pipeline de salvamento[cite: 4].

### 📱 Módulos de Cultivo e Roteamento Dinâmico (`script.js`)
* **Módulos Ativos**: Páginas dedicadas (`gigapods.html`, `amphipodes.html`, `tisbe.html`, `rotiferos.html`, `nano.html`) padronizadas[cite: 4, 5].
* **Roteamento Inteligente por URL**: O motor JavaScript identifica automaticamente a espécie ativa através do caminho da URL (`obterCulturaAtual()`), isolando histórico e dropdowns[cite: 4, 5].
* **Dropdowns Dinâmicos Vinculados**: O formulário diário lista exclusivamente os lotes/culturas previamente iniciados dentro do módulo correspondente[cite: 4].
* **Relatórios e Impressão**: Filtragem por tipo de registro (*Início* vs. *Diário*) e folha de estilo direcionada para exportação/impressão em PDF via `@media print`[cite: 4, 5].

### 🎥 Captura Visual e Metadados Nativos
* **Gravação de Bancada Adaptativa (10s)**: Suporte nativo via `MediaRecorder API` com seleção automática de câmera traseira (`facingMode: "environment"`) e verificação de MimeTypes/Codecs para suporte universal Android e iOS/Safari[cite: 4, 5].
* **Telemetria de Clima Automática**: Captura automática da temperatura ambiente local via `Geolocation API` integrada à API Open-Meteo[cite: 4, 5].

---

## 🗄️ Arquitetura do Banco de Dados & Storage (Supabase)

O projeto foi projetado para rodar com **Segurança Nativa por Linha (RLS - Row Level Security)** no Supabase PostgreSQL e limites estritos no Storage[cite: 4]:

* **Tabelas Relacionais**: `lotes_cultura` (abertura) e `registros_diarios` (acompanhamento físico-químico)[cite: 4].
* **RLS Ativo**: Acesso bloqueado por padrão para usuários anônimos (`anon`), liberando escrita/leitura somente via tokens de autenticação (`authenticated`)[cite: 4].
* **Storage Limit (10MB/vídeo)**: Trava de tamanho e restrição aos MimeTypes `video/mp4` e `video/webm` para operação contínua dentro da cota gratuita de 6 meses (1 GB)[cite: 4].

---

## 🛠️ Tecnologias Utilizadas

* **HTML5**: Estrutura semântica e suporte a captura de câmera[cite: 5].
* **Tailwind CSS**: Interface responsiva customizada em *Dark Mode*[cite: 4, 5].
* **JavaScript ES6+ Vanilla**: Regras de negócio, sanitização XSS, manipulação de Blobs e roteamento dinâmico[cite: 4, 5].
* **Supabase Client SDK / LocalStorage**: Persistência híbrida em nuvem ou fallback local[cite: 4, 5].
* **Open-Meteo API & Geolocation**: Telemetria meteorológica automática[cite: 4, 5].

---

## 📂 Estrutura do Projeto

```text
/
├── index.html         # Dashboard principal com navegação centralizada
├── gigapods.html      # Módulo de cultivo de Tigriopus californicus (Gigapods)
├── amphipodes.html    # Módulo de cultivo de Gammarus spp. (Amphipodes)
├── tisbe.html         # Módulo de cultivo de Tisbe biminiensis
├── rotiferos.html     # Módulo de cultivo de Rotíferos
├── nano.html          # Módulo de cultivo de Nannochloropsis
├── style.css          # Animações, estilos e regras de impressão (@media print)
├── script.js          # Lógica global, PIN de acesso, validações, vídeo e Supabase
└── README.md          # Documentação oficial e guia do projeto
