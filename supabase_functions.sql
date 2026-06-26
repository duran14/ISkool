-- Database: PostgreSQL (Supabase)
-- Target: Functions to be deployed to Supabase to run critical business logic on the backend.

-- 1. Schema Extensions for Gamification features not fully detailed in schema_gamification.sql

/**
 * @table shop_artifacts
 * @description Catálogo de objetos mágicos y artefactos de la tienda del alumno (e.g. Botas de velocidad, Escudo protector).
 * @relation Referenciado en `public.student_inventory` (1:N) como catálogo de ítems adquiribles.
 * @stateImpact Cargado en la tienda de `useGamificationStore` (`artifacts`).
 */
create table if not exists public.shop_artifacts (
  id text primary key,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

/**
 * @table student_inventory
 * @description Inventario de artefactos mágicos comprados por cada estudiante.
 * @relation Vincula `public.students` (N:1) y `public.shop_artifacts` (N:1).
 * @stateImpact Actualizado tras una compra exitosa mediante RPC en `useStudentStore` / `useGamificationStore` (`inventory`).
 */
create table if not exists public.student_inventory (
  student_id uuid references public.students(id) on delete cascade not null,
  artifact_id text references public.shop_artifacts(id) on delete cascade not null,
  acquired_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (student_id, artifact_id)
);

/**
 * @table student_messages
 * @description Buzón de mensajes y notificaciones del sistema de gamificación para el alumno (e.g. notificaciones de compra, revocaciones).
 * @relation Vinculado a `public.students` (N:1) mediante `student_id`.
 * @stateImpact Leído y gestionado en `useStudentStore` (`messages`).
 */
create table if not exists public.student_messages (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  title text not null,
  message text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false not null,
  type text check (type in ('standard', 'revocation', 'purchase')),
  revoked_artifact text,
  reason text
);

alter table public.shop_artifacts enable row level security;
alter table public.student_inventory enable row level security;
alter table public.student_messages enable row level security;

create policy "Permitir lectura de shop_artifacts a usuarios autenticados"
  on public.shop_artifacts for select
  to authenticated
  using (true);

create policy "Permitir lectura de student_inventory a alumnos dueños"
  on public.student_inventory for select
  to authenticated
  using (auth.uid() = student_id);

create policy "Permitir insercion de student_inventory a alumnos dueños"
  on public.student_inventory for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Permitir lectura de student_messages a alumnos dueños"
  on public.student_messages for select
  to authenticated
  using (auth.uid() = student_id);

create policy "Permitir actualizacion de student_messages a alumnos dueños"
  on public.student_messages for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);


-- Seed initial shop artifacts if table is empty
insert into public.shop_artifacts (id, name, description, price, icon)
values 
  ('art-boots', 'Botas de Velocidad Escolar', 'Añade una oportunidad extra de reintento en el próximo examen.', 25, 'Footprints'),
  ('art-shield', 'Escudo Protector de Promedios', 'Protege tus puntos de racha en caso de inactividad de un día.', 40, 'Shield'),
  ('art-elixir', 'Elixir del Fénix Sabio', 'Restaura el 100% de la felicidad y salud de tu mascota de rol.', 15, 'GlassWater'),
  ('art-wand', 'Varita de la Clarividencia', 'Revela una pista adicional en cualquier reto de opción múltiple.', 35, 'Wand2')
on conflict (id) do nothing;


-- 2. PostgreSQL Functions (RPC Calls)

