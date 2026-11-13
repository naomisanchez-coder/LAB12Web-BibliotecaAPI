import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookData, body, failure } from "@/lib/api";
export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const genre = query.get("genre"); const authorId = query.get("authorId");
    return NextResponse.json(await prisma.book.findMany({ where: { ...(genre && { genre }), ...(authorId && { authorId }) }, include: { author: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } }));
  } catch (error) { return failure(error, "libro", "obtener"); }
}
export async function POST(request: Request) {
  try {
    const data = bookData(await body(request), true);
    const author = await prisma.author.findUnique({ where: { id: data.authorId! } });
    if (!author) return NextResponse.json({ error: "El autor especificado no existe" }, { status: 404 });
    return NextResponse.json(await prisma.book.create({ data: { ...data, title: data.title!, authorId: data.authorId! }, include: { author: true } }), { status: 201 });
  } catch (error) { return failure(error, "libro", "crear"); }
}
