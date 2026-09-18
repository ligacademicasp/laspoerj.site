-- ============================================
-- PERFIS - ACESSO DO PAINEL DE USUÁRIOS
-- LASPOERJ
-- ============================================

alter table public.profiles
enable row level security;

grant select, update
on table public.profiles
to authenticated;

-- TEMPORÁRIO:
-- enquanto ainda estamos montando a trava definitiva por função.
drop policy if exists "Usuarios logados podem ver profiles"
on public.profiles;

create policy "Usuarios logados podem ver profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Usuarios logados podem atualizar profiles"
on public.profiles;

create policy "Usuarios logados podem atualizar profiles"
on public.profiles
for update
to authenticated
using (true)
with check (true);
