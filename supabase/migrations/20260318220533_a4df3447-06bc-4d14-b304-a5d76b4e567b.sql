-- Reports sent from staff to clients
CREATE TABLE public.evaluation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text NOT NULL,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  evaluation_type text NOT NULL,
  report_file_url text,
  shared_to_email text,
  shared_to_edu boolean DEFAULT false,
  expiry_date timestamptz,
  access_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports by token" ON public.evaluation_reports
  FOR SELECT USING (true);

CREATE POLICY "Allow insert reports" ON public.evaluation_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update reports" ON public.evaluation_reports
  FOR UPDATE USING (true);

-- Password reset codes
CREATE TABLE public.password_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  used boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reset codes" ON public.password_reset_codes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reset codes" ON public.password_reset_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update reset codes" ON public.password_reset_codes
  FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.evaluation_reports;