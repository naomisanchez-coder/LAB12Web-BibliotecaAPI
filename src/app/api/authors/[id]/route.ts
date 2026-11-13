import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorData, body, failure } from "@/lib/api";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const author = await prisma.author.findUnique({ where: { id }, include: { books: { orderBy: { publishedYear: "desc" } }, _count: { select: { books: true } } } });
    return author ? NextResponse.json(author) : NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
  } catch (error) { return failure(error, "autor", "obtener"); }
}
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await prisma.author.update({ where: { id }, data: authorData(await body(request)), include: { books: true } }));
  } catch (error) { return failure(error, "autor", "actualizar"); }
}
export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ message: "Autor eliminado correctamente" });
  } catch (error) { return failure(error, "autor", "eliminar"); }
}
