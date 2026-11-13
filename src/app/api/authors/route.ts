import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorData, body, failure } from "@/lib/api";
export async function GET() {
  try { return NextResponse.json(await prisma.author.findMany({ include: { books: true, _count: { select: { books: true } } }, orderBy: { name: "asc" } })); }
  catch (error) { return failure(error, "autor", "obtener"); }
}
export async function POST(request: Request) {
  try {
    const data = authorData(await body(request), true);
    return NextResponse.json(await prisma.author.create({ data: { ...data, name: data.name!, email: data.email! }, include: { books: true } }), { status: 201 });
  } catch (error) { return failure(error, "autor", "crear"); }
}
