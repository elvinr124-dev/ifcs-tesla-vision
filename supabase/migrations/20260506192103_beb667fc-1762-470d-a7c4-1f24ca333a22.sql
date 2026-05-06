ALTER TABLE public.client_orders ADD COLUMN IF NOT EXISTS private_note text NOT NULL DEFAULT '';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS private_note text NOT NULL DEFAULT '';