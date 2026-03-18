
-- Client accounts table (persists signups)
CREATE TABLE public.client_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  gender text,
  app_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert client accounts" ON public.client_accounts
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can read client accounts" ON public.client_accounts
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can update client accounts" ON public.client_accounts
  FOR UPDATE TO public USING (true);

CREATE POLICY "Anyone can delete client accounts" ON public.client_accounts
  FOR DELETE TO public USING (true);

-- Client orders table (tracks reference numbers and statuses)
CREATE TABLE public.client_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  client_email text NOT NULL REFERENCES public.client_accounts(email) ON DELETE CASCADE,
  service text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested',
  staff_note text DEFAULT '',
  requirements jsonb DEFAULT '[]'::jsonb,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert client orders" ON public.client_orders
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can read client orders" ON public.client_orders
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can update client orders" ON public.client_orders
  FOR UPDATE TO public USING (true);

CREATE POLICY "Anyone can delete client orders" ON public.client_orders
  FOR DELETE TO public USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_orders;
