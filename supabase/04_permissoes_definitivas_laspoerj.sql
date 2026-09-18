-- ==========================================================
-- LASPOERJ - PERMISSÕES DEFINITIVAS DO PAINEL
-- Administrador + Orientador = acesso administrativo
-- Ligante = sem acesso administrativo
-- ==========================================================

-- IMPORTANTE:
-- Execute somente depois de confirmar que pelo menos um profile
-- está com:
-- tipo_usuario = 'administrador' (ou 'orientador')
-- ativo = true

-- ----------------------------------------------------------
-- 1. FUNÇÃO CENTRAL DE AUTORIZAÇÃO
-- ----------------------------------------------------------

create or replace function public.tem_acesso_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.ativo = true
      and p.tipo_usuario in ('administrador', 'orientador')
  );
$$;

revoke all on function public.tem_acesso_admin() from public;
grant execute on function public.tem_acesso_admin() to authenticated;


-- ----------------------------------------------------------
-- 2. PROFILES
-- ----------------------------------------------------------

alter table public.profiles enable row level security;

grant select, update
on table public.profiles
to authenticated;

drop policy if exists "Usuarios logados podem ver profiles"
on public.profiles;

drop policy if exists "Usuarios logados podem atualizar profiles"
on public.profiles;

drop policy if exists "Usuario pode ver proprio profile"
on public.profiles;

drop policy if exists "Administradores podem ver profiles"
on public.profiles;

drop policy if exists "Administradores podem atualizar profiles"
on public.profiles;

create policy "Usuario pode ver proprio profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);

