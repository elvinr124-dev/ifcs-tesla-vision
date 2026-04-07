
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'Dobbs Ferry, NY',
  type TEXT NOT NULL DEFAULT 'Full-time',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active jobs" ON public.job_listings FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert jobs" ON public.job_listings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update jobs" ON public.job_listings FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete jobs" ON public.job_listings FOR DELETE TO public USING (true);

CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE NOT NULL,
  applicant_email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  zip TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  resume_url TEXT,
  cover_letter_url TEXT,
  education TEXT NOT NULL DEFAULT '',
  work_experience TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  languages TEXT NOT NULL DEFAULT '',
  how_heard TEXT NOT NULL DEFAULT '',
  referred_by_employee BOOLEAN DEFAULT false,
  start_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read job applications" ON public.job_applications FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert job applications" ON public.job_applications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update job applications" ON public.job_applications FOR UPDATE TO public USING (true);

INSERT INTO public.job_listings (title, description, requirements, location, type) VALUES
('Junior Evaluator', 'Assist senior evaluators in reviewing and analyzing international academic credentials. Research foreign educational institutions, verify documents, and prepare preliminary evaluation reports under supervision. This role offers hands-on training in credential evaluation methodology and international education systems.', 'Bachelor''s degree required. Strong attention to detail and analytical skills. Interest in international education. Proficiency in Microsoft Office. Ability to work in a team environment. Multilingual ability is a plus.', 'Dobbs Ferry, NY', 'Full-time'),
('Office Assistant', 'Provide essential administrative support to the IFCS team including managing incoming mail and document processing, answering phone inquiries, scheduling appointments, and maintaining organized filing systems. Assist with data entry and client communications to ensure smooth daily operations.', 'High school diploma or equivalent required. Strong organizational and communication skills. Proficiency in Microsoft Office Suite. Ability to multitask and prioritize. Customer service experience preferred. Bilingual ability is a plus.', 'Dobbs Ferry, NY', 'Full-time'),
('Verification Specialist', 'Conduct thorough verification of international academic documents by contacting foreign institutions, embassies, and educational authorities. Manage verification correspondence, track verification statuses, and maintain detailed records. Ensure document authenticity and support the evaluation team with verified credential information.', 'Bachelor''s degree preferred. Excellent written and verbal communication skills. Experience with document verification or records management. Strong research abilities. Attention to detail and ability to manage multiple verifications simultaneously. Foreign language skills highly valued.', 'Dobbs Ferry, NY', 'Full-time');
