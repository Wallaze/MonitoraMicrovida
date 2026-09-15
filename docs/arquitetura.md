# 🏛️ Arquitetura do Sistema — MonitoraMicrovida

Este documento especifica a engenharia de software, a organização de componentes, o fluxo de dados e as decisões arquiteturais do **MonitoraMicrovida**.

---

## 📄 Visão Geral & Modelo C4 (Contêineres)

O sistema adota uma arquitetura em camadas baseada no padrão **SPA (Single Page Application) leve**, sem o uso de frameworks pesados, consumindo serviços BaaS (Backend-as-a-Service) disponibilizados pelo Supabase.

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT / BROWSER                        │
│                                                                 │
│ HTML5 / Tailwind CSS (Interface Global)                         │
│   │                                                             │
│   ▼                                                             │
│ JavaScript ES Modules (js/*.js)                                 │
│   ├── UI / DOM Handlers (ui.js, cultura.js)                     │
│   ├── Hardware / APIs (video.js, clima.js)                      │
│   └── Data Layer & State (registros.js)                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ (HTTPS / REST / PostgREST)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               SUPABASE INFRASTRUCTURE                               │
│                                                                                     │
│ ├── Supabase Client (@supabase/supabase-js)                                         │
│ ├── PostgreSQL Database (operadores, lotes_cultura, registros_diarios)              │
│ └── Supabase Storage (Bucket: videos-cultivo)                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
