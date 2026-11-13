export class QueryError extends Error {}
export function searchOptions(params: URLSearchParams) {
  const positive = (key: string, fallback: number, max: number) => {
    const raw = params.get(key); if (raw === null) return fallback;
    if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) > max) throw new QueryError(`${key} debe ser un entero entre 1 y ${max}`);
    return Number(raw);
  };
  const page = positive("page", 1, 1000000), limit = positive("limit", 10, 50);
  const sortBy = params.get("sortBy") ?? "createdAt", order = params.get("order") ?? "desc";
  if (!["title", "publishedYear", "createdAt"].includes(sortBy)) throw new QueryError("sortBy inválido");
  if (order !== "asc" && order !== "desc") throw new QueryError("order debe ser asc o desc");
  const search = params.get("search")?.trim(), genre = params.get("genre")?.trim(), authorName = params.get("authorName")?.trim();
  return { page, limit, skip: (page - 1) * limit, sortBy: sortBy as "title" | "publishedYear" | "createdAt", order,
    where: { ...(search && {title:{contains:search, mode:"insensitive" as const}}), ...(genre && {genre}), ...(authorName && {author:{name:{contains:authorName,mode:"insensitive" as const}}}) } };
}
export function pagination(page:number,limit:number,total:number) {
  const totalPages=Math.ceil(total/limit);
  return {page,limit,total,totalPages,hasNext:page<totalPages,hasPrev:page>1 && totalPages>0};
}
type StatBook={id:string;title:string;publishedYear:number|null;pages:number|null;genre:string|null};
export function authorStatistics(author:{id:string;name:string;books:StatBook[]}) {
  const dated=author.books.filter(b=>b.publishedYear!==null).sort((a,b)=>a.publishedYear!-b.publishedYear! || a.id.localeCompare(b.id));
  const paged=author.books.filter(b=>b.pages!==null).sort((a,b)=>a.pages!-b.pages! || a.id.localeCompare(b.id));
  const first=dated[0],last=dated.at(-1),short=paged[0],long=paged.at(-1);
  return {authorId:author.id,authorName:author.name,totalBooks:author.books.length,
    firstBook:first?{title:first.title,year:first.publishedYear}:null, latestBook:last?{title:last.title,year:last.publishedYear}:null,
    averagePages:paged.length?Math.round(paged.reduce((s,b)=>s+b.pages!,0)/paged.length):null,
    genres:[...new Set(author.books.map(b=>b.genre).filter((g):g is string=>!!g))].sort(),
    longestBook:long?{title:long.title,pages:long.pages}:null,shortestBook:short?{title:short.title,pages:short.pages}:null};
}
