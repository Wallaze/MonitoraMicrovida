# 🌊 Sistema de Monitoramento e Cultivo de Organismos Aquáticos
> **Academia do Aquário** — Documentação e Guia do Sistema

Aplicação web responsiva desenvolvida para o acompanhamento diário, controle de parâmetros físico-químicos e registro visual de cultivos de organismos aquáticos (como copépodes *Tigriopus californicus* / Gigapods).

O sistema funciona de maneira *client-side* e autônoma, permitindo a captura automática de condições ambientais, gravação de microvídeos de bancada, persistência local e geração de relatórios.

---

## 🚀 Funcionalidades do Sistema

* **Captura Automática de Metadados**:
  * Preenchimento automático da data e hora no padrão `datetime-local`.
  * Consulta à API do Open-Meteo via `Geolocation API` para registrar a temperatura ambiente local em tempo real.
* **Navegação em Abas (Início de Lote vs. Anotação Diária)**:
  * **Início de Cultura**: Cadastro do nome da cultura, tipo de recipiente, litragem, iluminação, aeração e substrato.
  * **Anotação Diária**: Acompanhamento dinâmico atrelado ao lote cadastrado, permitindo registrar temperatura da água, pH, salinidade e nutrientes ($\text{NH}_3$, $\text{NO}_3$, $\text{PO}_4$).
* **Gravação de Vídeo de Bancada (MediaRecorder API)**:
  * Gravador integrado de 10 segundos com a câmera traseira do dispositivo (`facingMode: "environment"`).
  * Conversão do vídeo para Base64 para exibição e armazenamento local.
* **Persistência de Dados (LocalStorage)**:
  * Armazenamento e renderização do histórico em ordem cronológica inversa (mais recentes primeiro).
  * Isolamento de histórico por página/espécie (ex: `index.html` vs. `gigapods.html`).
* **Filtros e Relatório para Impressão (PDF)**:
  * Filtro rápido do histórico por categoria (*Início* ou *Diária*).
  * Estilização otimizada para impressão via `window.print()`, ocultando controles da interface, botões de ação e players de vídeo.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5**: Formulários semânticos e captura de câmera.
* **Tailwind CSS**: Estilização base responsiva com tema escuro (*Dark Mode*).
* **CSS3 Customizado (`style.css`)**: Animações, scrollbar customizada e regras de impressão (`@media print`).
* **JavaScript ES6+ Vanilla (`script.js`)**: Lógica do sistema, manipuladores do DOM, LocalStorage e APIs nativas do navegador.
* **Open-Meteo API**: Serviço de previsão do tempo sem necessidade de chave de API.

---

## 📂 Estrutura de Arquivos

```text
/
├── index.html         # Painel geral de monitoramento e cultivo
├── gigapods.html      # Painel dedicado para o cultivo de Gigapods
├── style.css          # Estilos compartilhados, scrollbar e regras de impressão (@media print)
├── script.js          # Lógica completa (Clima, Câmera, LocalStorage, Histórico)
└── README.md          # Documentação oficial do projeto
