# LAB12 — Biblioteca API

Laboratorio 12 de Desarrollo de Aplicaciones Web Avanzado, TECSUP.
El objetivo es preparar un sistema de biblioteca con Next.js App Router, TypeScript,
Tailwind CSS, ESLint, Prisma ORM y PostgreSQL en Supabase (`lab12-biblioteca-api`).

## Requisitos e instalación

Node.js 24 y npm 11, Git y acceso a npm. GitHub CLI es opcional para publicar.

```bash
npm ci
cp .env.example .env
npm run dev
```

Abrir http://localhost:3000. El desarrollo utiliza Turbopack. React Compiler no está habilitado.

## Variables de entorno

Completar `.env` usando el panel Connect de Supabase:

- `DATABASE_URL`: URL PostgreSQL del pooler de sesión, puerto 5432.
- `DIRECT_URL`: URL PostgreSQL directa para administración.

Los valores de `.env.example` son marcadores, no credenciales. Reemplazar
`PROJECT_REF`, `POOLER_HOST` y `URL_ENCODED_PASSWORD`; codificar caracteres
especiales de la contraseña para URL. No versionar `.env` ni `.env.local`.
Prisma carga `.env` mediante dotenv. Su configuración usa DIRECT_URL con
DATABASE_URL como alternativa. El valor local de respaldo solo permite validar
el esquema sin credenciales; no representa una conexión real.

## Comandos

```bash
npm run lint
npm run build
npm start
npx prisma validate
```

No ejecutar migraciones ni `prisma db push` en esta etapa.
El cliente se generará en `src/generated/prisma` cuando se agreguen modelos;
la conexión del servidor se preparará en `src/lib` con `@prisma/adapter-pg`.

## Estructura

```text
prisma/schema.prisma
prisma.config.ts
public/
src/app/layout.tsx
src/app/page.tsx
src/app/globals.css
src/lib/README.md
.env.example
.gitignore
package.json
package-lock.json
tsconfig.json
eslint.config.mjs
next.config.ts
postcss.config.mjs
```

## Estado

Configuración inicial. Están pendientes las API Routes de autores y libros,
los modelos Author y Book, el dashboard y la tarea final. No se han realizado
operaciones de escritura en Supabase.

## Publicación pendiente si no existe GitHub CLI

Crear manualmente un repositorio público vacío llamado
`naomisanchez-coder/LAB12Web-BibliotecaAPI`. Verificar antes que no exista.
Una vez creado y comprobada la identidad y el repositorio:

```bash
git remote add origin https://github.com/naomisanchez-coder/LAB12Web-BibliotecaAPI.git
git push -u origin main
```
