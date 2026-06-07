alter table public.profiles
  add column if not exists education_level text,
  add column if not exists current_course text,
  add column if not exists institution_name text,
  add column if not exists current_year text,
  add column if not exists last_exam_percentage numeric,
  add column if not exists is_hosteller boolean default false;
