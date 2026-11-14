"use client";
import { useRef, useState, useEffect } from 'react';
import { PhotoPicker } from './photo-picker';
import { api } from '@/lib/http';
import type { Author, Book } from '@/types/library';
type Props = {
    kind: 'author' | 'book';
    value?: Author | Book;
    authors: Author[];
    authorId?: string;
    onClose: () => void;
    onSaved: () => void;
};
export function Editor({ kind, value, authors, authorId, onClose, onSaved }: Props) {
    const submitting = useRef(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const [busy, setBusy] = useState(false), [error, setError] = useState('');
    useEffect(() => { dialog.current?.showModal(); }, []);
    function close() { if (busy)
        return; if (dialog.current?.querySelector('form')?.dataset.dirty && !confirm('¿Descartar los cambios sin guardar?'))
        return; onClose(); }
    const fields = kind === 'author' ? [['name', 'Nombre', 'text', true], ['email', 'Correo electrónico', 'email', true], ['nationality', 'Nacionalidad', 'text', false], ['birthYear', 'Año de nacimiento', 'number', false], ['bio', 'Biografía', 'textarea', false]] as const : [['title', 'Título', 'text', true], ['isbn', 'ISBN', 'text', false], ['genre', 'Género', 'text', false], ['publishedYear', 'Año de publicación', 'number', false], ['pages', 'Número de páginas', 'number', false], ['description', 'Descripción', 'textarea', false]] as const;
    function fieldError(name: string) { const words: Record<string, RegExp> = { name: /nombre/i, email: /email|correo/i, title: /título/i, isbn: /isbn/i, pages: /páginas/i, birthYear: /nacimiento/i, publishedYear: /publicación/i, nationality: /nacionalidad/i, genre: /género/i }; return words[name]?.test(error) ? error : ''; }
    async function save(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError('');
        const data: Record<string, unknown> = {};
        for (const [key, v] of new FormData(event.currentTarget)) {
            data[key] = ['birthYear', 'publishedYear', 'pages'].includes(key) ? (v === '' ? null : Number(v)) : (v === '' ? null : v);
        }
        try {
            await api(`/api/${kind === 'author' ? 'authors' : 'books'}${value ? '/' + value.id : ''}`, { method: value ? 'PUT' : 'POST', body: JSON.stringify(data) });
            onSaved();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Error al guardar');
        }
        finally {
            submitting.current = false;
            setBusy(false);
        }
    }
    return <dialog ref={dialog} onCancel={e => { e.preventDefault(); close(); }} aria-labelledby="editor-title"><div className="dialog-head"><div><span className="eyebrow">TU COLECCIÓN</span><h2 id="editor-title">{value ? 'Editar' : 'Registrar'} {kind === 'author' ? 'autor' : 'libro'}</h2></div><button className="icon-button" onClick={close} aria-label="Cerrar formulario" disabled={busy}>×</button></div><form onSubmit={save} onChange={e => { e.currentTarget.dataset.dirty = 'true'; }}>{kind === 'author' && <PhotoPicker name={(value as Author)?.name || 'Autor'} url={(value as Author)?.profileImageUrl} disabled={busy}/>}<div className="form-grid">{fields.map(([name, label, type, required]) => <label key={name} className={type === 'textarea' ? 'full' : ''}>{label}{required ? ' *' : ''}{type === 'textarea' ? <textarea name={name} defaultValue={String((value as unknown as Record<string, unknown>)?.[name] ?? '')} rows={3}/> : <input name={name} aria-invalid={!!fieldError(name)} aria-describedby={fieldError(name) ? name + "-error" : undefined} type={type} required={required} min={name === 'pages' ? 1 : undefined} step={type === 'number' ? 1 : undefined} minLength={name === 'title' ? 3 : undefined} defaultValue={String((value as unknown as Record<string, unknown>)?.[name] ?? '')}/>} {fieldError(name) && <span id={name + '-error'} role="alert" className="field-error">{fieldError(name)}</span>}</label>)}{kind === 'book' && <label className="full">Autor *<select name="authorId" required defaultValue={(value as Book)?.authorId || authorId || ''}><option value="">Selecciona un autor</option>{authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}</div>{error && <p role="alert" className="error">{error}</p>}<p className="muted small">* Campos obligatorios. Los demás campos son opcionales.</p><div className="dialog-actions"><button type="button" className="secondary" onClick={close} disabled={busy}>Cancelar</button><button disabled={busy}>{busy ? 'Guardando…' : 'Guardar ' + (kind === 'author' ? 'autor' : 'libro')}</button></div></form></dialog>;
}
