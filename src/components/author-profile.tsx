"use client";
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Author, Book, Statistics } from '@/types/library';
import { api } from '@/lib/http';
import { Heading, Empty, BookCards } from './common';
import { AuthorAvatar } from './author-avatar';
import { Editor } from './editor';
export function AuthorProfile({ id }: {
    id: string;
}) {
    const [author, setAuthor] = useState<Author>(), [stats, setStats] = useState<Statistics>(), [books, setBooks] = useState<Book[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState(''), [editor, setEditor] = useState<'author' | 'book'>();
    const load = useCallback(async () => { try {
        const [a, s, b] = await Promise.all([api<Author>('/api/authors/' + id), api<Statistics>(`/api/authors/${id}/stats`), api<{
                books: Book[];
            }>(`/api/authors/${id}/books`)]);
        setAuthor(a);
        setStats(s);
        setBooks(b.books);
        setError('');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setLoading(false);
    } }, [id]);
    useEffect(() => { let active = true; Promise.all([api<Author>('/api/authors/' + id), api<Statistics>('/api/authors/' + id + '/stats'), api<{
            books: Book[];
        }>('/api/authors/' + id + '/books')]).then(([a, s, b]) => { if (active) {
        setAuthor(a);
        setStats(s);
        setBooks(b.books);
    } }).catch(e => { if (active)
        setError(e.message); }).finally(() => { if (active)
        setLoading(false); }); return () => { active = false; }; }, [id]);
    if (loading)
        return <p role="status" className="loading">Abriendo el perfil del autor…</p>;
    if (!author)
        return <><Heading label="PERFIL DE AUTOR" title={error === 'Autor no encontrado' ? 'Esta voz aún no está en Atlas.' : 'No pudimos abrir este perfil.'} description={error}/><Link href="/">← Volver a la biblioteca</Link><button className="secondary" onClick={load}>Reintentar</button></>;
    return <><Link className="small muted" href="/">← Todos los autores</Link><Heading label="VOCES DE LA BIBLIOTECA" title={author.name} description={author.nationality || 'Nacionalidad sin registrar'} action={<div className="row-actions"><button className="secondary" onClick={() => setEditor('author')}>Editar perfil</button><button onClick={() => setEditor('book')}>＋ Añadir libro</button></div>}/>{notice && <p className="notice" role="status">{notice}</p>}{error && <p role="alert" className="error">{error}</p>}<section className="profile"><AuthorAvatar name={author.name} url={author.profileImageUrl} large/><span className="eyebrow">SOBRE EL AUTOR</span><p className="profile-bio">{author.bio || 'Cada autor tiene una historia. Añade su biografía para conocerla.'}</p><div className="profile-meta"><span>{author.email}</span><span>Nacimiento: {author.birthYear ?? 'Sin registrar'}</span><span>{author.nationality || 'Nacionalidad sin registrar'}</span></div></section>{stats && <><section className="metrics" aria-label="Estadísticas del autor">{[['Libros publicados', stats.totalBooks], ['Promedio de páginas', stats.averagePages ?? '—'], ['Géneros', stats.genres.length], ['Primera publicación', stats.firstBook?.year ?? '—']].map(([name, n]) => <div className="metric" key={name}><small>{name}</small><strong>{n}</strong></div>)}</section><div className="stat-details">{[['Primer libro', stats.firstBook?.title, stats.firstBook?.year], ['Último libro', stats.latestBook?.title, stats.latestBook?.year], ['Libro más largo', stats.longestBook?.title, stats.longestBook?.pages ? `${stats.longestBook.pages} páginas` : null], ['Libro más corto', stats.shortestBook?.title, stats.shortestBook?.pages ? `${stats.shortestBook.pages} páginas` : null]].map(([label, title, detail]) => <article className="stat-detail" key={label}><small>{label}</small><h3>{title || 'Sin información'}</h3><span className="small muted">{detail || '—'}</span></article>)}</div><p className="row-actions">{stats.genres.length ? stats.genres.map(g => <span className="tag" key={g}>{g}</span>) : <span className="muted small">Sin géneros registrados</span>}</p></>}<div className="page-heading"><div><span className="eyebrow">SU LEGADO EN PALABRAS</span><h2>Obras en la colección</h2></div><span className="tag">{books.length} libros</span></div>{books.length ? <BookCards books={books}/> : <Empty title="Su próxima historia tiene un lugar aquí" text="Añade el primer libro de este autor para completar su perfil."/>}{editor && <Editor kind={editor} value={editor === 'author' ? author : undefined} authors={[author]} authorId={author.id} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); setNotice('Información guardada correctamente.'); void load(); }}/>}</>;
}
