-- ============================================
-- PAINEL DE SUGESTÕES - LASPOERJ
-- ============================================

-- Adiciona campos administrativos sem apagar dados existentes
alter table public.sugestoes
add column if not exists mensagem text;

alter table public.sugestoes
add column if not exists status text default 'nova';

alter table public.sugestoes
add column if not exists lida boolean default false;

alter table public.sugestoes
add column if not exists observacao_interna text;

alter table public.sugestoes
add column if not exists created_at timestamp with time zone default now();

alter table public.sugestoes
add column if not exists updated_at timestamp with time zone default now();

-- Normaliza registros antigos
update public.sugestoes
set status = 'nova'
where status is null or trim(status) = '';

update public.sugestoes
set lida = false
where lida is null;

-- RLS
alter table public.sugestoes enable row level security;

-- Público: pode enviar sugestões, mas não ler a tabela
drop policy if exists "Publico pode enviar sugestoes" on public.sugestoes;

create policy "Publico pode enviar sugestoes"
on public.sugestoes
for insert
to anon, authenticated
with check (true);

-- TEMPORÁRIO enquanto ainda não finalizamos os papéis de usuário
drop policy if exists "Usuarios logados podem ver sugestoes" on public.sugestoes;

create policy "Usuarios logados podem ver sugestoes"
on public.sugestoes
for select
to authenticated
using (true);

drop policy if exists "Usuarios logados podem atualizar sugestoes" on public.sugestoes;

create policy "Usuarios logados podem atualizar sugestoes"
on public.sugestoes
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Usuarios logados podem excluir sugestoes" on public.sugestoes;

create policy "Usuarios logados podem excluir sugestoes"
on public.sugestoes
for delete
to authenticated
using (true);
