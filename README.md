# LAB12 — Biblioteca API · Parte 01

Laboratorio 12 de Desarrollo de Aplicaciones Web Avanzado, TECSUP.
API REST para gestionar autores y libros con Next.js App Router, TypeScript,
Tailwind CSS, ESLint, Prisma ORM y PostgreSQL en Supabase (`lab12-biblioteca-api`).

## Entorno y ejecución

Versiones verificadas: Node.js 24.21.0, npm 11.19.0, Next.js 16.4.6,
React 19.3.1 y Prisma CLI/Client 7.10.1.

```bash
npm ci
cp .env.example .env
# Completar .env localmente antes de conectar
npx prisma generate
npm run dev
```

Abrir http://localhost:3000. Turbopack está habilitado y React Compiler deshabilitado.
El cliente generado no se versiona: ejecutar `prisma generate` tras instalar.

## Conexión

`.env` contiene `DATABASE_URL` para la aplicación y `DIRECT_URL` para Prisma CLI.
Ambas pueden usar Session pooler de Supabase, puerto 5432, base `postgres`.
Copiar los parámetros del panel Connect y codificar la contraseña para URL.
`.env.example` contiene solo marcadores. Nunca versionar archivos de credenciales.

La configuración CLI está en `prisma.config.ts`, como requiere Prisma 7.
La aplicación usa `@prisma/adapter-pg` y una instancia reutilizable del cliente.
Se respeta la semántica libpq de `sslmode=require`: conexión cifrada obligatoria,
sin validación de identidad del servidor. Se configuró `uselibpqcompat=true` en
el adaptador porque pg interpretaba require como verify-full y rechazaba la cadena
con SELF_SIGNED_CERT_IN_CHAIN. Para producción, configurar la CA de confianza y
`sslmode=verify-full`. No se deshabilita TLS globalmente.

Antes de sincronizar cualquier cambio futuro, revisar el SQL de solo lectura:

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

En esta etapa se revisó que el SQL solo creara `Author`, `Book`, índices y la clave
foránea. Después se ejecutó `prisma db push` sin aceptación de pérdida de datos.
No ejecutar operaciones de reset ni alterar tablas ajenas al laboratorio.

## Modelos y diferencias con el encargo

Se priorizó la guía oficial (página 7): IDs String con cuid; Author tiene name y
email obligatorios, email único; bio, nationality y birthYear opcionales.
Book tiene title y authorId obligatorios; description, isbn único, publishedYear,
genre y pages opcionales. Ambos modelos tienen createdAt y updatedAt.
Relación uno a muchos, con borrado en cascada. Índices de Book: authorId, genre, title.
La guía ordena autores por name asc, aunque el prompt decía createdAt desc.

Adaptaciones técnicas: URL en prisma.config.ts, generador prisma-client con salida
explícita, adaptador pg, parámetros dinámicos Promise con await en Next.js 16,
errores tipados sin any. Las actualizaciones parciales preservan campos omitidos.
Se validan tipos, JSON malformado y enteros; pages, si se informa, debe ser mayor
que cero. La guía no establece un formato ni checksum obligatorio de ISBN: se
acepta texto no vacío y se exige unicidad cuando se informa.

## Endpoints

| Método | Ruta | Respuesta correcta |
|---|---|---|
| GET | /api/authors | 200, autores con books y _count, nombre ascendente |
| POST | /api/authors | 201, autor creado con books |
| GET | /api/authors/[id] | 200, autor con books ordenados por publishedYear desc y _count |
| PUT | /api/authors/[id] | 200, actualización parcial |
| DELETE | /api/authors/[id] | 200, mensaje; elimina libros en cascada |
| GET | /api/authors/[id]/books | 200, author {id,name}, totalBooks, books |
| GET | /api/books | 200, libros con author {id,name,email}, createdAt desc |
| GET | /api/books?genre=Novela | 200, filtro exacto de género |
| GET | /api/books?authorId=[id] | 200, filtro de autor; combinable con genre |
| POST | /api/books | 201, libro con author |
| GET | /api/books/[id] | 200, libro con author |
| PUT | /api/books/[id] | 200, actualización parcial con author |
| DELETE | /api/books/[id] | 200, mensaje |

Errores JSON `{ "error": "mensaje" }`: 400 entrada inválida, 404 registro o autor
relacionado inexistente, 409 email/ISBN duplicado, 500 error interno sin detalles
sensibles. Las eliminaciones responden `{ "message": "Autor eliminado correctamente" }`
o su equivalente para libro.

Ejemplo de autor:

```json
{"name":"Gabriel García Márquez","email":"gabo@example.com","nationality":"Colombia","birthYear":1927,"bio":"Premio Nobel de Literatura 1982"}
```

Ejemplo de libro (usar el ID real recibido):

```json
{"title":"Cien años de soledad","description":"Obra maestra del realismo mágico","isbn":"978-0307474728","publishedYear":1967,"genre":"Novela","pages":417,"authorId":"ID_REAL"}
```

La respuesta 201 es el objeto creado con su id, campos y relación, sin envoltorio.

## Validación y pruebas

```bash
npm run lint
npx tsc --noEmit
npm run build
npx prisma validate
npx prisma generate
# Con npm run dev activo en otra terminal:
node scripts/test-api.mjs
```

Los cinco ejercicios superaron lint, TypeScript, build y validación/generación
Prisma. Se ejecutaron 44 comprobaciones HTTP reales contra Supabase: CRUD,
relaciones, filtros, email/ISBN duplicados, entradas inválidas, inexistentes y
cascada. Ver `evidencias/parte-01/resultados-http.json`.
La suite crea y limpia sus propios registros; no usarla contra datos productivos.

Importar `postman/LAB12-Biblioteca-Parte01.postman_collection.json` en Postman,
revisar baseUrl y ejecutar en orden. Los POST guardan authorId y bookId reales.
Verificar antes que gabo@example.com y el ISBN del docente no estén ocupados;
los DELETE finales eliminan los ejemplos creados. Nunca usar IDs de datos ajenos.
La colección incluye aserciones HTTP, cuerpos y casos negativos.
No se ejecutó Postman: las capturas reales del usuario siguen pendientes en
`evidencias/parte-01/`, donde se indica qué evidencias guardar.

## Auditoría

`npm audit`: 7 vulnerabilidades moderadas de desarrollo, en minimatch y su cadena
@typescript-eslint (parser, plugin, type-utils, typescript-estree, utils y
typescript-eslint). Aviso GHSA-g3hv-75wg-m249: posible denegación de servicio al
procesar patrones glob. `npm audit --omit=dev`: 0 vulnerabilidades.
`npm audit fix` compatible no cambió dependencias ni resolvió los avisos.
No se utilizó --force. Pendiente actualización compatible del árbol de ESLint.

## Estructura

- prisma/schema.prisma: modelos y relaciones.
- prisma.config.ts: datasource del CLI.
- src/generated/prisma/: cliente generado, ignorado.
- src/lib/: conexión y validación de API.
- src/app/api/authors/ y src/app/api/books/: cinco Route Handlers.
- src/app/: página inicial y estilos.
- scripts/test-api.mjs: pruebas HTTP con limpieza.
- postman/: colección importable.
- evidencias/parte-01/: resultados y capturas pendientes.

## Estado y alcance pendiente

Parte 01 implementada y probada por HTTP. Pendientes las capturas manuales de
Postman. No se implementó TAREA: /api/books/search con búsqueda y paginación,
/api/authors/[id]/stats, dashboard, vistas de libros y detalle de autor,
formularios React, filtros avanzados ni despliegue Vercel.
