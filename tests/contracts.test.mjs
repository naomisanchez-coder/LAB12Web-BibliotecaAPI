import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
const runtimeRequire=createRequire(import.meta.url);
function load(file,mocks={}){
 const resolved=path.resolve(file),exports={};
 const source=ts.transpileModule(fs.readFileSync(resolved,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const localRequire=name=>{if(name in mocks)return mocks[name];if(name==='next/link')return {default:({href,children,...props})=>React.createElement('a',{href,...props},children)};if(name.startsWith('@/')){const target=path.resolve('src',name.slice(2));return load(fs.existsSync(target+'.tsx')?target+'.tsx':target+'.ts',mocks);}if(name.startsWith('./')){const target=path.resolve(path.dirname(resolved),name);return load(fs.existsSync(target+'.tsx')?target+'.tsx':target+'.ts',mocks);}return runtimeRequire(name);};
 vm.runInNewContext(`(function(require,exports){${source}\n})`,{URL,URLSearchParams,console,process,AbortController,setTimeout,clearTimeout})(localRequire,exports);return exports;
}
test('búsqueda aplica filtros, skip/take, orden estable y count compartido',async()=>{
 let query,count;
 const prisma={book:{findMany:q=>{query=q;return Promise.resolve([{id:'book',title:'Amor'}]);},count:q=>{count=q;return Promise.resolve(12);}},$transaction:async queries=>Promise.all(queries)};
 const {GET}=load('src/app/api/books/search/route.ts',{'@/lib/prisma':{prisma}});
 const r=await GET(new Request('http://localhost/api/books/search?search=amor&genre=Novela&authorName=Gabo&page=2&limit=5&sortBy=title&order=asc'));
 const data=await r.json();assert.equal(r.status,200);assert.equal(query.skip,5);assert.equal(query.take,5);assert.equal(query.orderBy[1].id,'asc');assert.deepEqual(query.where,count.where);assert.equal(data.pagination.totalPages,3);assert.equal(data.pagination.hasNext,true);
});
test('parámetros inválidos no consultan Prisma; error interno seguro',async()=>{
 const {GET}=load('src/app/api/books/search/route.ts',{'@/lib/prisma':{prisma:{}}});
 assert.equal((await GET(new Request('http://localhost/api/books/search?limit=51'))).status,400);
 const r=await GET(new Request('http://localhost/api/books/search'));assert.equal(r.status,500);assert.ok(!(await r.text()).includes('TypeError'));
});
test('stats devuelve contrato vacío, 404 y 500 con mocks',async()=>{
 for(const mode of ['empty','missing','error']){
 const prisma={author:{findUnique:async()=>{if(mode==='error')throw Error('secreto');return mode==='missing'?null:{id:'a',name:'Autora',books:[]};}}};
 const {GET}=load('src/app/api/authors/[id]/stats/route.ts',{'@/lib/prisma':{prisma}});
 const r=await GET(new Request('http://localhost'),{params:Promise.resolve({id:'a'})});assert.equal(r.status,mode==='empty'?200:mode==='missing'?404:500);const data=await r.json();if(mode==='empty'){assert.equal(data.totalBooks,0);assert.equal(data.averagePages,null);}assert.ok(!JSON.stringify(data).includes('secreto'));
 }
});
test('tarjeta escapa contenido y muestra acciones solo si funcionan',()=>{
 const {BookCards}=load('src/components/common.tsx');const html=renderToStaticMarkup(React.createElement(BookCards,{books:[{id:'b',title:'<script>alert(1)</script>',authorId:'a',genre:null,pages:null,publishedYear:null}],onEdit:()=>{}}));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('Editar'));assert.ok(!html.includes('Eliminar'));
});
test('formularios incluyen etiquetas, restricciones y autor preseleccionado',()=>{
 const {Editor}=load('src/components/editor.tsx');const html=renderToStaticMarkup(React.createElement(Editor,{kind:'book',authorId:'a',authors:[{id:'a',name:'Autora'}],onClose:()=>{},onSaved:()=>{}}));assert.ok(html.includes('minLength="3"'));assert.ok(html.includes('min="1"'));assert.ok(html.includes('value="a" selected'));assert.ok(html.includes('aria-labelledby="editor-title"'));assert.ok(html.includes('Cancelar'));
});
