# 📊 Relatório Técnico do Projeto — MonitoraMicrovida

Este documento sintetiza a arquitetura, as decisões de engenharia, a infraestrutura e a viabilidade operacional do **MonitoraMicrovida**.

---

## 1. Contexto e Problema
O cultivo e a manutenção de organismos aquáticos e plâncton (como *Tigriopus californicus*, *Tisbe biminiensis* e *Nannochloropsis*) exigem o monitoramento rigoroso de parâmetros físico-químicos e a documentação visual da densidade da cultura. O acompanhamento manual em planilhas ou cadernos físicos gera dispersão de histórico, perda de rastreabilidade e falta de padronização.

---

## 2. Solução Proposta
O **MonitoraMicrovida** resolve esse problema centralizando o registro em uma aplicação web responsiva. A solução combina a coleta estruturada de parâmetros da água (pH, amônia, nitrato, fosfato, salinidade, temperatura) com uma documentação visual em vídeo (10 segundos) persistida em nuvem.

---

## 3. Síntese da Infraestrutura e Tecnologias

```text
┌────────────────────┬────────────────────────────────────────────────┐
│ Camada             │ Tecnologias Adotadas                           │
├────────────────────┼────────────────────────────────────────────────┤
│ Frontend           │ HTML5, CSS3, Tailwind CSS, Vanilla JS (ES6)    │
│ Hardware / APIs    │ MediaRecorder API, Geolocation API, Open-Meteo │
│ Persistência Nuvem │ Supabase Client (@supabase/supabase-js)        │
│ Banco Relacional   │ PostgreSQL (Supabase)                          │
│ Storage de Mídia   │ Supabase Storage (Bucket: videos-cultivo)      │
│ Job Scheduler      │ PostgreSQL pg_cron                             │
└────────────────────┴────────────────────────────────────────────────┘