---------------------------------------------------------
-- RPC: submit_quiz
-- Handles scoring, calculations for XP and Coins, levels up, streak updates, and records the attempt.
---------------------------------------------------------
/**
 * @function submit_quiz
 * @description Procesa la entrega de un reto de tipo cuestionario. Calcula el puntaje, otorga XP y monedas (con bono por puntaje perfecto), actualiza la racha diaria de actividad, procesa las subidas de nivel (otorgando skill points si corresponde), registra el intento en `quest_attempts` y verifica/desbloquea insignias especiales (como el Matemago).
 * @param {uuid} p_student_id - ID del estudiante que realiza la entrega (referencia a `public.students.id`).
 * @param {uuid} p_quest_id - ID del reto cuestionario completado (referencia a `public.quests.id`).
 * @param {numeric} p_score - Puntuación obtenida como porcentaje (0.00 a 100.00).
 * @param {jsonb} p_answers - Respuestas enviadas por el estudiante.
 * @returns {jsonb} Payload con el ID del intento creado, XP ganado, monedas ganadas, booleano de subida de nivel, feedback formateado, nuevas estadísticas globales del estudiante y detalles de cualquier insignia ganada.
 * @stateImpact Invocado por `submitQuiz` en `useGamificationStore`. Actualiza los stats locales del alumno en `useStudentStore`.
 */
