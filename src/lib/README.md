# Conexión futura desde el servidor

Prisma moderno utiliza `@prisma/adapter-pg` con `DATABASE_URL` para PostgreSQL.
Crear el singleton de Prisma aquí cuando existan modelos y se genere el cliente.
No importar el cliente desde componentes de navegador. Esta etapa no establece conexiones.
