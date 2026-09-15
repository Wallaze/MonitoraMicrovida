# 🌊 MonitoraMicrovida — Sistema de Monitoramento e Cultivo de Organismos Aquáticos

Aplicação web responsiva e modular destinada ao **registro, acompanhamento e monitoramento de culturas de organismos aquáticos e plâncton**, incluindo Gigapods, Amphipodes, Tisbe, Rotíferos e Nano.

O MonitoraMicrovida foi concebido inicialmente como um protótipo funcional para validar o fluxo de registro de culturas e, progressivamente, evoluiu para um **sistema interno com persistência real**, integrado a banco de dados relacional (PostgreSQL/Supabase) e armazenamento em nuvem, mantendo a possibilidade de evolução futura para uma aplicação externa multiusuário.

O sistema permite registrar informações de abertura de culturas, acompanhamento diário, parâmetros físico-químicos, observações, registros visuais em vídeo e gerenciamento do histórico (incluindo exclusão) com persistência remota.

> **Status atual:** dados e vídeos já persistem no Supabase (PostgreSQL + Storage), com fallback local em caso de falha de conexão. Rotina de expurgo automática (`pg_cron`) remove registros e lotes com mais de 6 meses, checando semanalmente — testada e confirmada em funcionamento. A validação de PIN de operador foi movida do frontend para funções no banco de dados (RPC), fechando a brecha de escrita direta via chave pública. O upload de vídeo para o Storage é restrito por regras estruturais (cultura válida, extensão de vídeo, limite de tamanho), mas **ainda não valida PIN** — ver seção "Segurança" para detalhes dessa limitação conhecida.

---

## 🎯 Objetivo

O objetivo do MonitoraMicrovida é transformar o acompanhamento de culturas de organismos aquáticos em um processo **padronizado, rastreável e historicamente consultável**.

A aplicação busca centralizar informações que normalmente podem ficar dispersas em anotações, planilhas ou registros individuais, permitindo acompanhar a evolução de cada cultura ao longo do tempo.

Entre os objetivos do sistema estão:

- identificação individualizada de lotes/culturas;
- registro da abertura de uma nova cultura (`lotes_cultura`);
- acompanhamento diário e medições físico-químicas (`registros_diarios`);
- registro de parâmetros ambientais e físico-químicos;
- registro de observações;
- documentação visual por vídeo (limitado a 10s);
- consulta e exclusão manual de histórico diretamente pela interface;
- filtragem dos registros;
- expurgo automático semestral para otimização do banco de dados;
- impressão/exportação dos registros;
- posterior geração de indicadores e relatórios;
- persistência segura dos dados em infraestrutura de nuvem (Supabase).

---

## 🚀 Funcionalidades

### 🧫 Módulos de cultivo

O sistema possui páginas específicas para diferentes culturas:

- **Gigapods** — *Tigriopus californicus*;
- **Amphipodes** — *Gammarus* spp.;
- **Tisbe** — *Tisbe biminiensis*;
- **Rotíferos**;
- **Nano** — *Nannochloropsis*.

Cada módulo utiliza a mesma estrutura funcional, mas mantém seus registros associados à cultura correspondente.

A identificação do módulo ativo é realizada dinamicamente pelo JavaScript a partir da URL da página.

> **Nota:** hoje só as páginas de Gigapods e Amphipodes existem de fato. Tisbe, Rotíferos e Nano estão planejadas para criação futura.

---

### 📝 Registro de início de cultura

O registro de início permite documentar a abertura de uma nova cultura na tabela `lotes_cultura`, incluindo:

- identificação do lote/cultura;
- recipiente;
- litragem;
- substrato;
- iluminação;
- aeração (armazenada como booleano: Ativa/Inativa);
- temperatura ambiente;
- salinidade;
- observações;
- registro visual opcional.

A identificação do lote é o campo mínimo necessário para permitir o salvamento de um registro de início.

---

### 📅 Registro diário

O módulo de acompanhamento diário permite registrar informações relacionadas à evolução de uma cultura previamente iniciada, gravadas na tabela `registros_diarios`.

Entre os dados registrados estão:

- lote/cultura de referência (`lote_id` via chave estrangeira);
- temperatura da água;
- pH;
- amônia;
- nitrato;
- fosfato;
- temperatura ambiente;
- salinidade;
- observações;
- registro visual opcional (URL pública do vídeo).

O campo de referência da cultura é utilizado para vincular o acompanhamento diário a um lote previamente registrado.

---

## 🎥 Registro em vídeo

O sistema utiliza APIs nativas do navegador para realizar a captura de vídeo diretamente pelo dispositivo.

A gravação foi projetada para ser:

- opcional;
- limitada a **10 segundos**;
- sem captura de áudio;
- compatível com câmera traseira quando disponível;
- adaptável às capacidades do navegador;
- realizada através da `MediaRecorder API`.

### Estratégia de armazenamento em nuvem

O vídeo é enviado diretamente do navegador para a nuvem sem sobrecarregar o banco de dados relacional:

