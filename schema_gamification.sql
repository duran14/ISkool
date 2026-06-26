-- ISkool Academic Gamification and Portfolio Schema Extension
-- Database: PostgreSQL (Supabase)

-- 1. Student Stats (Experiencia, nivel, rachas y atributos de RPG para Secundaria)
/**
 * @table student_stats
 * @description Almacena las estadísticas de gamificación y progresión de nivel de un estudiante. Contiene datos de RPG (Secundaria) y financiamiento (Preparatoria).
 * @relation Vinculado a `public.students` (1:1) mediante `student_id` con cascada de eliminación.
 * @stateImpact Cargado y administrado por `useStudentStore` (`stats`, `activeStudentId`). Actualizado al ganar XP/Coins o gastar skill_points.
 */
create table public.student_stats (
  student_id uuid references public.students(id) on delete cascade primary key,
  xp integer default 0 not null check (xp >= 0),
  level integer default 1 not null check (level >= 1),
  coins integer default 0 not null check (coins >= 0),
  current_streak integer default 0 not null check (current_streak >= 0),
  max_streak integer default 0 not null check (max_streak >= 0),
  last_active_date date,
  
  -- Atributos RPG (Secundaria)
  rpg_class text check (rpg_class in ('guerrero', 'mago', 'curandero', 'explorador')),
  attribute_strength integer default 10 check (attribute_strength >= 0),
  attribute_intelligence integer default 10 check (attribute_intelligence >= 0),
  attribute_defense integer default 10 check (attribute_defense >= 0),
  skill_points integer default 0 check (skill_points >= 0),
  
  -- Financiamiento (Preparatoria)
  funding_credits integer default 1000 check (funding_credits >= 0),
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.student_stats enable row level security;

-- 2. Student Avatars (Personalización de Avatar y Mascota para Primaria Baja)
/**
 * @table student_avatars
 * @description Configuración estética del avatar del alumno (personalización) y estado de su mascota virtual (exclusivo para Primaria Baja).
 * @relation Vinculado a `public.students` (1:1) mediante `student_id` con cascada de eliminación.
 * @stateImpact Leído y modificado en `useStudentStore` mediante `changeAvatar` y actualización de mascota.
 */
create table public.student_avatars (
  student_id uuid references public.students(id) on delete cascade primary key,
  avatar_name text not null default 'Explorador',
  hair_style text not null default 'classic',
  hair_color text not null default '#4B5563',
  eyes_style text not null default 'happy',
  outfit_style text not null default 'space_suit',
  outfit_color text not null default '#3B82F6',
  background_style text not null default 'nebula',
  unlocked_items text[] default array['classic', 'happy', 'space_suit', 'nebula']::text[] not null,
  
  -- Mascota Virtual (Primaria Baja)
  pet_type text default 'dragon' check (pet_type in ('dragon', 'gatito', 'osito')),
  pet_name text default 'Chispas' not null,
  pet_hunger integer default 50 check (pet_hunger >= 0 and pet_hunger <= 100),
  pet_happiness integer default 50 check (pet_happiness >= 0 and pet_happiness <= 100),
  pet_outfit text default 'none',
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.student_avatars enable row level security;

-- 3. Badges / Insignias (Catálogo)
/**
 * @table badges
 * @description Catálogo global de insignias y medallas académicas, sociales, de persistencia y creativas.
 * @relation Referenciado por `public.student_badges` (1:N) para mapear medallas ganadas.
 * @stateImpact Listado global en la tienda de medallas de `useGamificationStore` (`badges`).
 */
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon_name text not null, -- Nombre del icono a renderizar (Lucide React)
  category text not null check (category in ('academic', 'social', 'persistence', 'creative')),
  xp_required integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.badges enable row level security;

-- 4. Student Badges (Relación de insignias obtenidas)
/**
 * @table student_badges
 * @description Relación de unión que registra qué insignias ha obtenido cada estudiante y la fecha de obtención.
 * @relation Vincula `public.students` (N:1) y `public.badges` (N:1).
 * @stateImpact Administrado y actualizado por `unlockBadge` en `useGamificationStore`.
 */
create table public.student_badges (
  student_id uuid references public.students(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (student_id, badge_id)
);

alter table public.student_badges enable row level security;

-- 5. Missions / Misiones Académicas (Narrativa de aprendizaje)
/**
 * @table missions
 * @description Misión del mapa de aprendizaje narrativo de una materia para un grado específico.
 * @relation Pertenece a `public.schools` (N:1), `public.subjects` (N:1), y `public.levels_grades` (N:1). Padre de `public.quests` (1:N).
 * @stateImpact Cargado dinámicamente mediante `fetchMissions` en `useGamificationStore` (`missions`).
 */
create table public.missions (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  level_grade_id uuid references public.levels_grades(id) on delete cascade not null,
  title text not null,
  description text not null,
  story_intro text not null, -- Texto introductorio de la narrativa
  map_position_x integer not null, -- Coordenada X para el mapa de misiones
  map_position_y integer not null, -- Coordenada Y para el mapa de misiones
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.missions enable row level security;

-- 6. Quests / Retos (Actividades dentro de una misión)
/**
 * @table quests
 * @description Reto o actividad académica (cuestionario, examen o entrega de portafolio) dentro de una misión.
 * @relation Pertenece a `public.missions` (N:1). Referenciado por `public.quest_attempts` (1:N) y `public.portfolio_items` (1:N).
 * @stateImpact Determina las preguntas, recompensas de XP/monedas y formato de evidencias renderizados en la UI.
 */
create table public.quests (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid references public.missions(id) on delete cascade not null,
  title text not null,
  description text not null,
  type text not null check (type in ('quiz', 'portfolio_submission')),
  sequence_order integer not null,
  xp_reward integer default 50 not null,
  coins_reward integer default 10 not null,
  content jsonb not null, -- Cuestionario o instrucciones de la entrega
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (mission_id, sequence_order)
);

alter table public.quests enable row level security;

-- 7. Quest Attempts (Intentos y reintentos - El error como aprendizaje)
/**
 * @table quest_attempts
 * @description Registro histórico de los intentos realizados por un estudiante para resolver un reto (quest). Permite registrar el progreso, respuestas y feedback.
 * @relation Vincula `public.students` (N:1) y `public.quests` (N:1).
 * @stateImpact Creado al completar un reto. Afecta los estados de `useGamificationStore` (`submitQuiz`, `submitExam`).
 */
create table public.quest_attempts (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete cascade not null,
  score numeric(5,2) not null, -- Puntuación obtenida (porcentaje 0.00 a 100.00)
  is_completed boolean default false not null,
  answers jsonb, -- Respuestas dadas por el alumno
  feedback text, -- Retroalimentación automática
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quest_attempts enable row level security;

-- 8. Portfolio Items (Portafolio Digital de Evidencias - Seesaw-style)
/**
 * @table portfolio_items
 * @description Portafolio digital de evidencias de aprendizaje (estilo Seesaw) donde los estudiantes suben tareas para evaluación docente.
 * @relation Vincula `public.students` (N:1), `public.subjects` (N:1), y opcionalmente `public.quests` (N:1). Padre de `public.portfolio_feedback` (1:N).
 * @stateImpact Administrado por `usePortfolioStore` (`portfolioItems`). Sujeto a políticas RLS por estudiante y por grupo para docentes.
 */
create table public.portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete set null, -- Opcional
  title text not null,
  description text,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'audio', 'video', 'pdf', 'link')),
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'approved', 'needs_revision')),
  self_reflection text, -- Reflexión del propio alumno (Autoevaluación)
  
  -- Coevaluación y Proyectos de Preparatoria
  peer_review_score numeric(3,1) check (peer_review_score >= 0.0 and peer_review_score <= 10.0),
  peer_review_comments text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_items enable row level security;

-- 9. Portfolio Feedback (Retroalimentación Formativa - Multidireccional)
/**
 * @table portfolio_feedback
 * @description Retroalimentación formativa y multidireccional (de profesores, padres o compañeros) a una evidencia del portafolio.
 * @relation Pertenece a `public.portfolio_items` (N:1). Escrito por un perfil de usuario en `public.profiles` (N:1).
 * @stateImpact Actualizado en tiempo real en la vista de evidencias en `usePortfolioStore` (`addPortfolioFeedback`).
 */
create table public.portfolio_feedback (
  id uuid default uuid_generate_v4() primary key,
  portfolio_item_id uuid references public.portfolio_items(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  author_role text not null check (author_role in ('teacher', 'parent', 'student', 'peer')),
  feedback_text text not null,
  reactions jsonb default '{}'::jsonb not null, -- Emojis de apoyo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_feedback enable row level security;

-- Seed inicial de Insignias
insert into public.badges (name, description, icon_name, category, xp_required) values
  ('Matemago de Bronce', 'Resuelve tu primera misión de Matemáticas con racha perfecta.', 'Calculator', 'academic', 100),
  ('Lector de las Galaxias', 'Sube un audio leyendo en voz alta al portafolio.', 'BookOpen', 'academic', 150),
  ('Espíritu Indomable', 'Completa un reto después de haber fallado en el primer intento.', 'Sparkles', 'persistence', 200),
  ('Creador de Universos', 'Sube una evidencia artística o dibujo digital de alta calidad.', 'Palette', 'creative', 150),
  ('Compañero Estelar', 'Realiza una coevaluación constructiva para un compañero.', 'Users', 'social', 100),
  ('Racha del Sol', 'Mantén una racha de actividad diaria de 5 días seguidos.', 'Flame', 'persistence', 300);

-- ==========================================
-- 10. Coop Parties (Sesiones Cooperativas)
-- ==========================================
create table public.coop_parties (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid references public.missions(id) on delete cascade not null,
  created_by uuid references public.students(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coop_parties enable row level security;

-- Políticas RLS para coop_parties
create policy "Permitir lectura de coop_parties a usuarios autenticados"
  on public.coop_parties for select
  to authenticated
  using (true);

create policy "Permitir a estudiantes crear su propia party"
  on public.coop_parties for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Permitir a creadores y miembros actualizar el estado de la party"
  on public.coop_parties for update
  to authenticated
  using (
    auth.uid() = created_by 
    or exists (
      select 1 from public.party_members 
      where party_members.party_id = coop_parties.id 
        and party_members.student_id = auth.uid()
    )
  );


-- ==========================================
-- 11. Party Members (Miembros de la Party)
-- ==========================================
create table public.party_members (
  party_id uuid references public.coop_parties(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (party_id, student_id)
);

alter table public.party_members enable row level security;

-- Políticas RLS para party_members
create policy "Permitir lectura de party_members a usuarios autenticados"
  on public.party_members for select
  to authenticated
  using (true);

create policy "Permitir a estudiantes unirse a una party"
  on public.party_members for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir a estudiantes salir de una party"
  on public.party_members for delete
  to authenticated
  using (auth.uid() = student_id);


-- ==========================================
-- 12. Party Actions (Acciones/Ataques en Tiempo Real)
-- ==========================================
create table public.party_actions (
  id uuid default uuid_generate_v4() primary key,
  party_id uuid references public.coop_parties(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  damage_dealt integer not null check (damage_dealt >= 0),
  action_type text not null, -- e.g., 'attack', 'heal', 'spell'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.party_actions enable row level security;

-- Políticas RLS para party_actions
create policy "Permitir lectura de party_actions a usuarios autenticados"
  on public.party_actions for select
  to authenticated
  using (true);

create policy "Permitir a miembros registrar sus propias acciones"
  on public.party_actions for insert
  to authenticated
  with check (
    auth.uid() = student_id 
    and exists (
      select 1 from public.party_members 
      where party_members.party_id = party_actions.party_id 
        and party_members.student_id = auth.uid()
    )
  );

-- Habilitar Supabase Realtime para la tabla party_actions
alter publication supabase_realtime add table public.party_actions;

-- ==========================================
-- 13. RPC Function: Join Party
-- ==========================================
create or replace function public.join_party(party_id_param uuid)
returns void as $$
declare
  v_mission_id uuid;
  v_mission_active boolean;
  v_party_status text;
  v_student_id uuid;
begin
  -- Obtener el ID del estudiante desde la sesión activa
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  -- Validar si la party existe y su estado
  select mission_id, status into v_mission_id, v_party_status
  from public.coop_parties
  where id = party_id_param;

  if not found then
    raise exception 'La sala a la que intentas unirte ya no existe o ha caducado';
  end if;

  if v_party_status != 'active' then
    raise exception 'La sala a la que intentas unirte ya no existe o ha caducado';
  end if;

  -- Validar si la misión está activa
  select is_active into v_mission_active
  from public.missions
  where id = v_mission_id;

  if not found or not v_mission_active then
    raise exception 'La misión asociada a esta sala no está activa';
  end if;

  -- Validar si el alumno ya pertenece a otra sesión activa
  if exists (
    select 1 
    from public.party_members pm
    join public.coop_parties cp on pm.party_id = cp.id
    where pm.student_id = v_student_id
      and cp.status = 'active'
      and cp.id != party_id_param
  ) then
    raise exception 'Ya perteneces a otra sesión activa de party';
  end if;

  -- Registrar al alumno en la party
  insert into public.party_members (party_id, student_id)
  values (party_id_param, v_student_id)
  on conflict (party_id, student_id) do nothing;
end;
$$ language plpgsql security definer;