create or replace function public.submit_quiz(
  p_student_id uuid,
  p_quest_id uuid,
  p_score numeric,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_xp_reward integer;
  v_coins_reward integer;
  v_xp_earned integer;
  v_coins_earned integer;
  v_subject_id uuid;
  
  -- Student stats
  v_current_xp integer;
  v_current_coins integer;
  v_level integer;
  v_skill_points integer;
  v_current_streak integer;
  v_max_streak integer;
  v_last_active date;
  v_today date := current_date;
  
  v_xp_for_next_level integer;
  v_leveled_up boolean := false;
  v_feedback text;
  v_attempt_id uuid;
  
  -- Badges & Rewards
  v_badge_earned_id uuid := null;
  v_badge_earned_name text := null;
  v_badge_earned_desc text := null;
  v_badge_earned_icon text := null;
begin
  -- 1. Fetch Quest configuration
  select q.xp_reward, q.coins_reward, m.subject_id
  into v_xp_reward, v_coins_reward, v_subject_id
  from public.quests q
  join public.missions m on m.id = q.mission_id
  where q.id = p_quest_id;
  
  if not found then
    raise exception 'Quest % not found', p_quest_id;
  end if;

  -- 2. Calculate XP and Coins earned based on score
  v_xp_earned := round(v_xp_reward * (p_score / 100.0));
  if p_score = 100.0 then
    v_coins_earned := v_coins_reward + 5; -- Perfect score bonus
  else
    v_coins_earned := round(v_coins_reward * (p_score / 100.0));
  end if;

  -- 3. Fetch student stats
  select xp, level, coins, current_streak, max_streak, last_active_date, skill_points
  into v_current_xp, v_level, v_current_coins, v_current_streak, v_max_streak, v_last_active, v_skill_points
  from public.student_stats
  where student_id = p_student_id;
  
  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- 4. Calculate Streak
  if v_last_active is null then
    v_current_streak := 1;
  elsif v_last_active = v_today then
    -- Already active today, streak doesn't change
  elsif v_last_active = v_today - 1 then
    v_current_streak := v_current_streak + 1;
  else
    v_current_streak := 1; -- Broke streak
  end if;
  
  if v_current_streak > v_max_streak then
    v_max_streak := v_current_streak;
  end if;

  -- 5. Calculate XP progression and Level Up
  v_current_xp := v_current_xp + v_xp_earned;
  v_current_coins := v_current_coins + v_coins_earned;
  
  v_xp_for_next_level := v_level * 200;
  if v_current_xp >= v_xp_for_next_level then
    v_current_xp := v_current_xp - v_xp_for_next_level;
    v_level := v_level + 1;
    v_leveled_up := true;
    -- If secondary grade student, grant skill points
    -- (We can check level of student_stats or level_grades via join if needed. For now let's grant +2 skill points on level up)
    v_skill_points := v_skill_points + 2;
  end if;

  -- 6. Generate Feedback message
  if p_score = 100.0 then
    v_feedback := '¡Increíble! Obtuviste un puntaje perfecto. ¡Eres una estrella!';
  elsif p_score >= 60.0 then
    v_feedback := '¡Bien hecho! Aprobaste el reto.';
  else
    v_feedback := '¡No te preocupes! El error es aprendizaje. Vuelve a intentarlo.';
  end if;

  -- 7. Update Student Stats
  update public.student_stats
  set xp = v_current_xp,
      level = v_level,
      coins = v_current_coins,
      current_streak = v_current_streak,
      max_streak = v_max_streak,
      last_active_date = v_today,
      skill_points = v_skill_points,
      updated_at = now()
  where student_id = p_student_id;

  -- 8. Record the Attempt
  insert into public.quest_attempts (student_id, quest_id, score, is_completed, answers, feedback, created_at)
  values (p_student_id, p_quest_id, p_score, (p_score >= 60.0), p_answers, v_feedback, now())
  returning id into v_attempt_id;

  -- 9. Check and unlock badges
  -- Case A: Perfect score in Math (Bronze Mathmage)
  if p_score = 100.0 and exists (
    select 1 from public.subjects s 
    join public.missions m on m.subject_id = s.id 
    join public.quests q on q.mission_id = m.id 
    where q.id = p_quest_id and s.name ilike '%matemáticas%'
  ) then
    -- Check if badge already unlocked
    select id, name, description, icon_name into v_badge_earned_id, v_badge_earned_name, v_badge_earned_desc, v_badge_earned_icon
    from public.badges where name ilike '%matemago%';
    
    if v_badge_earned_id is not null and not exists (
      select 1 from public.student_badges where student_id = p_student_id and badge_id = v_badge_earned_id
    ) then
      insert into public.student_badges (student_id, badge_id, earned_at)
      values (p_student_id, v_badge_earned_id, now());
    else
      -- Reset badge if already owned or not found to avoid returning it
      v_badge_earned_id := null;
    end if;
  end if;

  -- Return results payload
  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'xp_earned', v_xp_earned,
    'coins_earned', v_coins_earned,
    'leveled_up', v_leveled_up,
    'feedback', v_feedback,
    'new_stats', jsonb_build_object(
      'xp', v_current_xp,
      'level', v_level,
      'coins', v_current_coins,
      'current_streak', v_current_streak,
      'max_streak', v_max_streak,
      'skill_points', v_skill_points
    ),
    'badge_earned', case 
      when v_badge_earned_id is not null then jsonb_build_object(
        'id', v_badge_earned_id,
        'name', v_badge_earned_name,
        'description', v_badge_earned_desc,
        'icon_name', v_badge_earned_icon
      )
      else null
    end
  );
end;
$$;

---------------------------------------------------------
-- RPC: level_up_attribute
-- Validates skill points and upgrades the requested attribute.
---------------------------------------------------------
/**
 * @function level_up_attribute
 * @description Incrementa el valor de un atributo RPG del alumno (fuerza, inteligencia, defensa) usando un punto de habilidad (skill point) disponible.
 * @param {uuid} p_student_id - ID del estudiante (referencia a `public.students.id`).
 * @param {text} p_attribute_name - Nombre del atributo a incrementar ('strength', 'intelligence', 'defense').
 * @returns {jsonb} JSON que indica éxito y el nuevo estado de los skill points y atributos del alumno.
 * @stateImpact Invocado por `levelUpAttribute` en `useStudentStore`. Modifica directamente la visualización de estadísticas RPG en el frontend.
 */
create or replace function public.level_up_attribute(
  p_student_id uuid,
  p_attribute_name text
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_skill_points integer;
  v_strength integer;
  v_intelligence integer;
  v_defense integer;
begin
  -- Validate attribute name
  if p_attribute_name not in ('strength', 'intelligence', 'defense') then
    raise exception 'Invalid attribute name: %', p_attribute_name;
  end if;

  -- Fetch student stats
  select skill_points, attribute_strength, attribute_intelligence, attribute_defense
  into v_skill_points, v_strength, v_intelligence, v_defense
  from public.student_stats
  where student_id = p_student_id;

  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- Validate skill points
  if v_skill_points <= 0 then
    raise exception 'No skill points available to level up';
  end if;

  -- Upgrade attribute
  if p_attribute_name = 'strength' then
    v_strength := v_strength + 1;
  elsif p_attribute_name = 'intelligence' then
    v_intelligence := v_intelligence + 1;
  elsif p_attribute_name = 'defense' then
    v_defense := v_defense + 1;
  end if;

  v_skill_points := v_skill_points - 1;

  -- Save changes
  update public.student_stats
  set skill_points = v_skill_points,
      attribute_strength = v_strength,
      attribute_intelligence = v_intelligence,
      attribute_defense = v_defense,
      updated_at = now()
  where student_id = p_student_id;

  return jsonb_build_object(
    'success', true,
    'attribute_name', p_attribute_name,
    'new_stats', jsonb_build_object(
      'skill_points', v_skill_points,
      'attribute_strength', v_strength,
      'attribute_intelligence', v_intelligence,
      'attribute_defense', v_defense
    )
  );
end;
$$;

---------------------------------------------------------
-- RPC: purchase_artifact
-- Validates funds (coins), updates balances, adds to inventory, and generates message.
---------------------------------------------------------
/**
 * @function purchase_artifact
 * @description Procesa la compra de un artefacto de la tienda. Valida que existan fondos suficientes, que el alumno no sea dueño ya del artefacto, descuenta las monedas, lo añade a su inventario y genera un mensaje de notificación en su buzón.
 * @param {uuid} p_student_id - ID del estudiante (referencia a `public.students.id`).
 * @param {text} p_artifact_id - ID del artefacto a comprar (referencia a `public.shop_artifacts.id`).
 * @returns {jsonb} JSON indicando éxito, nuevo saldo de monedas, inventario actualizado y detalles de la notificación generada.
 * @stateImpact Invocado por `purchaseArtifact` en `useGamificationStore`. Actualiza el inventario y las monedas del estudiante en `useStudentStore`.
 */
create or replace function public.purchase_artifact(
  p_student_id uuid,
  p_artifact_id text
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_coins integer;
  v_price integer;
  v_name text;
  v_message_id uuid;
  v_message_text text;
  v_inventory text[];
begin
  -- Fetch artifact details
  select price, name
  into v_price, v_name
  from public.shop_artifacts
  where id = p_artifact_id;

  if not found then
    raise exception 'Artifact % not found in shop', p_artifact_id;
  end if;

  -- Fetch student coins
  select coins
  into v_coins
  from public.student_stats
  where student_id = p_student_id;

  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- Validate funds
  if v_coins < v_price then
    raise exception 'Insufficient coins. Required: %, Available: %', v_price, v_coins;
  end if;

  -- Check if already owned
  if exists (
    select 1 from public.student_inventory
    where student_id = p_student_id and artifact_id = p_artifact_id
  ) then
    raise exception 'Student already owns artifact %', p_artifact_id;
  end if;

  -- Deduct coins
  v_coins := v_coins - v_price;
  update public.student_stats
  set coins = v_coins,
      updated_at = now()
  where student_id = p_student_id;

  -- Add to inventory
  insert into public.student_inventory (student_id, artifact_id, acquired_at)
  values (p_student_id, p_artifact_id, now());

  -- Create Notification Alert
  v_message_text := 'Has comprado el artefacto "' || v_name || '" por ' || v_price || ' monedas. ¡Ahora tienes una oportunidad extra en exámenes!';
  insert into public.student_messages (student_id, title, message, is_read, type, sent_at)
  values (p_student_id, '🎁 Compra de Artefacto', v_message_text, false, 'purchase', now())
  returning id into v_message_id;

  -- Build final inventory array for the response
  select array_agg(artifact_id) into v_inventory
  from public.student_inventory
  where student_id = p_student_id;

  return jsonb_build_object(
    'success', true,
    'new_coins', v_coins,
    'inventory', v_inventory,
    'new_message', jsonb_build_object(
      'id', v_message_id,
      'student_id', p_student_id,
      'title', '🎁 Compra de Artefacto',
      'message', v_message_text,
      'sent_at', now(),
      'is_read', false
    )
  );
end;
$$;