create policy "Administradores podem ver profiles"
on public.profiles
for select
to authenticated
using (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem atualizar profiles"
on public.profiles
for update
to authenticated
using (
  (select public.tem_acesso_admin())
)
with check (
  (select public.tem_acesso_admin())
);


-- ----------------------------------------------------------
-- 3. EVENTOS
-- ----------------------------------------------------------

alter table public.eventos enable row level security;

grant select on table public.eventos to anon;
grant select, insert, update, delete
on table public.eventos
to authenticated;

drop policy if exists "Publico pode ver eventos publicados"
on public.eventos;

drop policy if exists "Usuarios logados podem criar eventos"
on public.eventos;

drop policy if exists "Usuarios logados podem editar eventos"
on public.eventos;

drop policy if exists "Usuarios logados podem excluir eventos"
on public.eventos;

drop policy if exists "Administradores podem ver todos eventos"
on public.eventos;

drop policy if exists "Administradores podem criar eventos"
on public.eventos;

drop policy if exists "Administradores podem editar eventos"
on public.eventos;

drop policy if exists "Administradores podem excluir eventos"
on public.eventos;

create policy "Publico pode ver eventos publicados"
on public.eventos
for select
to anon, authenticated
using (
  publicado = true
);

create policy "Administradores podem ver todos eventos"
on public.eventos
for select
to authenticated
using (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem criar eventos"
on public.eventos
for insert
to authenticated
with check (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem editar eventos"
on public.eventos
for update
to authenticated
using (
  (select public.tem_acesso_admin())
)
with check (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem excluir eventos"
on public.eventos
for delete
to authenticated
using (
  (select public.tem_acesso_admin())
);


-- ----------------------------------------------------------
-- 4. AVISOS
-- ----------------------------------------------------------

alter table public.avisos enable row level security;

grant select on table public.avisos to anon;
grant select, insert, update, delete
on table public.avisos
to authenticated;

drop policy if exists "Publico pode ver avisos publicados"
on public.avisos;

drop policy if exists "Usuarios logados podem criar avisos"
on public.avisos;

drop policy if exists "Usuarios logados podem editar avisos"
on public.avisos;

drop policy if exists "Usuarios logados podem excluir avisos"
on public.avisos;

drop policy if exists "Administradores podem ver todos avisos"
on public.avisos;

drop policy if exists "Administradores podem criar avisos"
on public.avisos;

drop policy if exists "Administradores podem editar avisos"
on public.avisos;

drop policy if exists "Administradores podem excluir avisos"
on public.avisos;

create policy "Publico pode ver avisos publicados"
on public.avisos
for select
to anon, authenticated
using (
  publicado = true
  and publico = 'todos'
  and (
    data_expiracao is null
    or data_expiracao >= current_date
  )
);

create policy "Administradores podem ver todos avisos"
on public.avisos
for select
to authenticated
using (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem criar avisos"
on public.avisos
for insert
to authenticated
with check (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem editar avisos"
on public.avisos
for update
to authenticated
using (
  (select public.tem_acesso_admin())
)
with check (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem excluir avisos"
on public.avisos
for delete
to authenticated
using (
  (select public.tem_acesso_admin())
);


-- ----------------------------------------------------------
-- 5. JORNAL / PUBLICAÇÕES
-- ----------------------------------------------------------

alter table public.publicacoes enable row level security;

grant select on table public.publicacoes to anon;
grant select, insert, update, delete
on table public.publicacoes
to authenticated;

drop policy if exists "Publico pode ver publicacoes"
on public.publicacoes;

drop policy if exists "Usuarios logados podem criar publicacoes"
on public.publicacoes;

drop policy if exists "Usuarios logados podem editar publicacoes"
on public.publicacoes;

drop policy if exists "Usuarios logados podem excluir publicacoes"
on public.publicacoes;

drop policy if exists "Administradores podem ver todas publicacoes"
on public.publicacoes;

drop policy if exists "Administradores podem criar publicacoes"
on public.publicacoes;

drop policy if exists "Administradores podem editar publicacoes"
on public.publicacoes;

drop policy if exists "Administradores podem excluir publicacoes"
on public.publicacoes;

create policy "Publico pode ver publicacoes"
on public.publicacoes
for select
to anon, authenticated
using (
  publicado = true
);

create policy "Administradores podem ver todas publicacoes"
on public.publicacoes
for select
to authenticated
using (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem criar publicacoes"
on public.publicacoes
for insert
to authenticated
with check (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem editar publicacoes"
on public.publicacoes
for update
to authenticated
using (
  (select public.tem_acesso_admin())
)
with check (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem excluir publicacoes"
on public.publicacoes
for delete
to authenticated
using (
  (select public.tem_acesso_admin())
);


-- ----------------------------------------------------------
-- 6. SUGESTÕES
-- ----------------------------------------------------------

alter table public.sugestoes enable row level security;

grant insert on table public.sugestoes to anon;
grant insert, select, update, delete
on table public.sugestoes
to authenticated;

drop policy if exists "Publico pode enviar sugestoes"
on public.sugestoes;

drop policy if exists "Usuario logado pode enviar sugestoes"
on public.sugestoes;

drop policy if exists "Usuarios logados podem ver sugestoes"
on public.sugestoes;

drop policy if exists "Usuarios logados podem atualizar sugestoes"
on public.sugestoes;

drop policy if exists "Usuarios logados podem excluir sugestoes"
on public.sugestoes;

drop policy if exists "Administradores podem ver sugestoes"
on public.sugestoes;

drop policy if exists "Administradores podem atualizar sugestoes"
on public.sugestoes;

drop policy if exists "Administradores podem excluir sugestoes"
on public.sugestoes;

create policy "Publico pode enviar sugestoes"
on public.sugestoes
for insert
to anon, authenticated
with check (true);

create policy "Administradores podem ver sugestoes"
on public.sugestoes
for select
to authenticated
using (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem atualizar sugestoes"
on public.sugestoes
for update
to authenticated
using (
  (select public.tem_acesso_admin())
)
with check (
  (select public.tem_acesso_admin())
);

create policy "Administradores podem excluir sugestoes"
on public.sugestoes
for delete
to authenticated
using (
  (select public.tem_acesso_admin())
);


-- ----------------------------------------------------------
-- 7. TESTE DO USUÁRIO LOGADO
-- ----------------------------------------------------------
-- Esse SELECT pode ser usado depois pelo aplicativo.
-- No SQL Editor, auth.uid() normalmente não representa a sessão
-- do navegador, então o resultado ali não serve como teste de login.
