
INSERT INTO storage.buckets (id, name, public) VALUES ('evaluation-reports', 'evaluation-reports', true);

CREATE POLICY "Public read access for evaluation reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'evaluation-reports');

CREATE POLICY "Staff can upload evaluation reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'evaluation-reports');
