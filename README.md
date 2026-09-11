# 🌊 MonitoraMicrovida — Sistema de Monitoramento e Cultivo de Organismos Aquáticos

Aplicação web responsiva e modular destinada ao **registro, acompanhamento e monitoramento de culturas de organismos aquáticos e plâncton**, incluindo Gigapods, Amphipodes, Tisbe, Rotíferos e Nano.

O MonitoraMicrovida foi concebido inicialmente como um protótipo funcional para validar o fluxo de registro de culturas e, progressivamente, está sendo estruturado como um **sistema interno persistente**, com posterior possibilidade de evolução para uma aplicação externa multiusuário.

O sistema permite registrar informações de abertura de culturas, acompanhamento diário, parâmetros físico-químicos, observações e registros visuais em vídeo.

> **Status atual:** sistema em fase de reorganização e evolução do protótipo para uma arquitetura modular e preparada para persistência em nuvem.

---

## 🎯 Objetivo

O objetivo do MonitoraMicrovida é transformar o acompanhamento de culturas de organismos aquáticos em um processo **padronizado, rastreável e historicamente consultável**.

A aplicação busca centralizar informações que normalmente podem ficar dispersas em anotações, planilhas ou registros individuais, permitindo acompanhar a evolução de cada cultura ao longo do tempo.

Entre os objetivos do sistema estão:

* identificação individualizada de lotes/culturas;
* registro da abertura de uma nova cultura;
* acompanhamento diário;
* registro de parâmetros ambientais e físico-químicos;
* registro de observações;
* documentação visual por vídeo;
* consulta ao histórico;
* filtragem dos registros;
* impressão/exportação dos registros;
* posterior geração de indicadores e relatórios;
* persistência segura dos dados em infraestrutura de nuvem.

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

O registro de início permite documentar a abertura de uma nova cultura, incluindo informações como:

* identificação do lote/cultura;
* recipiente;
* litragem;
* substrato;
* iluminação;
* aeração;
* temperatura ambiente;
* salinidade;
* observações;
* registro visual opcional.

A identificação do lote é o campo mínimo necessário para permitir o salvamento de um registro de início.

---

### 📅 Registro diário

O módulo de acompanhamento diário permite registrar informações relacionadas à evolução de uma cultura previamente iniciada.

Entre os dados previstos estão:

* lote/cultura de referência;
* temperatura da água;
* pH;
* amônia;
* nitrato;
* fosfato;
* temperatura ambiente;
* salinidade;
* observações;
* registro visual opcional.

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

A aplicação tenta selecionar formatos compatíveis com o navegador antes de iniciar a gravação.

### Estratégia de armazenamento

O vídeo é tratado como **mídia independente dos dados textuais do registro**.

Durante a fase de protótipo, o vídeo pode permanecer temporariamente em memória ou utilizar mecanismos locais de teste.

Na arquitetura definitiva, o fluxo previsto será:

```text
Câmera
   ↓
MediaRecorder
   ↓
Blob de vídeo
   ↓
Supabase Storage
   ↓
Caminho/identificador do arquivo
   ↓
Registro no PostgreSQL
```

O banco de dados deverá armazenar a referência ao arquivo, e não o conteúdo binário do vídeo diretamente na tabela de registros.

Também serão definidos posteriormente limites de:

* duração;
* resolução;
* taxa de bits;
* tamanho máximo do arquivo;
* retenção;
* política de exclusão;
* acesso aos arquivos.

Essa estratégia busca manter a documentação visual útil sem transformar os vídeos em um consumo desnecessário de armazenamento.

---

## 🌡️ Dados ambientais

O sistema possui uma rotina de obtenção automática da temperatura ambiente.

Quando disponível, o navegador fornece a localização aproximada por meio da `Geolocation API`. Essas coordenadas são utilizadas para consultar a temperatura atual através da API **Open-Meteo**.

O valor obtido é utilizado como referência para o registro ambiental.

Caso a localização ou consulta externa não esteja disponível, o sistema possui um valor de fallback para permitir a continuidade do preenchimento.

