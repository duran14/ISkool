/**
 * sync-obsidian.js
 * 
 * Script automatizado para leer el código fuente principal de ISkool y
 * generar/actualizar automáticamente las notas Markdown correspondientes
 * en Obsidian para el sistema RAG (Smart Connections).
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. RUTA DESTINO DE OBSIDIAN
// ============================================================================
const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool\\';

// Definición de archivos a procesar y sus rutas destino relativas en Obsidian
const FILE_MAP = [
  {
    source: 'schema.sql',
    dest: 'schema.md',
    title: 'Esquema de Base de Datos - Módulo Académico',
    type: 'sql'
  },
  {
    source: 'schema_gamification.sql',
    dest: 'schema_gamification.md',
    title: 'Esquema de Base de Datos - Gamificación y Portafolio',
    type: 'sql'
  },
  {
    source: 'src/types/index.ts',
    dest: 'src\\types\\index.md',
    title: 'Definiciones de Tipos y Modelos (TypeScript)',
    type: 'types'
  },
  {
    source: 'src/store/useGamificationStore.ts',
    dest: 'src\\store\\useGamificationStore.md',
    title: 'useGamificationStore - Estado de Gamificación y Tiempo Real',
    type: 'store'
  },
  {
    source: 'src/store/useSchoolAdminStore.ts',
    dest: 'src\\store\\useSchoolAdminStore.md',
    title: 'useSchoolAdminStore - Control Escolar, Debounce y Persistencia',
    type: 'store'
  }
];

// ============================================================================
// FUNCIONES AUXILIARES DE PARSEO
// ============================================================================

/**
 * Parsea bloques de comentario JSDoc.
 */
function parseJSDoc(commentText) {
  const lines = commentText.split('\n').map(l => l.replace(/^\s*\*\s?/, '').trim());
  const tags = {};
  let currentTag = 'description';
  let currentText = [];

  for (const line of lines) {
    if (line.startsWith('@')) {
      if (currentTag && currentText.length > 0) {
        tags[currentTag] = currentText.join(' ').trim();
      }
      const match = line.match(/^@(\w+)(?:\s+(.*))?$/);
      if (match) {
        currentTag = match[1];
        currentText = match[2] ? [match[2]] : [];
      }
    } else {
      if (line) {
        currentText.push(line);
      }
    }
  }
  if (currentTag && currentText.length > 0) {
    tags[currentTag] = currentText.join(' ').trim();
  }
  return tags;
}

/**
 * Parsea esquemas SQL para obtener resúmenes de tablas.
 */
function extractTablesFromSQL(content) {
  const parts = content.split(/\/\*\*/);
  const tables = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const endCommentIdx = part.indexOf('*/');
    if (endCommentIdx === -1) continue;

    const commentText = part.substring(0, endCommentIdx);
    const codeAfter = part.substring(endCommentIdx + 2).trim();

    const jsdoc = parseJSDoc(commentText);
    let name = jsdoc.table || '';

    if (!name) {
      const match = codeAfter.match(/create\s+table\s+(?:public\.)?(\w+)/i);
      if (match) name = match[1];
    }

    if (name) {
      tables.push({
        name: name.trim(),
        description: jsdoc.description || 'Sin descripción',
        relation: jsdoc.relation || ''
      });
    }
  }
  return tables;
}

/**
 * Parsea src/types/index.ts para extraer interfaces, enums y tipos.
 */
