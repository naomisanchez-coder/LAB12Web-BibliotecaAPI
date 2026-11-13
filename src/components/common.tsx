import Link from 'next/link';
import type { Book } from '@/types/library';
export function Heading({ label, title, description, action }: {
    label: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}) { return <header className="page-heading"><div><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>; }
export function Empty({ title, text }: {
    title: string;
    text: string;
}) { return <div className="empty"><span aria-hidden="true">▤</span><h3>{title}</h3><p>{text}</p></div>; }
export function BookCards({ books, onEdit, onDelete }: {
    books: Book[];
    onEdit?: (b: Book) => void;
    onDelete?: (b: Book) => void;
}) { return <div className="book-grid">{books.map((b, i) => <article className="book-card" key={b.id}><div className={'cover cover-' + i % 4}><span className="cover-series">BIBLIOTECA ATLAS · COLECCIÓN</span><h3>{b.title}</h3><div className="cover-line"/><span>{b.author?.name || 'Catálogo del autor'}</span></div><div className="book-content"><span className="tag">{b.genre || 'Sin género'}</span><h3>{b.title}</h3>{b.author && <Link href={'/authors/' + b.authorId}>{b.author.name}</Link>}<p className="muted">{b.publishedYear ?? 'Año sin registrar'} · {b.pages ?? '—'} páginas</p>{b.isbn && <p className="small muted">ISBN {b.isbn}</p>}{b.description && <p className="book-description">{b.description}</p>}<div className="row-actions">{onEdit && <button className="text-button" onClick={() => onEdit(b)}>Editar</button>}{onDelete && <button className="text-button danger" onClick={() => onDelete(b)}>Eliminar</button>}</div></div></article>)}</div>; }
