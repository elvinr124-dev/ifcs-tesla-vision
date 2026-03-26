
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS ifcs_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS verification_source text DEFAULT '',
  ADD COLUMN IF NOT EXISTS evaluator text DEFAULT '',
  ADD COLUMN IF NOT EXISTS receipt_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS note_send_to text DEFAULT 'applicant';

ALTER TABLE public.client_orders
  ADD COLUMN IF NOT EXISTS ifcs_id text DEFAULT '';
