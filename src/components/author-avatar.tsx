"use client";
import {useState} from 'react';
import {controlledPhotoUrl,initials} from '@/lib/photos';
export function AuthorAvatar({name,url,large=false}:{name:string;url?:string|null;large?:boolean}){
 const [failed,setFailed]=useState<string|null>(null);
 const source=controlledPhotoUrl(url);
 return <span className={'author-avatar'+(large?' author-avatar-large':'')}>
 {source && failed!==source ?
 // URL limitada al proyecto y bucket; imagen directa sin proxy de optimización.
 // eslint-disable-next-line @next/next/no-img-element
 <img src={source} alt={`Fotografía de ${name}`} width={large?96:40} height={large?96:40} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(source)}/>
 :<span aria-label={`Iniciales de ${name}`}>{initials(name)}</span>}
 </span>;
}
