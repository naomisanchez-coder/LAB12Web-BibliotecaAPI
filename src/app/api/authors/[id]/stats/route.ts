import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorStatistics } from "@/lib/advanced";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}) {
  try {
    const {id}=await context.params;
    const author=await prisma.author.findUnique({where:{id},select:{id:true,name:true,books:{select:{id:true,title:true,publishedYear:true,pages:true,genre:true}}}});
    if(!author)return NextResponse.json({error:"Autor no encontrado"},{status:404});
    return NextResponse.json(authorStatistics(author));
  }catch{return NextResponse.json({error:"Error al obtener estadísticas"},{status:500});}
}
