# Guía de Desarrollo y Colaboración - ISkool

¡Bienvenidos al proyecto ISkool! Esta guía describe el flujo de trabajo estándar para colaborar de forma ordenada y profesional en el repositorio.

---

## 🚀 Flujo de Trabajo con Git

Para asegurar que el código en la rama principal (`main`) siempre funcione y no tengamos conflictos difíciles de resolver, seguiremos la metodología **GitHub Flow**.

### 1. Preparar el terreno antes de trabajar
Antes de empezar a programar cualquier cambio, asegúrate de estar en la rama principal y descargar los últimos cambios hechos por otros compañeros:
```bash
git checkout main
git pull origin main
```

### 2. Crear una rama para tu tarea
Nunca trabajes directamente sobre la rama `main`. Crea una nueva rama que describa la tarea que vas a realizar:
```bash
git checkout -b feature/nombre-de-la-tarea
```
*Ejemplos:*
- `feature/dashboard-docente`
- `feature/asistencia-diaria`
- `bugfix/correccion-estilos`

### 3. Guardar y subir tus cambios
Mientras trabajas, realiza confirmaciones (commits) que sean específicos y claros:
```bash
git add .
git commit -m "feat: crear interfaz básica de calificaciones para profesores"
git push -u origin feature/nombre-de-la-tarea
```

### 4. Crear un Pull Request (PR)
Cuando termines tu tarea:
1. Entra a [duran14/ISkool en GitHub](https://github.com/duran14/ISkool).
2. Verás un botón amarillo que dice **"Compare & pull request"** para tu rama recién subida. Haz clic en él.
3. Agrega una breve descripción de lo que hiciste.
4. Asígnale la revisión a tu compañero de equipo para que revise y apruebe el código.
5. Una vez aprobado, realiza el **Merge** para incorporar los cambios a `main`.

---

## 🛠️ Entorno de Desarrollo Local

### Requisitos Previos
- Node.js instalado (v20 o superior recomendado, actual: v24.16.0)
- Acceso al repositorio de GitHub

### Configuración inicial (Para nuevos colaboradores)
Si es la primera vez que descargas el proyecto:
```bash
git clone https://github.com/duran14/ISkool.git
cd ISkool
npm install
```

### Ejecutar el servidor de desarrollo
Para ver la aplicación corriendo localmente en tu computadora:
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Reglas de Calidad (Próximamente)
Implementaremos **Vitest** y **Husky** en el proyecto. Esto significa que antes de que puedas hacer un `git commit`, el sistema ejecutará automáticamente análisis de código (ESLint) y pruebas para certificar que todo compile y funcione correctamente. Si algo está roto, la herramienta impedirá el commit y te indicará qué corregir.
