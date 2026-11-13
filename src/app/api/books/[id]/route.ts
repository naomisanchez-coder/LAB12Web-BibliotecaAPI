import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookData, body, failure } from "@/lib/api";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const book = await prisma.book.findUnique({ where: { id }, include: { author: true } });
    return book ? NextResponse.json(book) : NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
  } catch (error) { return failure(error, "libro", "obtener"); }
}
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = bookData(await body(request));
    if (data.authorId && !await prisma.author.findUnique({ where: { id: data.authorId } })) return NextResponse.json({ error: "El autor especificado no existe" }, { status: 404 });
    return NextResponse.json(await prisma.book.update({ where: { id }, data, include: { author: true } }));
  } catch (error) { return failure(error, "libro", "actualizar"); }
}
export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ message: "Libro eliminado correctamente" });
  } catch (error) { return failure(error, "libro", "eliminar"); }
}
