
CREATE TABLE public.ai_knowledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  response text NOT NULL DEFAULT '',
  nav_buttons jsonb NOT NULL DEFAULT '[]',
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ai knowledge" ON public.ai_knowledge_entries FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert ai knowledge" ON public.ai_knowledge_entries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update ai knowledge" ON public.ai_knowledge_entries FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete ai knowledge" ON public.ai_knowledge_entries FOR DELETE TO public USING (true);
