import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { failure } from "@/lib/api";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const author = await prisma.author.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!author) return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
    const books = await prisma.book.findMany({ where: { authorId: id }, orderBy: { publishedYear: "desc" } });
    return NextResponse.json({ author, totalBooks: books.length, books });
  } catch (error) { return failure(error, "autor", "obtener libros del"); }
}
