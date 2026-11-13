"use client";
import { useEffect, useState, useCallback } from 'react';
import type { Author, Book, Pagination } from '@/types/library';
import { api } from '@/lib/http';
import { Heading, Empty, BookCards } from './common';
import { Editor } from './editor';
export function Catalog() {
    const [authors, setAuthors] = useState<Author[]>([]), [books, setBooks] = useState<Book[]>([]), [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 9, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
    const [filters, setFilters] = useState({ search: '', genre: '', authorName: '', sortBy: 'createdAt', order: 'desc' }), [page, setPage] = useState(1), [revision, setRevision] = useState(0), [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState(''), [editor, setEditor] = useState<Book | null | undefined>(), [deleting, setDeleting] = useState(false);
    const loadAuthors = useCallback(async () => { try {
        setAuthors(await api<Author[]>('/api/authors'));
    }
    catch (e) {
        setError((e as Error).message);
    } }, []);
    useEffect(() => { let active = true; api<Author[]>('/api/authors').then(data => { if (active)
        setAuthors(data); }).catch(e => { if (active)
        setError(e.message); }); return () => { active = false; }; }, []);
    useEffect(() => { const controller = new AbortController(); let active = true; const timer = setTimeout(async () => { setLoading(true); setError(''); try {
        const params = new URLSearchParams({ ...filters, page: String(page), limit: '9' });
        const result = await api<{
            data: Book[];
            pagination: Pagination;
        }>('/api/books/search?' + params, { signal: controller.signal });
        if (active) {
            setBooks(result.data);
            setPagination(result.pagination);
        }
    }
    catch (e) {
        if (active)
            setError((e as Error).message);
    }
    finally {
        if (active)
            setLoading(false);
    } }, 350); return () => { active = false; clearTimeout(timer); controller.abort(); }; }, [filters, page, revision]);
    function filter(key: keyof typeof filters, value: string) { setFilters(current => ({ ...current, [key]: value })); setPage(1); setLoading(true); }
    async function remove(b: Book) { if (!confirm(`¿Eliminar «${b.title}»? Esta acción no se puede deshacer.`))
        return; setDeleting(true); try {
        await api('/api/books/' + b.id, { method: 'DELETE' });
        setNotice('Libro eliminado correctamente.');
        setPage(p => books.length === 1 ? Math.max(1, p - 1) : p);
        setRevision(r => r + 1);
        void loadAuthors();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setDeleting(false);
    } }
    const genres = [...new Set(authors.flatMap(a => a.books.map(b => b.genre)).filter((g): g is string => !!g))].sort();
    return <><Heading label="EXPLORA LA COLECCIÓN" title="Historias por descubrir." description="Encuentra ese libro, vuelve a un autor o dale un nuevo lugar a tu próxima lectura." action={<button onClick={() => setEditor(null)} disabled={!authors.length}>＋ Registrar libro</button>}/>{notice && <p role="status" className="notice">{notice}</p>}{error && <div role="alert" className="error">{error} <button className="text-button" onClick={() => { setRevision(r => r + 1); void loadAuthors(); }}>Reintentar</button></div>}<section className="filters" aria-label="Filtros del catálogo"><label>Buscar en la biblioteca<input type="search" placeholder="Busca un título…" value={filters.search} onChange={e => filter('search', e.target.value)}/></label><label>Género<select value={filters.genre} onChange={e => filter('genre', e.target.value)}><option value="">Todos los géneros</option>{genres.map(g => <option key={g}>{g}</option>)}</select></label><label>Autor<select value={filters.authorName} onChange={e => filter('authorName', e.target.value)}><option value="">Todos los autores</option>{[...new Set(authors.map(a => a.name))].map(name => <option key={name} value={name}>{name}</option>)}</select></label><label>Ordenar por<select value={filters.sortBy} onChange={e => filter('sortBy', e.target.value)}><option value="createdAt">Fecha de registro</option><option value="title">Título</option><option value="publishedYear">Año publicado</option></select></label><label>Dirección<select value={filters.order} onChange={e => filter('order', e.target.value)}><option value="desc">Descendente</option><option value="asc">Ascendente</option></select></label></section><div className="results-line"><span>{loading ? 'Buscando…' : `${pagination.total} libros encontrados`}</span><button className="text-button" onClick={() => { setFilters({ search: '', genre: '', authorName: '', sortBy: 'createdAt', order: 'desc' }); setPage(1); setLoading(true); }}>Limpiar filtros</button></div>{!authors.length && !loading && <p className="notice">Registra primero un autor desde Inicio para añadir libros.</p>}<section aria-busy={loading}>{loading ? <p role="status" className="loading">Buscando historias…</p> : books.length ? <BookCards books={books} onEdit={setEditor} onDelete={deleting ? undefined : remove}/> : <Empty title="Aquí comienza una nueva búsqueda" text="No encontramos libros con estos filtros. Prueba otro título o registra tu primera obra."/>}</section><nav className="pager" aria-label="Paginación del catálogo"><button className="secondary" disabled={loading || !pagination.hasPrev} onClick={() => { setLoading(true); setPage(p => p - 1); }}>← Anterior</button><span>Página {pagination.totalPages ? page : 0} de {pagination.totalPages} · 9 por página</span><button className="secondary" disabled={loading || !pagination.hasNext} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Siguiente →</button></nav>{editor !== undefined && <Editor kind="book" value={editor || undefined} authors={authors} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); setNotice('Libro guardado correctamente.'); setRevision(r => r + 1); void loadAuthors(); }}/>}</>;
}