function parseTypesFile(content) {
  const parts = content.split(/\/\*\*/);
  const types = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const endCommentIdx = part.indexOf('*/');
    if (endCommentIdx === -1) continue;

    const commentText = part.substring(0, endCommentIdx);
    const codeAfter = part.substring(endCommentIdx + 2).trim();

    const jsdoc = parseJSDoc(commentText);
    let name = jsdoc.interface || jsdoc.typedef || '';
    if (name.includes('}')) {
      name = name.split('}')[1].trim();
    }

    if (!name) {
      const match = codeAfter.match(/^export\s+(?:interface|type|enum)\s+(\w+)/);
      if (match) name = match[1];
    }

    let codeBlock = '';
    if (codeAfter.startsWith('export interface') || codeAfter.startsWith('export type')) {
      if (codeAfter.includes('{')) {
        let braceCount = 0;
        let idx = 0;
        let started = false;
        while (idx < codeAfter.length) {
          const char = codeAfter[idx];
          if (char === '{') {
            braceCount++;
            started = true;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0 && started) {
              codeBlock = codeAfter.substring(0, idx + 1);
              break;
            }
          }
          idx++;
        }
      } else {
        const match = codeAfter.match(/^export\s+type\s+[^\n=]+=[^;]+;/);
        if (match) {
          codeBlock = match[0];
        } else {
          const endIdx = codeAfter.indexOf(';');
          if (endIdx !== -1) {
            codeBlock = codeAfter.substring(0, endIdx + 1);
          } else {
            codeBlock = codeAfter.split('\n')[0];
          }
        }
      }
    }

    if (name) {
      types.push({
        name: name.trim(),
        kind: jsdoc.interface ? 'Interface' : 'Type',
        description: jsdoc.description || 'Sin descripción',
        database: jsdoc.database || '',
        relation: jsdoc.relation || '',
        stateImpact: jsdoc.stateImpact || '',
        code: codeBlock.trim()
      });
    }
  }
  return types;
}

/**
 * Parsea archivos de Zustand Store.
 */
function parseStoreInterface(content) {
  const interfaceMatch = content.match(/interface\s+(\w+State)\s*\{/);
  if (!interfaceMatch) return null;

  const interfaceName = interfaceMatch[1];
  const startIdx = content.indexOf(interfaceMatch[0]);
  const codeAfter = content.substring(startIdx);

  let braceCount = 0;
  let idx = 0;
  let interfaceCode = '';
  while (idx < codeAfter.length) {
    const char = codeAfter[idx];
    interfaceCode += char;
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        break;
      }
    }
    idx++;
  }
  return {
    interfaceName,
    code: interfaceCode.trim()
  };
}

// ============================================================================
// PROCESAMIENTO PRINCIPAL DE CADA ARCHIVO
// ============================================================================