Essa funcionalidade deverá ser posteriormente revisada para definir com maior precisão:

* política de consentimento para geolocalização;
* tratamento de falhas;
* fonte meteorológica;
* momento da captura;
* armazenamento da informação meteorológica.

---

## 🔐 Segurança

A segurança do projeto está sendo desenvolvida em etapas.

### Situação atual

O protótipo possui uma barreira de acesso por PIN implementada no frontend e utiliza `sessionStorage` para manter a autorização durante a sessão do navegador.

Essa funcionalidade deve ser entendida como **controle de interface do protótipo**, e não como mecanismo de autenticação seguro para produção.

Um PIN armazenado diretamente no JavaScript pode ser inspecionado por qualquer pessoa com acesso ao código da aplicação.

### Arquitetura planejada

Na versão persistente, a segurança deverá ser transferida para mecanismos apropriados do backend, incluindo:

* autenticação de usuários;
* autorização;
* Supabase Auth;
* Row Level Security (RLS);
* políticas de acesso ao PostgreSQL;
* políticas de acesso ao Storage;
* validação de arquivos enviados;
* limites de tamanho;
* controle de tipos MIME;
* proteção contra acesso indevido aos registros;
* controle de acesso aos vídeos.

A documentação detalhada dessa estratégia será mantida em:

```text
docs/seguranca.md
```

---

## 💾 Persistência dos dados

O protótipo possui uma estratégia de armazenamento local para permitir funcionamento e testes sem uma infraestrutura de backend configurada.

Atualmente, o armazenamento local utiliza `sessionStorage` como fallback.

Esse mecanismo é **provisório** e não deve ser considerado a solução definitiva de persistência.

A arquitetura de produção será baseada em:

```text
Frontend
   │
   ▼
Supabase Client
   │
   ├── PostgreSQL
   │      └── Dados estruturados
   │
   └── Storage
          └── Vídeos e mídias
```

O PostgreSQL será responsável pelos dados estruturados, enquanto o Storage será utilizado para arquivos de mídia.

---

## 🗄️ Banco de dados

O modelo definitivo do banco ainda está em fase de implementação.

A arquitetura planejada deverá separar os principais conceitos do sistema, incluindo:

```text
Operadores
    │
    ▼
Lotes / Culturas
    │
    ▼
Registros de acompanhamento
    │
    └──────► Mídias / Vídeos
```

Entre as entidades previstas estão:

* `operadores`;
* `lotes_cultura`;
* `registros_diarios`;
* estruturas relacionadas às mídias, quando necessário.

O modelo final, seus relacionamentos, constraints, índices, migrations e políticas de acesso serão documentados em:

```text
docs/banco-de-dados.md
```

e na documentação específica da infraestrutura:

```text
supabase/README.md
```

> **Importante:** tabelas, políticas e estruturas descritas como planejadas não devem ser interpretadas como já implementadas no protótipo atual.

---

## 🧩 Arquitetura JavaScript

O JavaScript está sendo reorganizado de um único arquivo monolítico para uma estrutura modular.

A intenção não é criar arquivos artificialmente para cada pequena função, mas separar responsabilidades que possuem comportamentos e ciclos de evolução diferentes.

A estrutura planejada é:

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

### Responsabilidades

| Arquivo        | Responsabilidade                                                 |
| -------------- | ---------------------------------------------------------------- |
| `config.js`    | Configuração e inicialização do cliente Supabase                 |
| `auth.js`      | Controle de acesso/autenticação provisória                       |
| `cultura.js`   | Identificação da cultura e gerenciamento das referências de lote |
| `clima.js`     | Data/hora e obtenção da temperatura ambiente                     |
| `video.js`     | Câmera, `MediaRecorder`, gravação e Blob de vídeo                |
| `registros.js` | Validação, construção, persistência e histórico dos registros    |
| `ui.js`        | Abas, botões, impressão e comportamento visual da interface      |
| `script.js`    | Ponto de entrada e orquestração da aplicação                     |

