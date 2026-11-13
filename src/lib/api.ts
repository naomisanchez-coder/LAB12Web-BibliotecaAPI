import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
export class InvalidInput extends Error {}
export async function body(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;
  try { value = await request.json(); } catch { throw new InvalidInput("JSON inválido"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InvalidInput("Se requiere un objeto JSON");
  return value as Record<string, unknown>;
}
export function text(value: unknown, label: string, required = false): string | null | undefined {
  if (value === undefined) { if (required) throw new InvalidInput(`${label} es requerido`); return undefined; }
  if (value === null && !required) return null;
  if (typeof value !== "string" || !value.trim()) throw new InvalidInput(`${label} inválido`);
  return value.trim();
}
export function integer(value: unknown, label: string, positive = false): number | null | undefined {
  if (value === undefined || value === null) return value;
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") throw new InvalidInput(`${label} inválido`);
  const n = Number(value);
  if (!Number.isInteger(n) || n < -2147483648 || n > 2147483647 || (positive && n <= 0)) throw new InvalidInput(`${label} debe ser entero${positive ? " y mayor que 0" : ""}`);
  return n;
}
export function authorData(data: Record<string, unknown>, create = false) {
  const name = text(data.name, "Nombre", create || data.name !== undefined) ?? undefined;
  const email = text(data.email, "Email", create || data.email !== undefined) ?? undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InvalidInput("Email inválido");
  return { name, email, bio: text(data.bio, "Biografía"), nationality: text(data.nationality, "Nacionalidad"), birthYear: integer(data.birthYear, "Año de nacimiento") };
}
export function bookData(data: Record<string, unknown>, create = false) {
  const title = text(data.title, "Título", create || data.title !== undefined) ?? undefined;
  if (title && title.length < 3) throw new InvalidInput("El título debe tener al menos 3 caracteres");
  const authorId = text(data.authorId, "Autor", create || data.authorId !== undefined) ?? undefined;
  return { title, authorId, description: text(data.description, "Descripción"), isbn: text(data.isbn, "ISBN"), genre: text(data.genre, "Género"), publishedYear: integer(data.publishedYear, "Año de publicación"), pages: integer(data.pages, "Páginas", true) };
}
export function failure(error: unknown, entity: "autor" | "libro", action: string) {
  if (error instanceof InvalidInput) return NextResponse.json({ error: error.message }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: entity === "autor" ? "El email ya está registrado" : "El ISBN ya existe" }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: entity === "autor" ? "Autor no encontrado" : "Libro no encontrado" }, { status: 404 });
    if (error.code === "P2003") return NextResponse.json({ error: "El autor especificado no existe" }, { status: 404 });
  }
  return NextResponse.json({ error: `Error al ${action} ${entity}` }, { status: 500 });
}
