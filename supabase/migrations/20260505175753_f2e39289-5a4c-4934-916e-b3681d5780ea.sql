CREATE TABLE public.payment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  application_ref text NOT NULL DEFAULT '',
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  card_last_four text NOT NULL DEFAULT '',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payment requests"
  ON public.payment_requests FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert payment requests"
  ON public.payment_requests FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update payment requests"
  ON public.payment_requests FOR UPDATE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_requests;