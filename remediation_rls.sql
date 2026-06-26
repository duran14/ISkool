-- ==========================================
-- 1. Habilitar Row Level Security (RLS)
-- ==========================================
ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. Eliminar Políticas Permisivas Existentes
-- ==========================================
DROP POLICY IF EXISTS "Allow all for public" ON public.parent_student;
DROP POLICY IF EXISTS "Allow all for public" ON public.shop_artifacts;
DROP POLICY IF EXISTS "Allow all for public" ON public.student_inventory;
DROP POLICY IF EXISTS "Allow all for public" ON public.student_messages;

-- ==========================================
-- 3. Crear Políticas de Seguridad Específicas
-- ==========================================

-- Tabla: parent_student
CREATE POLICY "Permitir lectura de relacion a padres o alumnos vinculados"
  ON public.parent_student FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- Tabla: shop_artifacts
CREATE POLICY "Permitir lectura de shop_artifacts a usuarios autenticados"
  ON public.shop_artifacts FOR SELECT
  TO authenticated
  USING (true);

-- Tabla: student_inventory
CREATE POLICY "Permitir lectura de student_inventory a alumnos dueños"
  ON public.student_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Permitir insercion de student_inventory a alumnos dueños"
  ON public.student_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Tabla: student_messages
CREATE POLICY "Permitir lectura de student_messages a alumnos dueños"
  ON public.student_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Permitir actualizacion de student_messages a alumnos dueños"
  ON public.student_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ==========================================
-- 4. Fijar search_path para Funciones SECURITY DEFINER
-- ==========================================
ALTER FUNCTION public.submit_quiz(uuid, uuid, numeric, jsonb) SET search_path = public, pg_catalog, pg_temp;
ALTER FUNCTION public.level_up_attribute(uuid, text) SET search_path = public, pg_catalog, pg_temp;
ALTER FUNCTION public.purchase_artifact(uuid, text) SET search_path = public, pg_catalog, pg_temp;
ALTER FUNCTION public.join_party(uuid) SET search_path = public, pg_catalog, pg_temp;
ALTER FUNCTION public.trigger_guild_attack(integer) SET search_path = public, pg_catalog, pg_temp;