O `script.js` permanece como arquivo principal carregado pelas páginas, mas deixa de concentrar toda a lógica da aplicação.

Essa organização facilita:

* manutenção;
* testes;
* identificação de erros;
* evolução independente dos componentes;
* reutilização de funções;
* futura substituição do armazenamento local pelo backend;
* crescimento do sistema sem transformar um único arquivo em um bloco monolítico.

---

## 🎨 Interface

A interface utiliza HTML5 e Tailwind CSS, com identidade visual predominantemente em modo escuro.

O CSS global está localizado em:

```text
css/style.css
```

Entre suas responsabilidades estão:

* comportamento global da página;
* scrollbar;
* animações;
* tratamento responsivo de imagens e vídeos;
* apresentação dos players;
* estados de foco;
* filtros;
* regras específicas para impressão.

O CSS controla **a apresentação dos vídeos**, e não seu armazenamento.

Por exemplo, limitar a altura visual de um player não reduz o tamanho do arquivo armazenado.

A redução real do consumo de armazenamento deverá ser realizada na etapa de captura, codificação, compressão, upload e política de retenção.

---

## 🖨️ Histórico e impressão

Os registros podem ser apresentados em histórico dentro do módulo de cultivo.

O histórico permite:

* visualizar registros;
* diferenciar registros de início e registros diários;
* filtrar por tipo;
* visualizar vídeos quando disponíveis;
* consultar informações ambientais;
* consultar parâmetros físico-químicos;
* imprimir o conteúdo.

As regras específicas de impressão são implementadas através de:

```css
@media print
```

O objetivo é permitir que os dados possam ser utilizados tanto digitalmente quanto em documentação física/PDF.

---

## 🛠️ Tecnologias

### Frontend

* **HTML5**
* **CSS3**
* **Tailwind CSS**
* **JavaScript ES Modules / Vanilla JavaScript**
* **Web APIs**

### APIs do navegador

* `MediaRecorder API`
* `MediaDevices / getUserMedia`
* `Geolocation API`
* `sessionStorage`

### Backend planejado

* **Supabase**
* **PostgreSQL**
* **Supabase Storage**
* **Supabase Auth**
* **Row Level Security (RLS)**

### Serviços externos

* **Open-Meteo API** para dados meteorológicos.

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
│   ├── tisbe.html
│   ├── rotiferos.html
│   └── nano.html
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
├── assets/
│   ├── images/
│   │   ├── logo/
│   │   ├── gigapods/
│   │   ├── amphipodes/
│   │   ├── tisbe/
│   │   ├── rotiferos/
│   │   └── nano/
│   └── icons/
│
├── supabase/
│   ├── migrations/
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

## 📚 Documentação

A documentação técnica do projeto está organizada por assunto.

### Arquitetura

```text
docs/arquitetura.md
```

Descreve a organização geral do sistema, componentes, fluxo de dados e responsabilidades dos módulos.

### Banco de dados

```text
docs/banco-de-dados.md
```

Documenta o modelo de dados, tabelas, relacionamentos, constraints, migrations e estratégia de armazenamento.

### Segurança

```text
docs/seguranca.md
```

Documenta autenticação, autorização, RLS, Storage, validação, proteção de dados e riscos conhecidos.

### Roadmap

```text
docs/roadmap.md
```

Define a evolução planejada do protótipo para o sistema interno e, posteriormente, para uma possível aplicação externa.

### Relatório técnico

```text
docs/relatorio-tecnico.md
```

Consolida a especificação técnica e o contexto geral do projeto.

### Supabase

```text
supabase/README.md
```

Documenta especificamente a configuração, migrations, seed, banco de dados, Storage e demais componentes relacionados ao Supabase.

---

## 🧭 Estado do Projeto

O desenvolvimento está sendo realizado de forma incremental.

### ✅ Já estruturado / funcional no protótipo