```text
Câmera (Navegador)
   ↓
MediaRecorder API
   ↓
Blob de vídeo (WebM / 10s)
   ↓
Supabase Storage (Bucket: videos-cultivo)
   ↓
Geração de Public URL
   ↓
Persistência da URL no PostgreSQL
```

O banco de dados armazena apenas a referência (`video_path`) ao arquivo — não o conteúdo binário do vídeo.

---

## 🌡️ Dados ambientais

O sistema possui uma rotina de obtenção automática da temperatura ambiente.

Quando disponível, o navegador fornece a localização aproximada por meio da `Geolocation API`. Essas coordenadas são utilizadas para consultar a temperatura atual através da API **Open-Meteo**.

Caso a localização ou consulta externa não esteja disponível, o sistema possui um valor de fallback para permitir a continuidade do preenchimento.

---

## 🔐 Segurança

A segurança evoluiu do controle apenas em interface para validação no backend.

### Situação atual

- **Tabelas (`lotes_cultura`, `registros_diarios`, `operadores`):** protegidas por funções PostgreSQL (`criar_lote`, `criar_registro_diario`, `deletar_lote`, `deletar_registro_diario`) que validam o PIN do operador **dentro do banco** antes de qualquer escrita. Inserção e exclusão direta via anon key estão bloqueadas — só é possível através dessas funções.
- **Cadastro de operadores:** feito manualmente pelo administrador via Table Editor do Supabase. Não existe cadastro público de PIN pelo site.
- **PIN em sessão:** o PIN digitado fica em memória (variável JavaScript) durante a sessão do navegador — não é salvo em disco e some ao fechar a aba. Se o PIN for rejeitado pelo banco, o app descarta o PIN em memória e pede novamente na próxima ação.
- **Storage (vídeos):** restringido por regras estruturais — só aceita upload dentro de uma pasta de cultura válida, com extensão de vídeo (`.webm`/`.mp4`), e com limite de 20MB por arquivo. **Ainda não valida PIN.**

### Limitação conhecida

O Storage do Supabase não integra nativamente com a validação de PIN usada nas tabelas (que roda dentro do Postgres via funções `SECURITY DEFINER`). Fechar esse ponto exigiria uma **Edge Function** dedicada — um serviço intermediário que recebe o PIN, valida, e só então autoriza o upload com uma chave privilegiada. Essa peça ainda não foi implementada.

Na prática, isso significa que a *leitura* e a *escrita* de dados estruturados (lotes, registros) estão bem protegidas, mas o *upload de vídeo* tem uma superfície de abuso residual (alguém com a anon key poderia, em teoria, enviar arquivos para o bucket sem passar pelo fluxo de PIN da interface).

### Arquitetura de mais longo prazo

Uma evolução futura possível é migrar de PIN para **Supabase Auth** (login com email/senha por operador), o que permitiria RLS baseado em `auth.uid()` — inclusive no Storage. Essa mudança altera a experiência do usuário (login em vez de PIN) e não está no escopo atual.

---

## 💾 Persistência dos dados

A persistência já está integrada ao Supabase para dados estruturados e vídeos.

```text
Frontend
   │
   ▼
Supabase Client
   │
   ├── PostgreSQL (via funções RPC com validação de PIN)
   │      └── Dados estruturados
   │
   └── Storage
          └── Vídeos e mídias
```

Em caso de falha de conexão com o Supabase, o sistema recorre a um fallback local (`sessionStorage`) para não perder o registro digitado — esse fallback é provisório e vale apenas para a sessão atual do navegador.

---

## 🗄️ Banco de dados

O modelo relacional já está implementado e em uso.

```text
Operadores
    │
    ▼
Lotes / Culturas
    │
    ▼
Registros de acompanhamento
    │
    └──────► Mídias / Vídeos (referência via video_path)
```

### Tabelas

| Tabela | Descrição |
|---|---|
| `operadores` | Pessoas autorizadas a registrar dados (nome, PIN, status ativo) |
| `lotes_cultura` | Abertura de uma cultura (cultura, identificação, recipiente, litragem, substrato, iluminação, aeração, ambiente, video_path, observações) |
| `registros_diarios` | Acompanhamento diário de um lote (`lote_id`, temperatura da água, pH, amônia, nitrato, fosfato, ambiente, observações) |

### Rotina de manutenção

Uma função (`limpar_dados_antigos`) agendada via `pg_cron` remove semanalmente registros e lotes com mais de 6 meses de existência — testada e confirmada em funcionamento.

### Migrations

Histórico versionado em `supabase/migrations/`:

- `001_schema_inicial.sql` — tabelas base + RLS inicial (aberto, provisório)
- `002_adicionar_storage_videos.sql` — bucket de vídeos + ajuste de coluna `aeracao`
- `003_limpeza_automatica.sql` — função de expurgo + agendamento `pg_cron`
- `004_seguranca_pin.sql` — fecha escrita direta nas tabelas, move validação de PIN para funções RPC
- `005_reforco_storage.sql` — restringe upload de vídeo por cultura válida, extensão e tamanho
- `006_adicionar_video_lotes.sql` — adiciona coluna video_path em lotes_cultura, corrigindo incompatibilidade com o RPC criar_lote