function processFile(fileInfo) {
  const sourcePath = path.join(__dirname, fileInfo.source);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️ Archivo de origen no encontrado: ${fileInfo.source}`);
    return;
  }

  const content = fs.readFileSync(sourcePath, 'utf8');
  const now = new Date().toISOString();

  // 1. Construir frontmatter YAML
  let md = `---\n`;
  md += `tags: [iskool, arquitectura, automatizado]\n`;
  md += `archivo_origen: "${fileInfo.source}"\n`;
  md += `ultima_sincronizacion: "${now}"\n`;
  md += `---\n\n`;

  md += `# ${fileInfo.title}\n\n`;

  // 2. Generar cuerpo según el tipo de archivo
  if (fileInfo.type === 'sql') {
    const tables = extractTablesFromSQL(content);
    md += `## 📊 Resumen del Esquema\n\n`;
    if (fileInfo.source.includes('gamification')) {
      md += `Este esquema de base de datos define las mecánicas de gamificación, progresión, medallas, misiones y portafolio formativo (estilo Seesaw).\n\n`;
    } else {
      md += `Este esquema de base de datos define el módulo escolar académico central, controlando perfiles, inscripciones, periodos, calificaciones y asistencias.\n\n`;
    }

    tables.forEach(t => {
      md += `- **Tabla \`public.${t.name}\`**: ${t.description}\n`;
      if (t.relation) md += `  - *Relaciones*: ${t.relation}\n`;
    });
    md += `\n---\n\n`;
    md += `## 🗄️ Sentencias de Creación SQL\n\n`;
    md += `\`\`\`sql\n${content.trim()}\n\`\`\`\n`;

  } else if (fileInfo.type === 'types') {
    const types = parseTypesFile(content);
    md += `## 💻 Resumen de Modelos y Tipos\n\n`;
    md += `Este archivo define la estructura de datos compartida entre el backend (PostgreSQL/Supabase) y el frontend en Next.js.\n\n`;

    types.forEach(t => {
      md += `### ${t.kind}: \`${t.name}\`\n\n`;
      md += `* **Descripción:** ${t.description}\n`;
      if (t.database) md += `* **Mapeo de Base de Datos:** ${t.database}\n`;
      if (t.relation) md += `* **Relaciones:** ${t.relation}\n`;
      if (t.stateImpact) md += `* **Impacto en Estado:** ${t.stateImpact}\n`;
      md += `\n`;
      if (t.code) {
        md += `\`\`\`typescript\n${t.code}\n\`\`\`\n\n`;
      }
    });

  } else if (fileInfo.type === 'store') {
    const storeData = parseStoreInterface(content);
    
    if (fileInfo.source.includes('useGamificationStore')) {
      md += `## 🎮 Resumen del Store de Gamificación y Tiempo Real\n\n`;
      md += `Este almacén de estado Zustand coordina las acciones de RPG escolar y la sincronización asíncrona hacia Supabase sin "falsos positivos".\n\n`;
      md += `### ⚡ Características Críticas Implementadas:\n`;
      md += `- **Acciones Asíncronas con Supabase:**\n`;
      md += `  - \`submitQuiz\` / \`submitExam\`: Envío asíncrono y llamada al procedimiento remoto RPC (\`submit_quiz\`).\n`;
      md += `  - \`saveQuest\`: Verifica existencia local y realiza mutations (\`insert\` / \`update\`) en la tabla \`quests\` antes de alterar Zustand.\n`;
      md += `  - \`createArtifact\`: Inserta compras de ítems en la tabla \`shop_artifacts\` de forma persistente.\n`;
      md += `  - \`unlockBadge\`: Otorga medallas insertando registros en \`student_badges\` en Supabase.\n`;
      md += `- **Suscripción en Tiempo Real (Realtime):**\n`;
      md += `  - \`subscribeToGuildChanges\`: Configura un canal de Supabase en \`guild_events\` escuchando actualizaciones ('UPDATE') de vida del jefe en \`guild_bosses\` para sincronizar instantáneamente la barra de vida colectiva entre todos los estudiantes del grupo.\n\n`;
    } else if (fileInfo.source.includes('useSchoolAdminStore')) {
      md += `## 🏫 Resumen de Store de Administración Escolar y Debounce\n\n`;
      md += `Este almacén administra configuraciones del administrador escolar, materias, calendarios, grupos y asistencias.\n\n`;
      md += `### ⚡ Características Críticas Implementadas:\n`;
      md += `- **Patrón Debounce en Configuraciones:**\n`;
      md += `  - \`saveSchoolSettings\`: Almacena de forma instantánea en el estado Zustand para mantener la interfaz de usuario fluida, pero pospone y agrupa el envío de persistencia (\`upsert\`) en Supabase con un retraso (debounce) de 1000ms tras dejar de escribir.\n`;
      md += `- **Persistencia Real de Mutaciones RLS:**\n`;
      md += `  - \`deleteGroup\`: Ejecuta el borrado asíncrono de grupos directamente en Supabase, aplicando el \`set\` local solo si la respuesta es exitosa.\n`;
      md += `  - \`deleteSchedule\`: Borrado asíncrono del horario en \`class_schedules\` en la base de datos de producción.\n\n`;
    }

    if (storeData) {
      md += `### 🧠 Interfaz del Estado y Acciones (\`${storeData.interfaceName}\`)\n\n`;
      md += `\`\`\`typescript\n${storeData.code}\n\`\`\`\n\n`;
    }

    md += `### 📂 Código Completo del Componente\n\n`;
    md += `\`\`\`typescript\n${content.trim()}\n\`\`\`\n`;
  }

  // 3. Escribir archivo de salida en Obsidian
  const destPath = path.join(OBSIDIAN_VAULT_PATH, fileInfo.dest);
  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, md, 'utf8');
  console.log(`✅ Sincronizado: ${fileInfo.source} -> ${destPath}`);
}

// ============================================================================
// PUNTO DE ENTRADA
// ============================================================================

function main() {
  console.log('🚀 Iniciando sincronización de código a Obsidian para RAG (Smart Connections)...');
  console.log(`📂 Vault Destino: ${OBSIDIAN_VAULT_PATH}\n`);

  FILE_MAP.forEach(processFile);

  console.log('\n🎉 Sincronización completada con éxito.');
}

main();