* dashboard principal;
* páginas individuais de culturas;
* navegação entre módulos;
* identificação dinâmica da cultura;
* formulário de início de cultura;
* formulário de acompanhamento diário;
* referência de lote/cultura;
* validação mínima de registros;
* histórico;
* filtros de registros;
* impressão;
* gravação opcional de vídeo de 10 segundos;
* captura de temperatura ambiente;
* barreira de acesso por PIN;
* organização inicial do frontend;
* separação entre páginas, CSS, JavaScript, assets e documentação.

### 🔄 Em reorganização

* modularização do JavaScript;
* padronização dos módulos;
* melhoria da validação;
* tratamento adequado de erros;
* definição da persistência;
* preparação da integração com Supabase;
* organização das migrations;
* definição do modelo relacional definitivo.

### 📋 Planejado

* Supabase PostgreSQL;
* Supabase Storage para vídeos;
* autenticação adequada;
* RLS;
* controle individual de operadores;
* armazenamento persistente;
* política de retenção de vídeos;
* controle de tamanho e codificação das mídias;
* histórico persistente;
* relatórios;
* indicadores;
* dashboards;
* expansão da aplicação.

---

## 🗺️ Estratégia de evolução

O projeto segue uma estratégia incremental para evitar transformar o protótipo diretamente em uma aplicação excessivamente complexa.

### Fase 1 — Protótipo funcional

Validar:

* interface;
* formulários;
* fluxo de registro;
* gravação de vídeo;
* histórico;
* organização das culturas.

### Fase 2 — Sistema interno

Implementar:

* banco PostgreSQL;
* persistência em nuvem;
* Storage;
* autenticação;
* RLS;
* modelo relacional;
* controle de operadores;
* armazenamento adequado das mídias.

### Fase 3 — Consolidação

Adicionar:

* dashboards;
* indicadores;
* relatórios;
* filtros avançados;
* exportações;
* análise histórica;
* melhorias de auditoria e rastreabilidade.

### Fase 4 — Produto externo

Caso o sistema seja posteriormente disponibilizado externamente, avaliar:

* multiusuário;
* multi-instituição;
* isolamento de dados;
* gestão de organizações;
* infraestrutura de produção;
* observabilidade;
* políticas de privacidade;
* LGPD;
* escalabilidade;
* suporte e operação.

---

## ⚠️ Limitações e decisões provisórias

O projeto ainda não deve ser considerado uma aplicação de produção.

Alguns componentes atualmente existentes são deliberadamente provisórios, incluindo:

* autenticação por PIN no frontend;
* armazenamento local;
* ausência de backend completamente configurado;
* persistência de vídeo ainda em fase de definição;
* modelo definitivo do banco ainda em implementação.

Essas limitações são conhecidas e fazem parte da estratégia incremental de desenvolvimento.

A documentação deve sempre distinguir entre:

```text
IMPLEMENTADO
     ↓
EM IMPLEMENTAÇÃO
     ↓
PLANEJADO
```

para evitar que uma decisão arquitetural futura seja confundida com uma funcionalidade já disponível.

---

## 📌 Princípios do projeto

O desenvolvimento do MonitoraMicrovida segue alguns princípios:

1. **Simplicidade antes de complexidade**
   Implementar apenas a infraestrutura necessária para a etapa atual.

2. **Dados estruturados**
   Informações de cultivo devem ser armazenadas de maneira consistente e consultável.

3. **Mídia separada dos dados**
   Vídeos devem utilizar armazenamento de objetos, e não ser incorporados diretamente às tabelas relacionais.

4. **Segurança no backend**
   Barreiras de interface não devem ser confundidas com autenticação e autorização reais.

5. **Modularidade**
   Cada componente deve possuir responsabilidade clara.

6. **Rastreabilidade**
   Os registros devem permitir compreender a evolução de cada cultura ao longo do tempo.

7. **Economia de armazenamento**
   Registros visuais devem possuir duração, qualidade e retenção compatíveis com sua finalidade.

8. **Evolução incremental**
   O sistema deve crescer a partir de uma base funcional, evitando complexidade prematura.

---

## 📄 Licença

Projeto de uso interno em desenvolvimento.

A definição de licença, política de distribuição e eventual disponibilização externa será estabelecida em etapa posterior.
