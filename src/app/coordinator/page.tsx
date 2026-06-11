"use client";
import React, { useState } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  Users, UserPlus, Calendar, Plus, Trash2, Search, Filter, 
  BookOpen, Calculator, Activity, Clock, ShieldAlert, MapPin, 
  Phone, Mail, CheckCircle2, ChevronRight, User, AlertCircle, Sparkles, X, Heart, Globe, Building2, Upload, RefreshCw
} from 'lucide-react';
import { DetailedStudent, ClassSchedule, Group, SchoolSettings } from '@/types';

export default function CoordinatorDashboard() {
  const { 
    detailedStudents, setDetailedStudents, groupsList, schedulesList, subjects,
    registerStudent, generateGroupsForGrade, assignStudentToGroup,
    createSchedule, deleteSchedule, deleteGroup, schoolSettings, saveSchoolSettings
  } = useGamification();

  // Gestión de Pestañas
  const [activeTab, setActiveTab] = useState<'students' | 'groups' | 'schedules' | 'settings'>('students');

  // --- ESTADOS ONBOARDING INTERACTIVO ---
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<SchoolSettings>({
    isConfigured: false,
    name: schoolSettings.name || '',
    website: schoolSettings.website || '',
    logoUrl: schoolSettings.logoUrl || '',
    cct: schoolSettings.cct || '',
    address: schoolSettings.address || '',
    phone: schoolSettings.phone || '',
    coordinators: schoolSettings.coordinators || [''],
    teachers: schoolSettings.teachers || [''],
    themeColors: schoolSettings.themeColors || {
      primary: '250 84% 54%',
      secondary: '221 83% 53%',
      accent: '142 71% 45%'
    }
  });

  const [simulatedDomainName, setSimulatedDomainName] = useState('');
  const [isSimulatingColors, setIsSimulatingColors] = useState(false);
  const [showColorSuccess, setShowColorSuccess] = useState(false);


  // --- FILTROS Y ESTADOS DE ALUMNOS ---
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'primaria' | 'secundaria' | 'preparatoria'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DetailedStudent | null>(null);

  // Formulario de Registro
  const [newStudentData, setNewStudentData] = useState({
    first_name: '',
    second_name: '',
    last_name_1: '',
    last_name_2: '',
    birth_date: '',
    curp: '',
    enrollment_id: '',
    gender: 'Masculino',
    shift: 'matutino' as const,
    address: '',
    phone: '',
    email: '',
    father_name: '',
    mother_name: '',
    tutor_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_type: 'O+',
    medical_notes: '',
    academic_notes: '',
    level: 'primaria' as const,
    grade: '1º',
    previous_school: '',
  });

  // --- ESTADOS DE GRUPOS ---
  const [selectedGroupLevel, setSelectedGroupLevel] = useState<'primaria' | 'secundaria' | 'preparatoria'>('primaria');
  const [selectedGroupGrade, setSelectedGroupGrade] = useState('1º');
  const [customGroupName, setCustomGroupName] = useState('');

  // --- ESTADOS DE HORARIOS ---
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'>('Lunes');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('usr-teacher-1'); // Default
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('08:00 - 09:30');

  // Lista de profesores estáticos simulados
  const TEACHERS = [
    { id: 'usr-teacher-1', name: 'Israel López (Matemáticas/Ciencias)' },
    { id: 'usr-teacher-2', name: 'María Fernández (Español/Historia)' },
    { id: 'usr-teacher-3', name: 'Roberto Díaz (Inglés/Cívica)' }
  ];

  // Horarios de tiempo disponibles
  const TIME_SLOTS = [
    '08:00 - 09:30',
    '09:30 - 11:00',
    '11:00 - 11:30 (Receso)',
    '11:30 - 13:00',
    '13:00 - 14:30'
  ];

  // Cálculo de edad dinámico
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Formateador de nombres de estudiantes (apellidos primero)
  const formatStudentName = (student: DetailedStudent | { first_name: string; last_name: string; second_name?: string; last_name_1?: string; last_name_2?: string }) => {
    if ('last_name_1' in student && student.last_name_1) {
      const ap1 = student.last_name_1;
      const ap2 = student.last_name_2 ? ` ${student.last_name_2}` : '';
      const n1 = student.first_name;
      const n2 = student.second_name ? ` ${student.second_name}` : '';
      return `${ap1}${ap2}, ${n1}${n2}`.trim();
    } else {
      const lastName = ('last_name' in student) ? student.last_name : '';
      const firstName = student.first_name || '';
      return `${lastName}, ${firstName}`.trim();
    }
  };

  // Generador de CURP simulado (Premium)
  const generateSimulatedCurp = () => {
    const fn = newStudentData.first_name.toUpperCase().slice(0, 2);
    const ap1 = newStudentData.last_name_1.toUpperCase().slice(0, 2);
    const ap2 = newStudentData.last_name_2 ? newStudentData.last_name_2.toUpperCase().slice(0, 1) : 'X';
    const dateStr = newStudentData.birth_date ? newStudentData.birth_date.replace(/-/g, '').slice(2, 8) : '250101';
    const randomHex = Math.floor(100 + Math.random() * 900);
    const gen = newStudentData.gender === 'Masculino' ? 'H' : 'M';
    const result = `${ap1}${ap2}${fn}${dateStr}${gen}DFMRN${randomHex}`;
    
    setNewStudentData(prev => ({
      ...prev,
      curp: result,
      enrollment_id: `MAT-2026-${Math.floor(100 + Math.random() * 900)}`
    }));
  };

  // Submit del registro
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.first_name || !newStudentData.last_name_1 || !newStudentData.birth_date) {
      alert('Favor de completar los campos obligatorios: Nombre, Primer Apellido y Fecha de Nacimiento.');
      return;
    }

    const curpVal = newStudentData.curp || `SIM-${Date.now()}`;
    const enrolVal = newStudentData.enrollment_id || `MAT-${Date.now().toString().slice(-4)}`;

    registerStudent({
      ...newStudentData,
      curp: curpVal,
      enrollment_id: enrolVal,
      status: 'activo'
    });

    alert(`¡Alumno ${newStudentData.first_name} registrado exitosamente!`);
    setIsRegisterModalOpen(false);

    // Limpiar formulario
    setNewStudentData({
      first_name: '',
      second_name: '',
      last_name_1: '',
      last_name_2: '',
      birth_date: '',
      curp: '',
      enrollment_id: '',
      gender: 'Masculino',
      shift: 'matutino',
      address: '',
      phone: '',
      email: '',
      father_name: '',
      mother_name: '',
      tutor_name: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      blood_type: 'O+',
      medical_notes: '',
      academic_notes: '',
      level: 'primaria',
      grade: '1º',
      previous_school: '',
    });
  };

  // --- ESTADOS DE ORDENAMIENTO ---
  const [sortField, setSortField] = useState<'enrollment_id' | 'name' | 'age' | 'level' | 'group' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtrado de alumnos
  const filteredStudents = detailedStudents.filter(s => {
    const fullName = `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          (s.curp && s.curp.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (s.enrollment_id && s.enrollment_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;

    let matchesGroup = true;
    if (groupFilter === 'assigned') matchesGroup = !!s.group_id;
    if (groupFilter === 'unassigned') matchesGroup = !s.group_id;

    return matchesSearch && matchesLevel && matchesGroup;
  });

  // Ordenar filteredStudents dinámicamente según columna seleccionada
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'enrollment_id') {
      comparison = (a.enrollment_id || '').localeCompare(b.enrollment_id || '');
    } else if (sortField === 'name') {
      comparison = formatStudentName(a).localeCompare(formatStudentName(b));
    } else if (sortField === 'age') {
      comparison = calculateAge(a.birth_date) - calculateAge(b.birth_date);
    } else if (sortField === 'level') {
      const lvlA = `${a.level} ${a.grade}`;
      const lvlB = `${b.level} ${b.grade}`;
      comparison = lvlA.localeCompare(lvlB);
    } else if (sortField === 'group') {
      const gpA = groupsList.find(g => g.id === a.group_id)?.name || 'Sin grupo';
      const gpB = groupsList.find(g => g.id === b.group_id)?.name || 'Sin grupo';
      comparison = gpA.localeCompare(gpB);
    } else if (sortField === 'status') {
      comparison = (a.status || '').localeCompare(b.status || '');
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Manejador de clic en cabecera
  const handleSortClick = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Opciones de grados dependiendo del nivel seleccionado
  const getGradesForLevel = (lvl: 'primaria' | 'secundaria' | 'preparatoria') => {
    if (lvl === 'primaria') return ['1º', '2º', '3º', '4º', '5º', '6º'];
    if (lvl === 'secundaria') return ['1º', '2º', '3º'];
    return ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre'];
  };

  // Filtrar grupos en pantalla por grado/nivel activo
  const activeLevelGradeKey = `${selectedGroupLevel}-${selectedGroupGrade.replace(/\s+/g, '')}`;
  const currentGroupsInGrade = groupsList.filter(g => g.level_grade_id === activeLevelGradeKey);

  // Alumnos del nivel/grado seleccionado
  const studentsInGrade = detailedStudents.filter(s => s.level === selectedGroupLevel && s.grade === selectedGroupGrade);
  const studentsUnassignedInGrade = studentsInGrade.filter(s => !s.group_id);

  // Crear grupo personalizado
  const handleCreateGroup = () => {
    if (!customGroupName.trim()) return;
    generateGroupsForGrade(selectedGroupLevel, selectedGroupGrade, [customGroupName.trim().toUpperCase()]);
    setCustomGroupName('');
    alert(`Grupo "${customGroupName.toUpperCase()}" creado.`);
  };

  // Autogenerar grupos A y B
  const handleAutoGroups = () => {
    generateGroupsForGrade(selectedGroupLevel, selectedGroupGrade, ['A', 'B']);
    alert('Grupos A y B conformados automáticamente.');
  };

  // Crear horario
  const handleAddSchedule = () => {
    if (!activeGroupId) {
      alert('Favor de seleccionar un grupo primero.');
      return;
    }
    if (!selectedSubject) {
      alert('Favor de seleccionar una asignatura.');
      return;
    }

    createSchedule({
      groupId: activeGroupId,
      subjectId: selectedSubject,
      teacherId: selectedTeacher,
      dayOfWeek: selectedDay,
      timeSlot: selectedTimeSlot
    });

    alert('Horario programado correctamente.');
  };

  // Obtener info visual del horario
  const getSubjectColor = (subjectId: string) => {
    if (subjectId === 'sub-math') return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300';
    if (subjectId === 'sub-span') return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300';
    if (subjectId === 'sub-sci') return 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
    return 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-300';
  };

  const getSubjectIcon = (subjectId: string) => {
    if (subjectId === 'sub-math') return Calculator;
    if (subjectId === 'sub-span') return BookOpen;
    return Activity;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Banner Coordinador */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
          <div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-50 dark:bg-violet-950/50 px-2.5 py-1 rounded-md">Panel de Control de Coordinación</span>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-2">Módulo de Administración Académica</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Escuela: <strong>Colegio Anglo Mexicano</strong> | Administra altas, conforma grupos y define horarios.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/45 dark:border-zinc-850 self-stretch md:self-auto">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'students'
                  ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Expedientes ({detailedStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'groups'
                  ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Conformar Grupos
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'schedules'
                  ? 'bg-white dark:bg-zinc-800 text-brand-primary shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Horarios de Clases
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-zinc-800 text-brand-primary shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Identidad de Escuela
            </button>
          </div>
        </div>

        {/* --- PESTAÑA 1: EXPEDIENTES Y ALTA --- */}
        {activeTab === 'students' && (
          <div className="flex flex-col gap-6">
            {/* Barra de Filtros */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, CURP o matrícula..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none focus:border-violet-500 text-zinc-900 dark:text-white"
                  />
                </div>
                {/* Nivel */}
                <select
                  value={levelFilter}
                  onChange={(e: any) => setLevelFilter(e.target.value)}
                  className="p-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="all">Todos los Niveles</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="preparatoria">Preparatoria</option>
                </select>
                {/* Asignación */}
                <select
                  value={groupFilter}
                  onChange={(e: any) => setGroupFilter(e.target.value)}
                  className="p-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="all">Todos (Con y Sin Grupo)</option>
                  <option value="assigned">Con Grupo Asignado</option>
                  <option value="unassigned">Sin Grupo Asignado</option>
                </select>
              </div>

              {/* Botón de Alta */}
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full md:w-auto px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-500/10"
              >
                <UserPlus className="h-4.5 w-4.5" />
                Dar de Alta Alumno
              </button>
            </div>

            {/* Listado de Alumnos */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 font-bold text-zinc-400 uppercase tracking-wider select-none">
                    <tr>
                      <th 
                        className="p-4 px-6 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('enrollment_id')}
                      >
                        <div className="flex items-center gap-1">
                          Matrícula / CURP
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'enrollment_id' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('name')}
                      >
                        <div className="flex items-center gap-1">
                          Nombre Completo
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'name' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('age')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Edad
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'age' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('level')}
                      >
                        <div className="flex items-center gap-1">
                          Nivel / Grado
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'level' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('group')}
                      >
                        <div className="flex items-center gap-1">
                          Grupo Asignado
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'group' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th className="p-4">Contacto</th>
                      <th 
                        className="p-4 text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('status')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Estado
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'status' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {sortedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-400">
                          <AlertCircle className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                          No se encontraron expedientes con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      sortedStudents.map(student => {
                        const age = calculateAge(student.birth_date);
                        const assignedGroup = groupsList.find(g => g.id === student.group_id);
                        
                        return (
                          <tr key={student.id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-850/40 transition-colors">
                            <td className="p-4 px-6 font-mono text-[10.5px]">
                              <span className="font-extrabold text-zinc-900 dark:text-white block">{student.enrollment_id}</span>
                              <span className="text-zinc-400 block mt-0.5">{student.curp}</span>
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={() => setSelectedStudent(student)}
                                className="font-bold text-zinc-900 dark:text-white text-sm hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors text-left focus:outline-none"
                              >
                                {formatStudentName(student)}
                              </button>
                              {student.medical_notes && (
                                <span className="inline-flex items-center gap-0.5 ml-2 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-200/20" title={student.medical_notes}>
                                  <ShieldAlert className="h-3 w-3" /> Médicos
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center font-extrabold text-sm">{age} años</td>
                            <td className="p-4 capitalize">
                              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold mr-1">
                                {student.level}
                              </span>
                              <span className="font-semibold text-zinc-500">{student.grade}</span>
                            </td>
                            <td className="p-4">
                              {assignedGroup ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 font-extrabold text-[10.5px]">
                                  Grupo {assignedGroup.name}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 text-[10px] font-bold">
                                  Sin grupo
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col text-[10.5px] text-zinc-500 leading-tight">
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone || 'S/T'}</span>
                                <span className="flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {student.email || 'S/C'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex flex-col gap-1 items-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  student.status === 'activo' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                  student.status === 'suspendido' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                  'bg-rose-500/10 text-rose-600 dark:text-rose-450'
                                }`}>
                                  {student.status}
                                </span>
                                <button
                                  onClick={() => {
                                    const nextStatus = 
                                      student.status === 'activo' ? 'suspendido' :
                                      student.status === 'suspendido' ? 'baja' : 'activo';
                                    setDetailedStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: nextStatus as any } : s));
                                  }}
                                  className="text-[8.5px] font-extrabold text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors uppercase"
                                >
                                  {student.status === 'activo' ? 'Suspender' :
                                   student.status === 'suspendido' ? 'Baja' : 'Reactivar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PESTAÑA 2: CONFORMAR GRUPOS --- */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LADO IZQUIERDO: CONFIGURADOR DE NIVEL Y GRUPOS (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Tarjeta de Grado/Nivel */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Filter className="h-4.5 w-4.5 text-violet-500" />
                  1. Grado a gestionar
                </h3>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nivel Educativo</label>
                  <select
                    value={selectedGroupLevel}
                    onChange={(e: any) => {
                      setSelectedGroupLevel(e.target.value);
                      setSelectedGroupGrade(getGradesForLevel(e.target.value)[0]);
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="primaria">Primaria</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="preparatoria">Preparatoria</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Grado Escolar</label>
                  <select
                    value={selectedGroupGrade}
                    onChange={(e) => setSelectedGroupGrade(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    {getGradesForLevel(selectedGroupLevel).map(gr => (
                      <option key={gr} value={gr}>{gr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generador de Grupos */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Plus className="h-4.5 w-4.5 text-violet-500" />
                  2. Generar Grupos
                </h3>

                <p className="text-[10px] text-zinc-400 leading-normal">
                  Crea grupos en el grado de forma individual o utiliza el conformador automático.
                </p>

                {/* Individual */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGroupName}
                    onChange={(e) => setCustomGroupName(e.target.value)}
                    placeholder="Letra/Nombre (ej. C)"
                    maxLength={10}
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs text-center font-extrabold focus:outline-none focus:border-violet-500 text-zinc-900 dark:text-white"
                  />
                  <button
                    onClick={handleCreateGroup}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold"
                  >
                    Crear
                  </button>
                </div>

                {/* Automático */}
                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                  <button
                    onClick={handleAutoGroups}
                    className="w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                    Conformar A y B
                  </button>
                </div>
              </div>

            </div>

            {/* LADO DERECHO: INTERFAZ DE ASIGNACIÓN (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Alumnos Sin Grupo */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-4.5 w-4.5 text-red-500" />
                    Alumnos por Asignar en {selectedGroupGrade} de {selectedGroupLevel}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
                    {studentsUnassignedInGrade.length} sin grupo
                  </span>
                </div>

                {/* Buscador de alumnos por asignar */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    id="search-unassigned-input"
                    placeholder="Buscar alumno sin grupo por nombre o CURP..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none focus:border-brand-primary text-zinc-900 dark:text-white"
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const items = document.querySelectorAll('.unassigned-student-card');
                      items.forEach((item: any) => {
                        const text = item.getAttribute('data-search-text').toLowerCase();
                        if (text.includes(val)) {
                          item.style.display = 'flex';
                        } else {
                          item.style.display = 'none';
                        }
                      });
                    }}
                  />
                </div>

                {studentsUnassignedInGrade.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">Todos los alumnos de este grado ya tienen grupo asignado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {studentsUnassignedInGrade.map(std => (
                      <div 
                        key={std.id} 
                        data-search-text={`${std.first_name} ${std.second_name || ''} ${std.last_name_1} ${std.last_name_2 || ''} ${std.curp || ''}`}
                        className="unassigned-student-card p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            {std.first_name} {std.last_name_1}
                          </p>
                          <p className="text-[9px] text-zinc-400">{std.curp}</p>
                        </div>
                        
                        {/* Selector de Grupo */}
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              assignStudentToGroup(std.id, e.target.value);
                              alert(`Alumno asignado.`);
                            }
                          }}
                          className="text-[10px] p-1.5 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-violet-500 font-bold"
                        >
                          <option value="" disabled>Asignar a...</option>
                          {currentGroupsInGrade.map(g => (
                            <option key={g.id} value={g.id}>Grupo {g.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tarjetas de Grupos Existentes */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Grupos del Grado</h3>
                
                {currentGroupsInGrade.length === 0 ? (
                  <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/40 p-8 text-center text-xs text-zinc-400 rounded-3xl">
                    No hay grupos conformados en este grado aún. ¡Crea uno usando el panel de la izquierda!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentGroupsInGrade.map(group => {
                      const studentsInGroup = studentsInGrade.filter(s => s.group_id === group.id);
                      
                      return (
                        <div key={group.id} className="relative bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                          
                          {/* Botón de Cruz para eliminar grupo individual */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Estás seguro de que deseas eliminar el Grupo ${group.name}? Los alumnos asignados quedarán sin grupo.`)) {
                                deleteGroup(group.id);
                              }
                            }}
                            className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer pointer-events-auto transition-colors"
                            title="Eliminar Grupo"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>

                          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-2 pr-8">
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <Users className="h-4.5 w-4.5 text-violet-500" />
                              Grupo {group.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold">{studentsInGroup.length} alumnos</span>
                          </div>

                          {/* Listado de alumnos */}
                          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                            {studentsInGroup.length === 0 ? (
                              <p className="text-[10px] text-zinc-400 text-center py-2">Vacío sin alumnos.</p>
                            ) : (
                              studentsInGroup.map(std => (
                                <div key={std.id} className="flex justify-between items-center p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 text-[10.5px]">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                    {formatStudentName(std)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => assignStudentToGroup(std.id, '')}
                                    className="text-[9.5px] font-bold text-red-500 hover:text-red-750 hover:underline transition-colors"
                                  >
                                    Remover
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* --- PESTAÑA 3: HORARIOS DE CLASES --- */}
        {activeTab === 'schedules' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LADO IZQUIERDO: PROGRAMADOR DE HORAS (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Programador Form */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Calendar className="h-4.5 w-4.5 text-violet-500" />
                  Programar Bloque
                </h3>

                {/* Seleccionar Grupo */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Grupo a planificar</label>
                  <select
                    value={activeGroupId}
                    onChange={(e) => setActiveGroupId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-bold"
                  >
                    <option value="" disabled>Selecciona Grupo...</option>
                    {groupsList.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.level_grade_id.split('-').join(' ')} - Grupo {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Asignatura */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Asignatura</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="" disabled>Selecciona Materia...</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Profesor */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Profesor Responsable</label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    {TEACHERS.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Día de la Semana */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Día de la Semana</label>
                  <select
                    value={selectedDay}
                    onChange={(e: any) => setSelectedDay(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                  </select>
                </div>

                {/* Seleccionar Rango Horario */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Horario (Time Slot)</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  >
                    {TIME_SLOTS.map(ts => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>

                {/* Añadir */}
                <button
                  onClick={handleAddSchedule}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Clase al Horario
                </button>
              </div>

            </div>

            {/* LADO DERECHO: GRID CALENDARIO SEMANAL (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-sm flex flex-col gap-6">
              
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-violet-500" />
                  Calendario Semanal del Grupo
                </h3>
                
                {activeGroupId && (
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    Grupo: {groupsList.find(g => g.id === activeGroupId)?.level_grade_id.split('-').join(' ')} - {groupsList.find(g => g.id === activeGroupId)?.name}
                  </span>
                )}
              </div>

              {!activeGroupId ? (
                <div className="p-16 text-center text-xs text-zinc-400">
                  <Clock className="h-12 w-12 mx-auto text-zinc-300 mb-2" />
                  Favor de seleccionar un grupo en el panel de la izquierda para desplegar su horario semanal.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Grid de días */}
                  <div className="grid grid-cols-5 gap-3">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => {
                      const schedulesForDay = schedulesList.filter(s => s.groupId === activeGroupId && s.dayOfWeek === day);
                      
                      return (
                        <div key={day} className="flex flex-col gap-3 min-h-[400px]">
                          <span className="w-full text-center bg-zinc-100 dark:bg-zinc-950 py-1.5 rounded-lg text-[10.5px] font-black tracking-wider text-zinc-500 uppercase border border-zinc-200/30">
                            {day}
                          </span>

                          <div className="flex flex-col gap-2 flex-1 bg-zinc-50/50 dark:bg-zinc-950/20 p-1.5 rounded-xl border border-zinc-100 dark:border-zinc-850">
                            {schedulesForDay.length === 0 ? (
                              <span className="text-[9px] text-zinc-400 text-center py-6">Sin clases</span>
                            ) : (
                              schedulesForDay.map(sch => {
                                const sub = subjects.find(s => s.id === sch.subjectId);
                                const teacher = TEACHERS.find(t => t.id === sch.teacherId);
                                const SubjectIcon = getSubjectIcon(sch.subjectId);
                                
                                return (
                                  <div
                                    key={sch.id}
                                    className={`p-2.5 rounded-xl border transition-all flex flex-col gap-2 relative group hover:scale-[1.02] ${getSubjectColor(sch.subjectId)}`}
                                  >
                                    {/* Botón eliminar */}
                                    <button
                                      onClick={() => {
                                        deleteSchedule(sch.id);
                                        alert('Clase eliminada del horario.');
                                      }}
                                      className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-[9px] text-red-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                      title="Eliminar bloque"
                                    >
                                      ✕
                                    </button>

                                    <div className="flex items-center gap-1">
                                      <SubjectIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span className="font-extrabold text-[10px] leading-tight truncate">
                                        {sub ? sub.name : sch.subjectId}
                                      </span>
                                    </div>

                                    <div className="text-[8.5px] opacity-85 leading-tight">
                                      <div className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {sch.timeSlot}</div>
                                      <div className="truncate mt-0.5">Prof. {teacher ? teacher.name.split(' ')[0] : 'Docente'}</div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PESTAÑA 4: IDENTIDAD Y CONFIGURACIÓN DE LA ESCUELA --- */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5.5 w-5.5 text-brand-primary" />
                  Identidad Institucional de la Escuela
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Define los datos del plantel y la paleta de colores del tema adaptativo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Formulario */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nombre del Plantel</label>
                    <input
                      type="text"
                      value={schoolSettings.name}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Clave de Centro de Trabajo (CCT)</label>
                    <input
                      type="text"
                      value={schoolSettings.cct}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, cct: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Teléfono Institucional</label>
                    <input
                      type="text"
                      value={schoolSettings.phone}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, phone: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Sitio Web Oficial</label>
                    <input
                      type="text"
                      value={schoolSettings.website}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, website: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Dirección del Plantel</label>
                  <input
                    type="text"
                    value={schoolSettings.address}
                    onChange={(e) => saveSchoolSettings({ ...schoolSettings, address: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Coordinadores */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Coordinadores del Sistema</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {schoolSettings.coordinators.map((c, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded-lg">
                        {c}
                        <button
                          onClick={() => {
                            const filtered = schoolSettings.coordinators.filter((_, i) => i !== idx);
                            saveSchoolSettings({ ...schoolSettings, coordinators: filtered });
                          }}
                          className="text-red-500 hover:text-red-750 text-[10px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-coord-input"
                      placeholder="Nombre del nuevo coordinador..."
                      className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          saveSchoolSettings({
                            ...schoolSettings,
                            coordinators: [...schoolSettings.coordinators, e.target.value.trim()]
                          });
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('new-coord-input') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          saveSchoolSettings({
                            ...schoolSettings,
                            coordinators: [...schoolSettings.coordinators, el.value.trim()]
                          });
                          el.value = '';
                        }
                      }}
                      className="px-4 bg-brand-primary text-white rounded-xl text-xs font-bold"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Profesores */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Profesores Invitados</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {schoolSettings.teachers.map((t, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded-lg">
                        {t}
                        <button
                          onClick={() => {
                            const filtered = schoolSettings.teachers.filter((_, i) => i !== idx);
                            saveSchoolSettings({ ...schoolSettings, teachers: filtered });
                          }}
                          className="text-red-500 hover:text-red-750 text-[10px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-teach-input"
                      placeholder="Nombre del docente..."
                      className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          saveSchoolSettings({
                            ...schoolSettings,
                            teachers: [...schoolSettings.teachers, e.target.value.trim()]
                          });
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('new-teach-input') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          saveSchoolSettings({
                            ...schoolSettings,
                            teachers: [...schoolSettings.teachers, el.value.trim()]
                          });
                          el.value = '';
                        }
                      }}
                      className="px-4 bg-brand-primary text-white rounded-xl text-xs font-bold"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>

              {/* Tema de Colores */}
              <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-4">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest border-b pb-1.5 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  Paleta de Colores Activa
                </span>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-400 uppercase">Color Primario (HSL)</label>
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="text"
                        value={schoolSettings.themeColors.primary}
                        onChange={(e) => saveSchoolSettings({
                          ...schoolSettings,
                          themeColors: { ...schoolSettings.themeColors, primary: e.target.value }
                        })}
                        placeholder="250 84% 54%"
                        className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                      />
                      <span className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: `hsl(${schoolSettings.themeColors.primary})` }} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-zinc-400 uppercase">Color Secundario (HSL)</label>
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="text"
                        value={schoolSettings.themeColors.secondary}
                        onChange={(e) => saveSchoolSettings({
                          ...schoolSettings,
                          themeColors: { ...schoolSettings.themeColors, secondary: e.target.value }
                        })}
                        placeholder="221 83% 53%"
                        className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                      />
                      <span className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: `hsl(${schoolSettings.themeColors.secondary})` }} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-zinc-400 uppercase">Color de Acento (HSL)</label>
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="text"
                        value={schoolSettings.themeColors.accent}
                        onChange={(e) => saveSchoolSettings({
                          ...schoolSettings,
                          themeColors: { ...schoolSettings.themeColors, accent: e.target.value }
                        })}
                        placeholder="142 71% 45%"
                        className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                      />
                      <span className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: `hsl(${schoolSettings.themeColors.accent})` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => saveSchoolSettings({
                      ...schoolSettings,
                      themeColors: {
                        primary: '250 84% 54%',
                        secondary: '221 83% 53%',
                        accent: '142 71% 45%'
                      }
                    })}
                    className="w-full py-2 border rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100"
                  >
                    Restablecer Colores
                  </button>
                  <button
                    onClick={() => saveSchoolSettings({ ...schoolSettings, isConfigured: false })}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold"
                  >
                    Volver a Ejecutar Onboarding
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- PROCESO DE ONBOARDING ESCOLAR INTERACTIVO DE PANTALLA COMPLETA --- */}
      {!schoolSettings.isConfigured && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-250">
            
            {/* Header del Onboarding */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-2">
                <Building2 className="h-7 w-7 text-brand-primary" />
                <div>
                  <h1 className="text-lg font-black text-zinc-950 dark:text-white">Bienvenido a ISkool</h1>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Asistente de configuración inicial del Plantel e Identidad Visual</p>
                </div>
              </div>
              
              {/* Progreso de Pasos */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map(step => (
                  <span
                    key={step}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      step === onboardingStep ? 'w-6 bg-brand-primary' : step < onboardingStep ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-850'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contenido Dinámico del Paso */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
              
              {/* PASO 1: DATOS GENERALES */}
              {onboardingStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 1: Información de la Escuela</h2>
                    <p className="text-xs text-zinc-400">Ingresa los datos generales para conformar tu plantel en el sistema.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Nombre de la Institución *</label>
                      <input
                        required
                        type="text"
                        value={onboardingData.name}
                        onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                        placeholder="Ej. Colegio Anglo Mexicano"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-455 uppercase block mb-1">Clave de Centro de Trabajo (CCT) *</label>
                      <input
                        required
                        type="text"
                        value={onboardingData.cct}
                        onChange={(e) => setOnboardingData({ ...onboardingData, cct: e.target.value })}
                        placeholder="Ej. 09DPR5678X"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Teléfono Institucional *</label>
                      <input
                        required
                        type="text"
                        value={onboardingData.phone}
                        onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
                        placeholder="Ej. 555-123-4567"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Sitio Web Oficial</label>
                      <input
                        type="url"
                        value={onboardingData.website}
                        onChange={(e) => setOnboardingData({ ...onboardingData, website: e.target.value })}
                        placeholder="Ej. https://escuela.edu.mx"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Dirección Física *</label>
                    <input
                      required
                      type="text"
                      value={onboardingData.address}
                      onChange={(e) => setOnboardingData({ ...onboardingData, address: e.target.value })}
                      placeholder="Calle, Número, Colonia, Delegación"
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2: LOGOTIPO Y EXTRACCIÓN INTELIGENTE */}
              {onboardingStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 2: Análisis de Logotipo e Identidad Visual</h2>
                    <p className="text-xs text-zinc-400">Ingresa la URL del logotipo o el dominio web de la escuela para deducir de forma automatizada los colores del tema visual.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Dominio de la Escuela (Web)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={simulatedDomainName}
                            onChange={(e) => setSimulatedDomainName(e.target.value)}
                            placeholder="Ej. unam.mx o anglomexicano.edu.mx"
                            className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!simulatedDomainName) return;
                              setIsSimulatingColors(true);
                              setShowColorSuccess(false);
                              setTimeout(() => {
                                // Simular extracción de colores basada en el nombre del dominio
                                const isUnam = simulatedDomainName.toLowerCase().includes('unam');
                                const isTec = simulatedDomainName.toLowerCase().includes('tec');
                                
                                let primary = '250 84% 54%';
                                let secondary = '221 83% 53%';
                                let accent = '142 71% 45%';

                                if (isUnam) {
                                  primary = '45 95% 45%'; // Dorado UNAM
                                  secondary = '220 90% 20%'; // Azul UNAM
                                  accent = '12 80% 50%';
                                } else if (isTec) {
                                  primary = '130 80% 30%'; // Verde TEC
                                  secondary = '220 80% 35%';
                                  accent = '38 90% 50%'; // Naranja
                                } else {
                                  // Generar HSL aleatorio
                                  const randomHue = Math.floor(Math.random() * 360);
                                  primary = `${randomHue} 80% 45%`;
                                  secondary = `${(randomHue + 120) % 360} 70% 35%`;
                                  accent = `${(randomHue + 240) % 360} 90% 45%`;
                                }

                                setOnboardingData(prev => ({
                                  ...prev,
                                  themeColors: { primary, secondary, accent }
                                }));
                                setIsSimulatingColors(false);
                                setShowColorSuccess(true);
                              }, 1800);
                            }}
                            className="px-4 bg-zinc-950 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
                          >
                            <Globe className="h-4 w-4 text-emerald-500" />
                            Analizar
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Cargar Logotipo Oficial</label>
                        <div className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 text-zinc-400" />
                          <div>
                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Sube el logotipo (.png, .jpg)</p>
                            <p className="text-[9.5px] text-zinc-400">Extraeremos el color principal de forma dinámica</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-50 dark:bg-zinc-955 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 flex flex-col gap-4 text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Identidad Sugerida
                      </span>

                      {isSimulatingColors ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
                          <p className="text-[11px] text-zinc-400 italic">Leyendo estilos e imágenes de la página web...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {showColorSuccess && (
                            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              ✓ ¡Paleta de colores analizada y extraída con éxito!
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span>Color Primario (Tema Principal)</span>
                            <span className="h-6 w-16 rounded border shadow-sm" style={{ backgroundColor: `hsl(${onboardingData.themeColors.primary})` }} />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Color Secundario (Bordes/Headers)</span>
                            <span className="h-6 w-16 rounded border shadow-sm" style={{ backgroundColor: `hsl(${onboardingData.themeColors.secondary})` }} />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Color de Acento (Logros/Felicidades)</span>
                            <span className="h-6 w-16 rounded border shadow-sm" style={{ backgroundColor: `hsl(${onboardingData.themeColors.accent})` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: CONFIRMACIÓN Y PERSONALIZACIÓN DE TEMA */}
              {onboardingStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 3: Personalización del Tema de Colores</h2>
                    <p className="text-xs text-zinc-400">Vista previa de la interfaz del sistema. Modifica los selectores para afinar el estilo a tu gusto antes de aplicarlo.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Selectores */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Color Principal (Primario)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={onboardingData.themeColors.primary}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData,
                              themeColors: { ...onboardingData.themeColors, primary: e.target.value }
                            })}
                            className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-mono"
                          />
                          <input
                            type="color"
                            onChange={(e) => {
                              // Convertir HEX a HSL simulado rápido
                              const hex = e.target.value;
                              let r = parseInt(hex.slice(1, 3), 16) / 255;
                              let g = parseInt(hex.slice(3, 5), 16) / 255;
                              let b = parseInt(hex.slice(5, 7), 16) / 255;
                              let max = Math.max(r, g, b), min = Math.min(r, g, b);
                              let h = 0, s = 0, l = (max + min) / 2;
                              if (max !== min) {
                                let d = max - min;
                                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                                switch(max){
                                  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                                  case g: h = (b - r) / d + 2; break;
                                  case b: h = (r - g) / d + 4; break;
                                }
                                h /= 6;
                              }
                              setOnboardingData({
                                ...onboardingData,
                                themeColors: { ...onboardingData.themeColors, primary: `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%` }
                              });
                            }}
                            className="h-10 w-10 border rounded-lg overflow-hidden cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Color Secundario</label>
                        <input
                          type="text"
                          value={onboardingData.themeColors.secondary}
                          onChange={(e) => setOnboardingData({
                            ...onboardingData,
                            themeColors: { ...onboardingData.themeColors, secondary: e.target.value }
                          })}
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-455 uppercase block mb-1">Color de Acento</label>
                        <input
                          type="text"
                          value={onboardingData.themeColors.accent}
                          onChange={(e) => setOnboardingData({
                            ...onboardingData,
                            themeColors: { ...onboardingData.themeColors, accent: e.target.value }
                          })}
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Previsualizador de Componentes */}
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-955 border rounded-3xl flex flex-col gap-4">
                      <span className="text-[10px] font-black uppercase text-zinc-400">Previsualizador de Componentes</span>
                      
                      {/* Botón */}
                      <button
                        type="button"
                        className="py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all text-center"
                        style={{ backgroundColor: `hsl(${onboardingData.themeColors.primary})`, boxShadow: `0 4px 6px -1px hsl(${onboardingData.themeColors.primary} / 0.15)` }}
                      >
                        Botón de Muestra (Primario)
                      </button>

                      {/* Tarjeta */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border flex flex-col gap-2" style={{ borderColor: `hsl(${onboardingData.themeColors.secondary} / 0.3)` }}>
                        <span className="text-[10px] font-bold" style={{ color: `hsl(${onboardingData.themeColors.primary})` }}>Categoría Académica</span>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tarjeta Informativa del Colegio</p>
                      </div>

                      {/* Logro */}
                      <div className="p-2.5 rounded-xl border text-[10.5px] font-bold flex items-center gap-1.5" style={{ backgroundColor: `hsl(${onboardingData.themeColors.accent} / 0.05)`, borderColor: `hsl(${onboardingData.themeColors.accent} / 0.2)`, color: `hsl(${onboardingData.themeColors.accent})` }}>
                        <Sparkles className="h-4 w-4" />
                        Logro obtenido: +150 XP
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4: ALTA DE COORDINADORES Y PROFESORES */}
              {onboardingStep === 4 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 4: Coordinadores y Plantilla Docente</h2>
                    <p className="text-xs text-zinc-400">Agrega los nombres del personal coordinador y docente que utilizará el sistema.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coordinadores */}
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block">Coordinadores Iniciales</label>
                      <div className="flex flex-wrap gap-2">
                        {onboardingData.coordinators.map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-150 dark:bg-zinc-800 text-xs font-semibold rounded-lg">
                            {c}
                            <button type="button" onClick={() => setOnboardingData({ ...onboardingData, coordinators: onboardingData.coordinators.filter((_, idx) => idx !== i) })} className="text-red-500 ml-1">✕</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="onb-coord-input"
                          placeholder="Nombre del Coordinador"
                          className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('onb-coord-input') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              setOnboardingData({ ...onboardingData, coordinators: [...onboardingData.coordinators, el.value.trim()] });
                              el.value = '';
                            }
                          }}
                          className="px-4 bg-brand-primary text-white rounded-xl text-xs font-bold"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>

                    {/* Profesores */}
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block">Docentes Iniciales</label>
                      <div className="flex flex-wrap gap-2">
                        {onboardingData.teachers.map((t, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-150 dark:bg-zinc-800 text-xs font-semibold rounded-lg">
                            {t}
                            <button type="button" onClick={() => setOnboardingData({ ...onboardingData, teachers: onboardingData.teachers.filter((_, idx) => idx !== i) })} className="text-red-500 ml-1">✕</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="onb-teach-input"
                          placeholder="Nombre del Docente"
                          className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('onb-teach-input') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              setOnboardingData({ ...onboardingData, teachers: [...onboardingData.teachers, el.value.trim()] });
                              el.value = '';
                            }
                          }}
                          className="px-4 bg-brand-primary text-white rounded-xl text-xs font-bold"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Pie de Página del Onboarding */}
            <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/20 flex justify-between items-center">
              <button
                type="button"
                disabled={onboardingStep === 1}
                onClick={() => setOnboardingStep(prev => prev - 1)}
                className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 disabled:opacity-40 hover:bg-zinc-100"
              >
                Atrás
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onboardingStep < 4) {
                    setOnboardingStep(prev => prev + 1);
                  } else {
                    // Finalizar y Guardar
                    saveSchoolSettings({
                      ...onboardingData,
                      isConfigured: true
                    });
                    alert(`¡Onboarding escolar finalizado!\nPlantel "${onboardingData.name}" configurado correctamente en el sistema.`);
                  }
                }}
                className="px-6 py-2.5 bg-brand-primary text-white rounded-full text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-brand-primary/15"
              >
                {onboardingStep === 4 ? 'Finalizar Configuración' : 'Siguiente Paso'}
              </button>
            </div>

          </div>
        </div>
      )}


      {/* --- MODAL FORMULARIO DE ALTA DE ALUMNO --- */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 my-8">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-violet-500" />
                  Expediente de Inscripción Escolar (NEM)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Registra la información del alumno para su asignación escolar.</p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="h-7 w-7 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[50vh] overflow-y-auto pr-1">
                
                {/* COLUMNA 1: DATOS PERSONALES */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest border-b pb-1">1. Datos Personales</span>
                  
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Primer Nombre *</label>
                    <input
                      required
                      type="text"
                      value={newStudentData.first_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Ej. Juan"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Segundo Nombre</label>
                    <input
                      type="text"
                      value={newStudentData.second_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, second_name: e.target.value }))}
                      placeholder="Ej. Carlos"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Primer Apellido *</label>
                    <input
                      required
                      type="text"
                      value={newStudentData.last_name_1}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, last_name_1: e.target.value }))}
                      placeholder="Ej. Pérez"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Segundo Apellido</label>
                    <input
                      type="text"
                      value={newStudentData.last_name_2}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, last_name_2: e.target.value }))}
                      placeholder="Ej. Gómez"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase block mb-0.5">Fecha Nacimiento *</label>
                    <input
                      required
                      type="date"
                      value={newStudentData.birth_date}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Género</label>
                      <select
                        value={newStudentData.gender}
                        onChange={(e) => setNewStudentData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* COLUMNA 2: ACADÉMICOS Y REGISTROS */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest border-b pb-1">2. Datos de Inscripción</span>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-[9.5px] font-bold text-zinc-400 uppercase">CURP / Matrícula</label>
                      <button
                        type="button"
                        onClick={generateSimulatedCurp}
                        className="text-[9px] text-violet-600 dark:text-violet-400 font-extrabold hover:underline"
                      >
                        Autogenerar CURP
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newStudentData.curp}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, curp: e.target.value.toUpperCase() }))}
                      placeholder="CURP de 18 caracteres"
                      maxLength={18}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={newStudentData.enrollment_id}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, enrollment_id: e.target.value.toUpperCase() }))}
                      placeholder="Matrícula Oficial"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white mt-1.5 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Nivel Educativo *</label>
                    <select
                      value={newStudentData.level}
                      onChange={(e: any) => {
                        const lvl = e.target.value;
                        setNewStudentData(prev => ({ ...prev, level: lvl, grade: getGradesForLevel(lvl)[0] }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="primaria">Primaria</option>
                      <option value="secundaria">Secundaria</option>
                      <option value="preparatoria">Preparatoria</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Grado Escolar *</label>
                    <select
                      value={newStudentData.grade}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    >
                      {getGradesForLevel(newStudentData.level).map(gr => (
                        <option key={gr} value={gr}>{gr}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Turno Escolar</label>
                    <select
                      value={newStudentData.shift}
                      onChange={(e: any) => setNewStudentData(prev => ({ ...prev, shift: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="matutino">Matutino</option>
                      <option value="vespertino">Vespertino</option>
                      <option value="completo">Tiempo Completo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Escuela de Procedencia</label>
                    <input
                      type="text"
                      value={newStudentData.previous_school}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, previous_school: e.target.value }))}
                      placeholder="Nombre del plantel anterior"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* COLUMNA 3: TUTORES, CONTACTO Y SALUD */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest border-b pb-1">3. Familia, Contacto y Salud</span>
                  
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Nombre de la Madre / Padre</label>
                    <input
                      type="text"
                      value={newStudentData.mother_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, mother_name: e.target.value }))}
                      placeholder="Nombre de la Madre"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white mb-1.5 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={newStudentData.father_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, father_name: e.target.value }))}
                      placeholder="Nombre del Padre"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Contacto de Emergencia</label>
                    <input
                      type="text"
                      value={newStudentData.emergency_contact_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      placeholder="Nombre Completo"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white mb-1.5 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={newStudentData.emergency_contact_phone}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      placeholder="Teléfono de Emergencia"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Tipo Sangre</label>
                      <select
                        value={newStudentData.blood_type}
                        onChange={(e) => setNewStudentData(prev => ({ ...prev, blood_type: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Alergias o Restricciones Médicas</label>
                    <textarea
                      value={newStudentData.medical_notes}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, medical_notes: e.target.value }))}
                      placeholder="Especifica alergias alimentarias o medicamentos..."
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white min-h-[50px] focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Comentarios Académicos</label>
                    <textarea
                      value={newStudentData.academic_notes}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, academic_notes: e.target.value }))}
                      placeholder="Historial cualitativo u observaciones..."
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white min-h-[50px] focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Campos de contacto */}
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Dirección de Contacto</label>
                    <input
                      type="text"
                      value={newStudentData.address}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Calle, Número y Colonia"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Teléfono Fijo / Móvil</label>
                    <input
                      type="text"
                      value={newStudentData.phone}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Número de 10 dígitos"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Correo de Contacto</label>
                    <input
                      type="email"
                      value={newStudentData.email}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                </div>

              </div>

              {/* Botones del Formulario */}
              <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 hover:bg-zinc-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-full text-xs font-bold shadow-md shadow-violet-500/10 transition-all"
                >
                  Inscribir Alumno
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de Detalle de Alumno */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="relative p-6 border-b border-zinc-100 dark:border-zinc-850 flex flex-col md:flex-row items-center gap-6 bg-zinc-50/50 dark:bg-zinc-950/20">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Foto de Perfil con borde según nivel */}
              <div className={`relative h-24 w-24 rounded-full overflow-hidden border-4 flex-shrink-0 shadow-lg ${
                selectedStudent.level === 'primaria' ? 'border-blue-400' :
                selectedStudent.level === 'secundaria' ? 'border-violet-500' : 'border-orange-500'
              }`}>
                <img 
                  src={selectedStudent.photo_url || '/images/students/default.png'} 
                  alt={`${selectedStudent.first_name} ${selectedStudent.last_name_1}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedStudent.level === 'primaria' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' :
                    selectedStudent.level === 'secundaria' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400' : 
                    'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'
                  }`}>
                    {selectedStudent.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold">
                    {selectedStudent.grade}
                  </span>
                  {selectedStudent.group_id && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold">
                      Grupo {groupsList.find(g => g.id === selectedStudent.group_id)?.name || ''}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold">
                    Turno {selectedStudent.shift || 'matutino'}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                  {selectedStudent.first_name} {selectedStudent.second_name || ''} {selectedStudent.last_name_1} {selectedStudent.last_name_2 || ''}
                </h2>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
                  <span className="font-mono"><strong>Matrícula:</strong> {selectedStudent.enrollment_id}</span>
                  <span className="font-mono"><strong>CURP:</strong> {selectedStudent.curp}</span>
                </div>
              </div>
            </div>

            {/* Contenido (Desplazable si es necesario) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-violet-500" />
                    Datos Personales
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Fecha de Nacimiento</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.birth_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Edad Calculada</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{calculateAge(selectedStudent.birth_date)} años</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Género</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.gender || 'Masculino'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Escuela de Procedencia</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.previous_school || 'Ninguna'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Estado en el Sistema</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase mt-1">
                        ● {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: CONTACTO Y FAMILIA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-violet-500" />
                    Contacto y Familiares
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Dirección</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0 mt-0.5" /> {selectedStudent.address || 'S/D'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Teléfono de Contacto</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-zinc-400" /> {selectedStudent.phone || 'S/T'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Correo Electrónico</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-zinc-400" /> {selectedStudent.email || 'S/C'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Padres / Tutores</span>
                      <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 leading-tight space-y-1">
                        {selectedStudent.mother_name && <div>• <strong>Madre:</strong> {selectedStudent.mother_name}</div>}
                        {selectedStudent.father_name && <div>• <strong>Padre:</strong> {selectedStudent.father_name}</div>}
                        {selectedStudent.tutor_name && <div>• <strong>Tutor Legal:</strong> {selectedStudent.tutor_name}</div>}
                      </div>
                    </div>
                    {(selectedStudent.emergency_contact_name || selectedStudent.emergency_contact_phone) && (
                      <div className="border-t border-zinc-200/40 dark:border-zinc-800/40 pt-2 mt-2">
                        <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase block">Contacto de Emergencia</span>
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block">{selectedStudent.emergency_contact_name || 'S/N'}</span>
                        <span className="text-[10.5px] text-zinc-500 block">{selectedStudent.emergency_contact_phone || 'S/T'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN 3: EXPEDIENTE MÉDICO Y ADMINISTRATIVO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-violet-500" />
                    Expediente Escolar
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Pagos Pendientes */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Pagos y Adeudos</span>
                      {selectedStudent.pending_payments && selectedStudent.pending_payments.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedStudent.pending_payments.map((p, idx) => (
                            <div key={idx} className="p-2 rounded bg-amber-50 dark:bg-amber-955/10 border border-amber-200/50 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              {p}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-955/10 border border-emerald-200/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-450 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Sin adeudos registrados.
                        </div>
                      )}
                    </div>

                    {/* Reportes de Conducta */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Reportes de Conducta</span>
                      {selectedStudent.behavior_reports && selectedStudent.behavior_reports.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.behavior_reports.map((r, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-955/10 border border-rose-200/40 text-[10.5px]">
                              <div className="flex justify-between font-bold text-rose-700 dark:text-rose-400 mb-1 text-[9.5px]">
                                <span>Reporta: {r.reporter}</span>
                                <span>{r.date}</span>
                              </div>
                              <p className="text-zinc-700 dark:text-zinc-300">{r.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No cuenta con incidencias ni reportes disciplinarios.</p>
                      )}
                    </div>

                    {/* Notas del Profesor */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Notas de Profesores</span>
                      {selectedStudent.teacher_notes && selectedStudent.teacher_notes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.teacher_notes.map((n, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-violet-50/60 dark:bg-violet-955/10 border border-violet-200/30 text-[10.5px]">
                              <div className="flex justify-between font-bold text-violet-700 dark:text-violet-400 mb-1 text-[9.5px]">
                                <span>Prof. {n.teacher_name}</span>
                                <span>{n.date}</span>
                              </div>
                              <p className="text-zinc-700 dark:text-zinc-300 italic">"{n.note}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">Sin anotaciones de maestros.</p>
                      )}
                    </div>

                    {/* Médico */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Tipo de Sangre</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-extrabold">{selectedStudent.blood_type || 'S/D'}</span>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Alergias / Restricciones Médicas</span>
                        {selectedStudent.medical_notes ? (
                          <div className="p-2.5 rounded-lg bg-red-50/80 border border-red-200/50 dark:bg-red-950/10 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                            {selectedStudent.medical_notes}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ninguna alergia reportada</span>
                        )}
                      </div>
                    </div>

                    {/* Notas Académicas de Coordinación */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Notas de Coordinación</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                        {selectedStudent.academic_notes || "Sin notas académicas registradas en este expediente."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Pie de Modal */}
            <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/10 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full text-xs font-bold shadow-md shadow-zinc-500/10 transition-all"
              >
                Cerrar Expediente
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
