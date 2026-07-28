-- 1. Create the form_config table to store the Google-Forms-style layout
CREATE TABLE IF NOT EXISTS public.form_config (
    id integer PRIMARY KEY DEFAULT 1,
    schema jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add Row Level Security (RLS) to form_config so anyone can read the form to fill it out
ALTER TABLE public.form_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.form_config
    AS PERMISSIVE FOR SELECT
    TO public
    USING (true);

-- Allow updates (in a real app you'd restrict this to authenticated admins, 
-- but we are doing frontend-only auth right now)
CREATE POLICY "Enable update for all users" ON public.form_config
    AS PERMISSIVE FOR ALL
    TO public
    USING (true);

-- 3. Insert the default form schema (matching your current form perfectly!)
INSERT INTO public.form_config (id, schema) 
VALUES (
  1, 
  '[
    {"id": "name", "type": "short_text", "label": "Name", "placeholder": "e.g. Alex Doe", "required": true},
    {"id": "whatsapp_number", "type": "short_text", "label": "WhatsApp Number", "placeholder": "e.g. +91 98XXXXXX21", "required": true},
    {"id": "college_email", "type": "short_text", "label": "College email id", "placeholder": "e.g. al****23@mitwpu.edu.in", "required": true},
    {"id": "prn", "type": "short_text", "label": "PRN", "placeholder": "e.g. 1032XXXXXX", "required": true},
    {"id": "year_studying", "type": "select", "label": "Year Studying in", "options": ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Other"], "required": true},
    {"id": "course", "type": "short_text", "label": "Course studying in", "placeholder": "e.g. B.Tech Computer Science", "required": true},
    {"id": "department", "type": "select", "label": "Department you are interest in", "options": ["Events and Ops", "Production", "Media", "Social media and marketing", "Sponsorship", "Technical", "Design", "Content creation"], "required": true},
    {"id": "recommended_by", "type": "short_text", "label": "Recommended by", "placeholder": "e.g. Senior Name, Instagram, etc.", "required": false},
    {"id": "past_experience", "type": "long_text", "label": "Any past experience for the selected department", "placeholder": "Describe your relevant projects, work experience, or past events...", "required": true}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. Alter the registrations table to accept dynamic custom fields
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS dynamic_responses jsonb DEFAULT '{}'::jsonb;
