-- Create contracts storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  true,
  10485760,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for contracts bucket
CREATE POLICY "contracts_insert" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "contracts_select" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "contracts_update" ON storage.objects
FOR UPDATE TO anon, authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "contracts_delete" ON storage.objects
FOR DELETE TO anon, authenticated
USING (bucket_id = 'contracts');
