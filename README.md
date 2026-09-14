# 🌊 MonitoraMicrovida — Sistema de Monitoramento e Cultivo de Organismos Aquáticos

Aplicação web responsiva e modular destinada ao **registro, acompanhamento e monitoramento de culturas de organismos aquáticos e plâncton**, incluindo Gigapods, Amphipodes, Tisbe, Rotíferos e Nano.

O MonitoraMicrovida foi concebido inicialmente como um protótipo funcional para validar o fluxo de registro de culturas e, progressivamente, consolidou-se como um **sistema interno persistente**, integrado a banco de dados relacional e armazenamento em nuvem, mantendo a possibilidade de evolução futura para uma aplicação externa multiusuário.

O sistema permite registrar informações de abertura de culturas, acompanhamento diário, parâmetros físico-químicos, observações, registros visuais em vídeo e gerenciamento do histórico com persistência remota e rotinas de automação.

> **Status atual:** Sistema em fase de produção e consolidação interna. Totalmente integrado com banco de dados PostgreSQL e Supabase Storage, operando com persistência em nuvem, fallback local e rotina de expurgo automatizado via `pg_cron`.

---

## 🎯 Objetivo

O objetivo do MonitoraMicrovida é transformar o acompanhamento de culturas de organismos aquáticos em um processo **padronizado, rastreável e historicamente consultável**.

A aplicação busca centralizar informações que normalmente podem ficar dispersas em anotações, planilhas ou registros individuais, permitindo acompanhar a evolução de cada cultura ao longo do tempo.

Entre os objetivos do sistema estão:

* identificação individualizada de lotes/culturas;
* registro da abertura de uma nova cultura (`lotes_cultura`);
* acompanhamento diário e medições físico-químicas (`registros_diarios`);
* registro de parâmetros ambientais e físico-químicos;
* registro de observações;
* documentação visual por vídeo (limitado a 10s);
* consulta e exclusão manual de histórico diretamente pela interface;
* filtragem dos registros;
* expurgo automático semestral para otimização do banco de dados;
* impressão/exportação dos registros;
* posterior geração de indicadores e relatórios;
* persistência segura dos dados em infraestrutura de nuvem (Supabase).

---

## 🚀 Funcionalidades

### 🧫 Módulos de cultivo

O sistema possui páginas específicas para diferentes culturas:

* **Gigapods** — *Tigriopus californicus*;
* **Amphipodes** — *Gammarus* spp.;
* **Tisbe** — *Tisbe biminiensis*;
* **Rotíferos**;
* **Nano** — *Nannochloropsis*.

Cada módulo utiliza a mesma estrutura funcional, mas mantém seus registros associados à cultura correspondente.

A identificação do módulo ativo é realizada dinamicamente pelo JavaScript a partir da URL da página.

---

### 📝 Registro de início de cultura

O registro de início permite documentar a abertura de uma nova cultura na tabela `lotes_cultura`, incluindo informações como:

* identificação do lote/cultura;
* recipiente;
* litragem;
* substrato;
* iluminação;
* aeração (armazenada como booleano: Ativa/Inativa);
* temperatura ambiente;
* salinidade;
* observações;
* registro visual opcional.

A identificação do lote é o campo mínimo necessário para permitir o salvamento de um registro de início.

---

### 📅 Registro diário

O módulo de acompanhamento diário permite registrar informações relacionadas à evolução de uma cultura previamente iniciada, gravadas na tabela `registros_diarios`.

Entre os dados previstos estão:

* lote/cultura de referência (`lote_id` via chave estrangeira);
* temperatura da água;
* pH;
* amônia;
* nitrato;
* fosfato;
* temperatura ambiente;
* salinidade;
* observações;
* registro visual opcional (URL pública do vídeo).

O campo de referência da cultura é utilizado para vincular o acompanhamento diário a um lote previamente registrado.

---

## 🎥 Registro em vídeo

O sistema utiliza APIs nativas do navegador para realizar a captura de vídeo diretamente pelo dispositivo.

A gravação foi projetada para ser:

* opcional;
* limitada a **10 segundos**;
* sem captura de áudio;
* compatível com câmera traseira quando disponível;
* adaptável às capacidades do navegador;
* realizada através da `MediaRecorder API`.

### Estratégia de armazenamento em Nuvem

O vídeo é enviado diretamente do navegador para a nuvem sem sobrecarregar o banco de dados relacional. O fluxo definitivo configurado e em uso no sistema é:

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
