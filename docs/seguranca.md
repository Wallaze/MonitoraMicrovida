# 🛡️ Política de Segurança e Proteção de Dados — MonitoraMicrovida

Este documento analisa as diretrizes de segurança, controle de acessos, sanitização de dados e gerenciamento de riscos do **MonitoraMicrovida**.

---

## 🔐 Camadas de Segurança e Autenticação

### 1. Sessão do Operador (PIN)
* **Mecanismo:** PIN de operador coletado via JavaScript (`js/auth.js`) e mantido em memória (variável JS) durante a sessão do navegador — não persiste em `sessionStorage` nem em disco.
* **Classificação:** identificação do operador para fins de auditoria (`operador_id` gravado em cada registro), não uma camada de acesso por si só.

### 2. Validação Real — Funções PostgreSQL (SECURITY DEFINER)
A camada de segurança efetiva está no banco, não no frontend:
* Row Level Security (RLS) está habilitado e **fechado** para insert/delete direto em `operadores`, `lotes_cultura` e `registros_diarios` via chave anon.
* Toda escrita passa obrigatoriamente pelas funções `criar_lote`, `criar_registro_diario`, `deletar_lote`, `deletar_registro_diario` — cada uma valida o PIN contra a tabela `operadores` **dentro do banco** antes de executar qualquer INSERT/DELETE.
* PIN incorreto → `RAISE EXCEPTION`, nenhuma escrita ocorre.

### 3. Supabase Storage (Bucket `videos-cultivo`)
* **Leitura:** pública (necessário para exibir vídeos no histórico).
* **Gravação (`INSERT`):** restrita por cultura válida, extensão de vídeo e tamanho máximo (20MB) — **não valida PIN**. Essa é uma limitação conhecida: o Storage do Supabase não roda dentro das mesmas funções de validação usadas nas tabelas. Fechar esse ponto exigiria uma Edge Function dedicada, ainda não implementada.

---

## 🚨 Validação e Sanitização de Entrada

Para prevenir falhas de estouro de memória ou envio de arquivos nocivos:

1. **Restrição de Tipo MIME:** O envio de arquivos de mídia pelo frontend é validado para aceitar estritamente arquivos `video/webm` ou `video/mp4`.
2. **Duração Máxima de Vídeo:** A `MediaRecorder API` (`js/video.js`) possui uma trava via `setTimeout` que encerra obrigatoriamente a gravação aos **10 segundos**.
3. **Tratamento de SQL Injection:** A comunicação via SDK do Supabase utiliza rotas parametrizadas (PostgREST), anulando vulnerabilidades clássicas de injeção de SQL.

---

## 🎯 Roadmap de Evolução da Segurança

Na evolução para uso multiusuário/externo, o sistema pode implementar:
* **Supabase Auth:** substituição do PIN por autenticação real via e-mail/senha com tokens JWT.
* **Edge Function para Storage:** validação de PIN também no upload de vídeo.
* **Private Buckets & Signed URLs:** transição dos vídeos públicos para links temporários assinados por operador.
