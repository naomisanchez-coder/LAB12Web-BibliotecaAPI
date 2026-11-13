import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Mantener la semántica PostgreSQL de sslmode=require (TLS obligatorio).
const connectionUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : undefined;
if (connectionUrl?.searchParams.get("sslmode") === "require") connectionUrl.searchParams.set("uselibpqcompat", "true");
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString: connectionUrl?.toString() }),
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
