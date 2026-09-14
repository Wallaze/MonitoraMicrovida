---

### 3. `docs/seguranca.md`

```markdown
# 🛡️ Política de Segurança e Proteção de Dados — MonitoraMicrovida

Este documento analisa as diretrizes de segurança, controle de acessos, sanitização de dados e gerenciamento de riscos do **MonitoraMicrovida**.

---

## 🔐 Camadas de Segurança e Autenticação

### 1. Barreira de Interface no Frontend (PIN Operational)
* **Mecanismo:** Controle de acesso por senha numérica (PIN) validado via JavaScript (`js/auth.js`) e mantido na `sessionStorage` do navegador.
* **Classificação:** **Mecanismo de Usabilidade (UX Guard)**.
* **Advertência:** Não deve ser tratado como criptografia de ponta a ponta ou autenticação rígida de identidade, já que scripts client-side podem ser inspecionados no navegador.

### 2. Políctas do Backend (Supabase Row Level Security - RLS)
A verdadeira camada de segurança do sistema reside nas políticas aplicadas diretamente na infraestrutura do Supabase:

* **Tabelas Relacionais:** Acesso concedido via chave anon com restrição de schema.
* **Supabase Storage (Bucket `videos-cultivo`):**
  * **Permissão de Leitura:** Pública (Public Bucket) para permitir a exibição nos cards do histórico.
  * **Permissão de Gravação (`INSERT`):** Restrita ao formato e tamanho do Bucket `videos-cultivo`.

---

## 🚨 Validação e Sanitização de Entrada

Para prevenir falhas de estouro de memória ou envio de arquivos nocivos:

1. **Restrição de Tipo MIME:** O envio de arquivos de mídia pelo frontend é validado para aceitar estritamente arquivos `video/webm` ou `video/mp4`.
2. **Duração Máxima de Vídeo:** A `MediaRecorder API` (`js/video.js`) possui uma trava via `setTimeout` que encerra obrigatoriamente a gravação aos **10 segundos**.
3. **Tratamento de SQL Injection:** A comunicação via SDK do Supabase utiliza rotas parametrizadas (PostgREST), anulando vulnerabilidades clássicas de injeção de SQL.

---

## 🎯 Roadmap de Evolução da Segurança

Na evolução para uso multiusuário/externo, o sistema implementará:
* **Supabase Auth:** Substituição do PIN por autenticação real via e-mail/senha com tokens `JWT`.
* **Private Buckets & Signed URLs:** Transição dos vídeos públicos para links temporários e assinados individualmente por operador.
