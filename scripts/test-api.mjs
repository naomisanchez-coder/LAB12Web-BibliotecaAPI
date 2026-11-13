import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const host = process.env.API_BASE_URL || 'http://localhost:3000';
const rows = [];
const authors = [], books = [];
async function call(method, path, expected, data) {
  const response = await fetch(host + path, { method, ...(data === undefined ? {} : { headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }) });
  const value = await response.json();
  rows.push({ method, path: path.replace(/c[a-z0-9]{20,}/g, '[id]'), expected, actual: response.status });
  assert.equal(response.status, expected, `${method} ${path}`);
  return value;
}
const token = Date.now();
const authorInput = { name: 'Gabriel García Márquez', email: `lab12-${token}@example.com`, nationality: 'Colombia', birthYear: 1927, bio: 'LAB12 prueba temporal · Premio Nobel de Literatura 1982' };
try {
  const a = await call('POST','/api/authors',201,authorInput); authors.push(a.id);
  const other = await call('POST','/api/authors',201,{name:'LAB12 Otro autor',email:`lab12-other-${token}@example.com`}); authors.push(other.id);
  await call('POST','/api/authors',409,authorInput);
  await call('POST','/api/authors',400,{name:'Prueba',email:'inválido'});
  await call('POST','/api/authors',400,{});
  await call('POST','/api/authors',400,null);
  const list = await call('GET','/api/authors',200); assert.ok(list.some(x=>x.id===a.id));
  await call('GET',`/api/authors/${a.id}`,200);
  await call('GET','/api/authors/lab12-inexistente',404);
  const updated = await call('PUT',`/api/authors/${a.id}`,200,{bio:'LAB12 actualizada'}); assert.equal(updated.birthYear,1927);
  await call('PUT',`/api/authors/${a.id}`,409,{email:other.email});
  await call('PUT',`/api/authors/${a.id}`,400,{email:'malo'});
  await call('PUT','/api/authors/lab12-inexistente',404,{name:'Prueba'});
  const input = { title:'Cien años de soledad',description:'Obra maestra del realismo mágico',isbn:`LAB12-${token}`,publishedYear:1967,genre:'Novela',pages:417,authorId:a.id };
  const b = await call('POST','/api/books',201,input); books.push(b.id); assert.equal(b.author.id,a.id);
  await call('POST','/api/books',409,input);
  for(const pages of [0,-1,1.5,'abc',true]) await call('POST','/api/books',400,{...input,pages});
  await call('POST','/api/books',400,{});
  await call('POST','/api/books',400,{...input,title:'ab'});
  await call('POST','/api/books',404,{...input,authorId:'lab12-inexistente'});
  for(const query of ['', '?genre=Novela','?authorId='+a.id,'?genre=Novela&authorId='+a.id]) {
    const found = await call('GET','/api/books'+query,200); assert.ok(found.some(x=>x.id===b.id));
  }
  assert.equal((await call('GET','/api/books?genre=LAB12-inexistente',200)).length,0);
  const relation = await call('GET',`/api/authors/${a.id}/books`,200); assert.equal(relation.totalBooks,1); assert.equal(relation.author.id,a.id);
  await call('GET','/api/authors/lab12-inexistente/books',404);
  await call('GET',`/api/books/${b.id}`,200);
  await call('GET','/api/books/lab12-inexistente',404);
  await call('PUT',`/api/books/${b.id}`,200,{title:'Cien años de soledad · LAB12',pages:420});
  await call('PUT',`/api/books/${b.id}`,400,{pages:0});
  await call('PUT',`/api/books/${b.id}`,404,{authorId:'lab12-inexistente'});
  const second = await call('POST','/api/books',201,{title:'LAB12 Segundo libro',isbn:`LAB12-other-${token}`,authorId:a.id}); books.push(second.id);
  await call('PUT',`/api/books/${second.id}`,409,{isbn:b.isbn});
  await call('PUT','/api/books/lab12-inexistente',404,{title:'Prueba'});
  await call('DELETE',`/api/books/${b.id}`,200); books.splice(books.indexOf(b.id),1);
  await call('DELETE',`/api/books/${b.id}`,404);
  await call('DELETE',`/api/authors/${a.id}`,200); authors.splice(authors.indexOf(a.id),1);
  await call('GET',`/api/books/${second.id}`,404); books.splice(books.indexOf(second.id),1);
  await call('DELETE',`/api/authors/${a.id}`,404);
} finally {
  for(const id of books) await call('DELETE',`/api/books/${id}`,200);
  for(const id of authors) await call('DELETE',`/api/authors/${id}`,200);
  writeFileSync('evidencias/parte-01/resultados-http.json',JSON.stringify({date:new Date().toISOString(),host,tests:rows},null,2)+'\n');
}
console.log(`${rows.length} comprobaciones HTTP correctas; registros temporales eliminados.`);
