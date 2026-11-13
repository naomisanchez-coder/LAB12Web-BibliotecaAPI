# Servidor

`prisma.ts` exporta la instancia reutilizable de Prisma 7 con `@prisma/adapter-pg`.
El generador escribe el cliente en `src/generated/prisma` (ignorado por Git).
Los Route Handlers importan esta instancia; no importarla desde el navegador.
`api.ts` contiene validación de entradas y respuestas de error sin secretos.