Documentação detalhada em `docs/banco-de-dados.md` e `supabase/README.md`.

---

## 🧩 Arquitetura JavaScript

O JavaScript é modular, dividido por responsabilidade:

```text
js/
├── config.js
├── auth.js
├── cultura.js
├── clima.js
├── video.js
├── registros.js
├── ui.js
└── script.js
```

| Arquivo | Responsabilidade |
|---|---|
| `config.js` | Configuração e inicialização do cliente Supabase |
| `auth.js` | PIN de operador em memória de sessão (validação real acontece no banco) |
| `cultura.js` | Identificação da cultura e gerenciamento das referências de lote |
| `clima.js` | Data/hora e obtenção da temperatura ambiente |
| `video.js` | Câmera, `MediaRecorder`, gravação, Blob de vídeo e limpeza de UI |
| `registros.js` | Validação, persistência via funções RPC, histórico unificado, exclusão |
| `ui.js` | Abas, botões, impressão, sanitização e comportamento visual |
| `script.js` | Ponto de entrada e orquestração da aplicação |

O `script.js` permanece como arquivo principal carregado pelas páginas, mas não concentra mais toda a lógica.

---

## 🎨 Interface

A interface utiliza HTML5 e Tailwind CSS, com identidade visual predominantemente em modo escuro.

O CSS global está em `css/style.css`, responsável por comportamento global, scrollbar, animações, tratamento responsivo de imagens/vídeos, estados de foco, filtros e regras de impressão.

---

## 🖨️ Histórico e impressão

O histórico apresenta registros de abertura e diários **em uma lista única, ordenada por data/hora** (não mais separados por tipo). Permite:

- visualizar registros;
- filtrar por tipo;
- excluir registros (com validação de PIN);
- visualizar vídeos quando disponíveis;
- imprimir o conteúdo (`@media print`).

---

## 🛠️ Tecnologias

### Frontend
- HTML5, CSS3, Tailwind CSS
- JavaScript ES Modules / Vanilla JavaScript
- `MediaRecorder API`, `MediaDevices/getUserMedia`, `Geolocation API`

### Backend
- Supabase (PostgreSQL + Storage)
- Funções PostgreSQL (`SECURITY DEFINER`) para validação de PIN
- `pg_cron` para rotina de expurgo

### Serviços externos
- Open-Meteo API para dados meteorológicos

---

## 📂 Estrutura do Projeto

```text
monitora-microvida/
│
├── index.html
├── README.md
├── .gitignore
│
├── pages/
│   ├── gigapods.html
│   ├── amphipodes.html
│   ├── tisbe.html        (planejado)
│   ├── rotiferos.html    (planejado)
│   └── nano.html         (planejado)
│
├── css/
│   └── style.css
│
├── js/
│   ├── config.js
│   ├── auth.js
│   ├── cultura.js
│   ├── clima.js
│   ├── video.js
│   ├── registros.js
│   ├── ui.js
│   └── script.js
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema_inicial.sql
│   │   ├── 002_adicionar_storage_videos.sql
│   │   ├── 003_limpeza_automatica.sql
│   │   ├── 004_seguranca_pin.sql
│   │   └── 005_reforco_storage.sql
│   ├── seed/
│   └── README.md
│
└── docs/
    ├── arquitetura.md
    ├── banco-de-dados.md
    ├── seguranca.md
    ├── roadmap.md
    └── relatorio-tecnico.md
```

---

## 🧭 Estado do Projeto

### ✅ Já estruturado / funcional

- dashboard principal e navegação entre módulos;
- identificação dinâmica da cultura;
- formulários de início e acompanhamento diário;
- validação mínima de registros;
- histórico unificado por data/hora, com filtros e impressão;
- gravação opcional de vídeo de 10 segundos;
- upload de vídeo para Supabase Storage;
- captura de temperatura ambiente;
- persistência de dados no Supabase (PostgreSQL);
- exclusão de registros (com validação de PIN);
- validação de PIN movida para funções no banco (RPC);
- rotina de expurgo automática (`pg_cron`), testada e confirmada.

### 📋 Planejado

- páginas das culturas restantes (Tisbe, Rotíferos, Nano);
- validação de PIN também no upload de vídeo (via Edge Function);
- autenticação formal (Supabase Auth), se o projeto evoluir nessa direção;
- relatórios, indicadores e dashboards;
- expansão da aplicação.

---

## ⚠️ Limitações e decisões provisórias

- Upload de vídeo não valida PIN (só restrições estruturais) — ver seção Segurança.
- Cadastro de operadores é manual, feito pelo administrador direto no Supabase.
- Páginas de Tisbe, Rotíferos e Nano ainda não existem.

---

## 📄 Licença

Projeto de uso interno em desenvolvimento. Definição de licença e eventual disponibilização externa será estabelecida em etapa posterior.
