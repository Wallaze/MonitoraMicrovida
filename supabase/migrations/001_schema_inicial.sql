-- MonitoraMicrovida — schema inicial
-- Rodar no Supabase: painel do projeto > SQL Editor > New query > colar e "Run"

-- 1) OPERADORES
-- cada pessoa que pode registrar dados, identificada por um token/PIN de 4 dígitos
create table if not exists operadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  pin text not null unique,          -- PIN de 4 dígitos (depois avaliar hash)
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) LOTES_CULTURA
-- cada "abertura de cultura" (um lote de gigapods, amphipodes, etc)
create table if not exists lotes_cultura (
  id uuid primary key default gen_random_uuid(),
  cultura text not null check (cultura in ('gigapods','amphipodes','tisbe','rotiferos','nano')),
  identificacao text not null,       -- nome/código do lote (obrigatório no form)
  recipiente text,
  litragem numeric,
  substrato text,
  iluminacao text,
  aeracao text,
  temperatura_ambiente numeric,
  salinidade numeric,
  observacoes text,
  operador_id uuid references operadores(id),
  created_at timestamptz not null default now()
);

-- 3) REGISTROS_DIARIOS
-- acompanhamento diário de um lote já aberto
create table if not exists registros_diarios (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references lotes_cultura(id),
  temperatura_agua numeric,
  ph numeric,
  amonia numeric,
  nitrato numeric,
  fosfato numeric,
  temperatura_ambiente numeric,
  salinidade numeric,
  observacoes text,
  video_path text,                   -- caminho do arquivo no Storage, não o vídeo em si
  operador_id uuid references operadores(id),
  created_at timestamptz not null default now()
);

-- 4) Segurança (RLS) — obrigatório no Supabase, senão a tabela fica bloqueada por padrão
alter table operadores enable row level security;
alter table lotes_cultura enable row level security;
alter table registros_diarios enable row level security;

-- Política provisória: libera leitura e escrita pra quem tem a "anon key" do projeto (equivalente ao nível de proteção que você já tem hoje com o PIN no frontend). Isso NÃO é a versão final de segurança — é só pra sair do sessionStorage. Depois trocamos por policies que checam o PIN/operador de verdade.
create policy "leitura publica operadores" on operadores for select using (true);
create policy "escrita publica operadores" on operadores for insert with check (true);

create policy "leitura publica lotes" on lotes_cultura for select using (true);
create policy "escrita publica lotes" on lotes_cultura for insert with check (true);

create policy "leitura publica registros" on registros_diarios for select using (true);
create policy "escrita publica registros" on registros_diarios for insert with check (true);
