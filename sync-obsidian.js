const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURACIÓN: RUTA DESTINO DE OBSIDIAN (Escapada para Windows)
// ============================================================================
const OBSIDIAN_VAULT_PATH = 'C:\\Users\\kami-\\Desktop\\2025-2026\\iskool\\obsidean\\brain\\iskool';

// Lista de archivos críticos de arquitectura a sincronizar
const FILES_TO_SYNC = [
  'schema.sql',
  'schema_gamification.sql',
  'supabase_functions.sql',
  'src/types/index.ts'
];

/**
 * Determina el lenguaje del bloque de código markdown basado en la extensión.
 */
function determineLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.sql') return 'sql';
  if (ext === '.ts' || ext === '.tsx') return 'typescript';
  if (ext === '.js' || ext === '.jsx') return 'javascript';
  if (ext === '.json') return 'json';
  return '';
}

/**
 * Procesa y sincroniza los archivos
 */
function syncFiles() {
  console.log('🚀 Iniciando sincronización de archivos de arquitectura a Obsidian...');
  console.log(`📂 Ruta de la bóveda: ${OBSIDIAN_VAULT_PATH}\n`);

  if (!fs.existsSync(OBSIDIAN_VAULT_PATH)) {
    console.error(`❌ Error: La ruta de la bóveda de Obsidian no existe: ${OBSIDIAN_VAULT_PATH}`);
    process.exit(1);
  }

  let successCount = 0;

  for (const srcRelativePath of FILES_TO_SYNC) {
    const srcFullPath = path.join(__dirname, srcRelativePath);

    if (!fs.existsSync(srcFullPath)) {
      console.warn(`⚠️ Archivo de origen no encontrado: ${srcRelativePath}`);
      continue;
    }

    try {
      // 1. Leer el contenido del archivo de origen
      const content = fs.readFileSync(srcFullPath, 'utf8');

      // 2. Determinar la ruta relativa y absoluta del destino con extensión .md
      const destRelativePath = srcRelativePath.replace(/\.[^/.]+$/, '') + '.md';
      const destFullPath = path.join(OBSIDIAN_VAULT_PATH, destRelativePath);

      // 3. Creación segura de directorios previos
      const destDir = path.dirname(destFullPath);
      fs.mkdirSync(destDir, { recursive: true });

      // 4. Construir la estructura del archivo Markdown
      const lang = determineLanguage(srcRelativePath);
      const timestamp = new Date().toISOString();
      const filename = path.basename(srcRelativePath);

      const markdownContent = `---
tags: [iskool, arquitectura, smart-connections]
archivo_origen: "${srcRelativePath.replace(/\\/g, '/')}"
fecha_sincronizacion: "${timestamp}"
---

# ${filename}

Este archivo contiene el código fuente de arquitectura para **${filename}**.

\`\`\`${lang}
${content.trim()}
\`\`\`
`;

      // 5. Escribir el archivo Markdown resultante
      fs.writeFileSync(destFullPath, markdownContent, 'utf8');
      console.log(`✅ Sincronizado: ${srcRelativePath} -> ${destRelativePath}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error sincronizando ${srcRelativePath}:`, error.message);
    }
  }

  console.log(`\n🎉 Sincronización completada. ${successCount}/${FILES_TO_SYNC.length} archivos procesados con éxito.`);
}

syncFiles();
