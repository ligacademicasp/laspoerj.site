-- ==========================================================
-- LASPOERJ - STORAGE DE FOTOS DA EQUIPE
-- Bucket esperado: equipe
-- ==========================================================
-- Antes de executar este SQL:
-- Supabase > Storage > New bucket
-- Nome: equipe
-- Public bucket: ATIVADO
-- Allowed MIME types: image/*
-- File size limit: 5 MB
--
-- O Supabase recomenda criar/modificar buckets pela API/Dashboard,
-- e usar SQL para as policies de storage.objects.

drop policy if exists "Administradores podem enviar fotos equipe"
on storage.objects;

create policy "Administradores podem enviar fotos equipe"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'equipe'
  and (select public.tem_acesso_admin())
);

drop policy if exists "Administradores podem atualizar fotos equipe"
on storage.objects;

create policy "Administradores podem atualizar fotos equipe"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'equipe'
  and (select public.tem_acesso_admin())
)
with check (
  bucket_id = 'equipe'
  and (select public.tem_acesso_admin())
);

drop policy if exists "Administradores podem excluir fotos equipe"
on storage.objects;

create policy "Administradores podem excluir fotos equipe"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'equipe'
  and (select public.tem_acesso_admin())
);

-- SELECT não é necessário para exibir imagens de um bucket público.
-- A URL pública será gerada no aplicativo com getPublicUrl().
