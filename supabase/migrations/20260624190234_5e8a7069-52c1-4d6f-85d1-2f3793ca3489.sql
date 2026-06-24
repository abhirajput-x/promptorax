
-- Lock down SECURITY DEFINER triggers/utility funcs
REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- Storage policies for prompt-images bucket
CREATE POLICY "anyone can read prompt images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'prompt-images');

CREATE POLICY "admins upload prompt images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'prompt-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update prompt images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'prompt-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete prompt images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'prompt-images' AND public.has_role(auth.uid(), 'admin'));
