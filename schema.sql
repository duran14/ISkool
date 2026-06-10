-- ISkool Academic Module Schema
-- Database: PostgreSQL (Supabase)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('superadmin', 'admin', 'director', 'coordinator', 'teacher', 'student', 'parent')),
  email text unique not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- 2. Schools / Planteles
create table public.schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  cct text unique, -- Clave de Centro de Trabajo (SEP)
  address text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.schools enable row level security;

-- 3. Academic Years (Ciclos Escolares)
create table public.academic_years (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  name text not null, -- e.g., "2025-2026"
  start_date date not null,
  end_date date not null,
  is_active boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.academic_years enable row level security;

-- 4. Bimonthly Periods (Bimestres)
create table public.academic_periods (
  id uuid default uuid_generate_v4() primary key,
  academic_year_id uuid references public.academic_years(id) on delete cascade not null,
  name text not null, -- e.g., "Bimestre 1", "Bimestre 2"
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.academic_periods enable row level security;

-- 5. Levels and Grades (e.g. Primaria -> 1o, 2o, 3o)
create table public.levels_grades (
  id uuid default uuid_generate_v4() primary key,
  level_name text not null check (level_name in ('primaria', 'secundaria', 'preparatoria')),
  grade_name text not null, -- e.g., "1º", "2º", "3º"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.levels_grades enable row level security;

-- 6. Groups / Salones (e.g. Primaria 1º A)
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  level_grade_id uuid references public.levels_grades(id) on delete cascade not null,
  academic_year_id uuid references public.academic_years(id) on delete cascade not null,
  name text not null, -- e.g., "A", "B"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.groups enable row level security;

-- 7. Subjects / Materias
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  level_grade_id uuid references public.levels_grades(id) on delete cascade not null,
  name text not null, -- e.g., "Matemáticas I"
  sep_code text, -- Official SEP code if applicable
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subjects enable row level security;

-- 8. Student Profiles (linked to profiles table)
create table public.students (
  id uuid references public.profiles(id) on delete cascade primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  curp text unique,
  birth_date date,
  enrollment_id text unique, -- Matrícula interna
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.students enable row level security;

-- 9. Parent-Student Relationship
create table public.parent_student (
  parent_id uuid references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  relationship text not null, -- e.g., "Padre", "Madre", "Tutor"
  primary key (parent_id, student_id)
);

-- 10. Enrollments (maps students to a group for a specific academic year)
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.enrollments enable row level security;

-- 11. Teacher Assignments
create table public.teacher_assignments (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.teacher_assignments enable row level security;

-- 12. Attendance (Asistencia Diaria)
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade, -- null if general school attendance
  date date not null default current_date,
  status text not null check (status in ('presente', 'falta', 'retardo', 'justificado')),
  comments text,
  registered_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.attendance enable row level security;

-- 13. Grades (Calificaciones)
create table public.grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  period_id uuid references public.academic_periods(id) on delete cascade not null,
  score numeric(3,1) not null check (score >= 5.0 and score <= 10.0),
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.grades enable row level security;

-- Insert initial levels and grades
insert into public.levels_grades (level_name, grade_name) values
  ('primaria', '1º'), ('primaria', '2º'), ('primaria', '3º'), 
  ('primaria', '4º'), ('primaria', '5º'), ('primaria', '6º'),
  ('secundaria', '1º'), ('secundaria', '2º'), ('secundaria', '3º'),
  ('preparatoria', '1º Semestre'), ('preparatoria', '2º Semestre'), 
  ('preparatoria', '3º Semestre'), ('preparatoria', '4º Semestre'), 
  ('preparatoria', '5º Semestre'), ('preparatoria', '6º Semestre');
