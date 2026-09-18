-- ==========================================================
-- LASPOERJ - STORAGE DE IMAGENS DO JORNAL
-- Bucket esperado: jornal
-- ==========================================================
-- Antes de executar:
-- Supabase > Storage > New bucket
-- Nome: jornal
-- Public bucket: ATIVADO
-- Allowed MIME types: image/*
-- File size limit: 8 MB

drop policy if exists "Administradores podem enviar imagens jornal"
on storage.objects;

create policy "Administradores podem enviar imagens jornal"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'jornal'
  and (select public.tem_acesso_admin())
);

drop policy if exists "Administradores podem atualizar imagens jornal"
on storage.objects;

create policy "Administradores podem atualizar imagens jornal"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'jornal'
  and (select public.tem_acesso_admin())
)
with check (
  bucket_id = 'jornal'
  and (select public.tem_acesso_admin())
);

drop policy if exists "Administradores podem excluir imagens jornal"
on storage.objects;

create policy "Administradores podem excluir imagens jornal"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'jornal'
  and (select public.tem_acesso_admin())
);
