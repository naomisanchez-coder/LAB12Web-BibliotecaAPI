"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export function Navigation(){const path=usePathname();return <nav aria-label="Principal">{[['/','◫','Inicio y autores'],['/books','▤','Catálogo de libros']].map(([href,icon,label])=>{const active=href==='/'?path==='/'||path.startsWith('/authors/'):path.startsWith('/books');return <Link key={href} href={href} aria-current={active?'page':undefined}>{icon} <span>{label}</span></Link>;})}</nav>;}
