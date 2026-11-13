# Biblioteca Atlas — LAB12 · API y TAREA

Laboratorio 12 de Desarrollo de Aplicaciones Web Avanzado, TECSUP.
Aplicación de biblioteca con dashboard, catálogo y perfiles editoriales para gestionar autores y libros con Next.js App Router, TypeScript,
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

## TAREA — Implementación avanzada

### Arquitectura

Las páginas de App Router `/`, `/books` y `/authors/[id]` montan componentes
interactivos que consumen las API mediante `src/lib/http.ts`. Prisma permanece
en los Route Handlers del servidor y usa PostgreSQL en Supabase. Los modelos y
contratos de la Parte 01 se conservan sin cambios. Los tipos JSON compartidos
están en `src/types/library.ts`; `src/lib/advanced.ts` contiene lógica pura
comprobable sin base de datos.

### Búsqueda y paginación

`GET /api/books/search` admite:

| Parámetro | Contrato |
|---|---|
| search | contains del título, sin distinguir mayúsculas |
| genre | coincidencia exacta |
| authorName | contains del nombre del autor, sin distinguir mayúsculas |
| page | entero positivo, predeterminado 1; máximo técnico 1 000 000 |
| limit | entero de 1 a 50, predeterminado 10 |
| sortBy | title, publishedYear o createdAt (predeterminado) |
| order | asc o desc (predeterminado) |

Los filtros se combinan con AND. Se usa `skip=(page-1)*limit` y `take=limit`.
`findMany` y `count` se ejecutan con el mismo filtro en una transacción de lectura
RepeatableRead para mantener consistencia. El segundo orden por id ascendente
resuelve empates. Solo se aceptan campos de orden de la lista blanca.
Parámetros numéricos vacíos, fraccionarios o fuera de límites devuelven 400.

```json
{"data":[],"pagination":{"page":1,"limit":10,"total":0,"totalPages":0,"hasNext":false,"hasPrev":false}}
```

Cada libro incluye autor (id, nombre y correo). Una página fuera de rango devuelve
200 con data vacío, el total real y hasNext=false; hasPrev permite retroceder si
existe alguna página. Una colección vacía tiene totalPages=0 y ambos indicadores
false. No se utiliza información ficticia.

### Estadísticas de autor

`GET /api/authors/[id]/stats` consulta al autor y selecciona los campos necesarios
de sus libros. Devuelve authorId, authorName, totalBooks, firstBook y latestBook
({title,year}), averagePages, genres y longestBook/shortestBook ({title,pages}).
Años nulos no intervienen en primer/último libro; páginas nulas no intervienen
en promedio ni extremos. El promedio se redondea con Math.round. Los géneros se
deduplican y ordenan. Si no hay datos para una métrica, el valor es null;
para autores sin libros totalBooks es 0 y genres es []. Autor inexistente: 404;
error interno: 500 sin detalles sensibles. Los empates se resuelven por id.

### Dashboard y CRUD de autores

Inicio obtiene los autores con sus libros desde `/api/authors` y calcula total
de autores, libros, promedio por autor y géneros únicos. Presenta nombre, correo,
nacionalidad y cantidad de libros. Registrar y editar abren un diálogo compartido
que envía POST/PUT. Eliminar solicita confirmación explícita indicando la cascada
sobre libros; después del DELETE se recargan los datos y se notifica el resultado.
El enlace Ver libros lleva al perfil del autor.

### Catálogo y gestión de libros

`/books` usa exclusivamente `/api/books/search` para los resultados paginados.
La búsqueda tiene debounce de 350 ms. AbortController y una bandera de vigencia
impiden que respuestas anteriores sustituyan resultados recientes. Cambiar un
filtro vuelve a página 1; los controles siguen disponibles durante la consulta.
Los géneros disponibles y nombres de autores se obtienen de la API de autores.
El selector por autor utiliza el contrato parcial authorName: si dos autores
comparten nombre, se incluyen ambos, tal como corresponde a esta búsqueda.

