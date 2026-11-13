import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pagination, QueryError, searchOptions } from "@/lib/advanced";
export async function GET(request:Request) {
  try {
    const q=searchOptions(new URL(request.url).searchParams);
    const [data,total]=await prisma.$transaction([
      prisma.book.findMany({where:q.where,skip:q.skip,take:q.limit,include:{author:{select:{id:true,name:true,email:true}}},orderBy:[{[q.sortBy]:q.order},{id:"asc"}]}),
      prisma.book.count({where:q.where})
    ],{isolationLevel:"RepeatableRead"});
    return NextResponse.json({data,pagination:pagination(q.page,q.limit,total)});
  } catch(error) {return NextResponse.json({error:error instanceof QueryError?error.message:"Error al buscar libros"},{status:error instanceof QueryError?400:500});}
}
