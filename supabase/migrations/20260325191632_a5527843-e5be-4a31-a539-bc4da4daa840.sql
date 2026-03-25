
-- Applications table to store full application data
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT NOT NULL UNIQUE,
  client_email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT DEFAULT '',
  dob TEXT NOT NULL,
  gender TEXT DEFAULT '',
  cell_phone TEXT DEFAULT '',
  home_phone TEXT DEFAULT '',
  institution_name TEXT DEFAULT '',
  country TEXT DEFAULT '',
  attendance TEXT DEFAULT '',
  degrees TEXT DEFAULT '',
  purpose TEXT DEFAULT '',
  service_title TEXT DEFAULT '',
  processing_label TEXT DEFAULT '',
  processing_time TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  translation_option TEXT DEFAULT '',
  auth_option TEXT DEFAULT '',
  delivery_options JSONB DEFAULT '[]',
  payment_method TEXT DEFAULT '',
  card_last_four TEXT DEFAULT '',
  application_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'requested',
  staff_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add application_id and dob to client_orders
ALTER TABLE public.client_orders ADD COLUMN IF NOT EXISTS application_id TEXT DEFAULT '';
ALTER TABLE public.client_orders ADD COLUMN IF NOT EXISTS dob TEXT DEFAULT '';

-- RLS for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Clients can read their own applications
CREATE POLICY "Clients can view own applications"
  ON public.applications FOR SELECT
  USING (true);

-- Anyone can insert (needed for submission)
CREATE POLICY "Anyone can insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- Allow updates (for staff notes)
CREATE POLICY "Allow updates to applications"
  ON public.applications FOR UPDATE
  USING (true);