Hay orden por título, año o fecha, dirección asc/desc, total de resultados,
9 libros por página y controles anterior/siguiente deshabilitados cuando procede.
Las tarjetas muestran título, autor, género, año, páginas, ISBN y descripción.
Las portadas son composiciones tipográficas CSS propias, sin imágenes externas.
Crear y editar usan el diálogo Book y POST/PUT existentes; eliminar usa DELETE
con confirmación. La colección y las opciones se actualizan tras guardar.

### Perfil editorial

`/authors/[id]` consume los tres GET de autor, estadísticas y libros en paralelo.
Muestra biografía, email, nacionalidad, nacimiento, métricas, géneros y catálogo.
Permite editar el autor mediante PUT y crear libros mediante POST con el autor
actual preseleccionado. Un autor sin libros tiene un estado vacío útil; un ID
inexistente presenta un mensaje y navegación de regreso. Los fallos permiten
reintentar sin exponer información interna.

### Componentes, diseño y validaciones

`src/components/` contiene Dashboard, Catalog, AuthorProfile, Editor y las piezas
Heading, Empty y BookCards. El layout mantiene navegación consistente, enlace
para saltar al contenido, identidad Atlas y pie de página. La interfaz combina
verde bosque, salvia, crema y dorado, títulos serif y texto sans-serif. CSS adapta
navegación, tablas, tarjetas y formularios a escritorio, tablet y móvil.

Los formularios tienen etiquetas, required, tipo email, título de al menos tres
caracteres y páginas enteras positivas. Los mensajes de API se presentan en el
diálogo y junto a campos identificables, con aria-invalid. ISBN sigue la regla
existente: texto opcional no vacío cuando se informa y unicidad en PostgreSQL.
Los diálogos conservan foco nativo, permiten Escape y piden confirmación antes
de descartar cambios. Se deshabilita el guardado durante solicitudes; cargas,
éxitos, errores y estados vacíos tienen mensajes explícitos. Se respetan las
preferencias de movimiento reducido y los estados de foco del teclado.

### Pruebas automatizadas de esta etapa

```bash
node --test tests/*.test.mjs
npm run lint
npx tsc --noEmit
npm run build
npx prisma validate
npx prisma generate
```

Resultado: 10 pruebas locales correctas; lint, TypeScript, build y Prisma correctos.
La suite cubre filtros combinados, parámetros inválidos, límites, metadatos,
estadísticas sin libros y con nulos, consultas de búsqueda y contratos de handlers
con Prisma simulado, errores 404/500, escape HTML y restricciones del formulario.
La transpilación de componentes para pruebas usa TypeScript ya instalado.
Node puede emitir un aviso de detección de módulo al importar advanced.ts;
no afecta al resultado ni requiere cambiar el formato del proyecto.

No se inició servidor ni navegador en esta etapa. No se ejecutó el script HTTP
de Parte 01, Postman ni escrituras de prueba contra Supabase. Las 44 pruebas HTTP
anteriores pertenecen exclusivamente a Parte 01. Los tests de la TAREA no prueban
interacciones de navegador ni conectividad de producción.

### Validación visual manual pendiente

El usuario deberá ejecutar localmente `npm run dev` y comprobar: dashboard real,
CRUD completo con casos de error, cierre de diálogos y foco por teclado, filtros
combinados, debounce, navegación de páginas, edición y eliminación de la última
tarjeta, perfil sin libros y con datos, ID inexistente, presentación en móvil,
tablet y escritorio y ausencia de errores de consola.

## Capturas auténticas

Pendientes de añadir por el usuario: inicio, catálogo con filtros y paginación,
formularios y perfil de autor. No se generaron ni se incluyen imágenes simuladas.
Las capturas de Postman de Parte 01 también siguen pendientes.

## Despliegue

Vercel pendiente. No se creó ni configuró un proyecto remoto y no existe una URL
de despliegue confirmada. Añadir aquí la dirección después del despliegue manual,
configurar variables privadas en Vercel y generar Prisma Client durante el build.

## Estado del proyecto

- Parte 01 implementada, con sus pruebas HTTP históricas y colección Postman.
- TAREA implementada en código y validada técnicamente con pruebas locales.
- Validación visual e interacción real por el usuario pendientes.
- Capturas auténticas pendientes.
- Despliegue Vercel pendiente.
- Se mantienen los avisos de desarrollo y la recomendación TLS documentados arriba.
