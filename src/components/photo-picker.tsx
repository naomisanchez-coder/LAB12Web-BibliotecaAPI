"use client";
import {useEffect,useRef,useState} from 'react';
import {validatePhotoBytes} from '@/lib/photos';
import {AuthorAvatar} from './author-avatar';
export function PhotoPicker({name,url,disabled}:{name:string;url?:string|null;disabled:boolean}){
 const [preview,setPreview]=useState(''),[fileName,setFileName]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const version=useRef(0);const input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{version.current++;},[]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 async function select(file?:File){const current=++version.current;if(!file)return;setLoading(true);setError('');
 try{if(file.size>2*1024*1024)throw new Error('La imagen debe pesar como máximo 2 MB.');const bytes=new Uint8Array(await file.arrayBuffer());const type=validatePhotoBytes(bytes);const blob=new Blob([bytes],{type});const bitmap=await createImageBitmap(blob);const valid=bitmap.width>0&&bitmap.height>0&&bitmap.width*bitmap.height<=25000000;bitmap.close();if(!valid)throw new Error('Imagen inválida o demasiado grande (máximo 25 megapíxeles).');if(current===version.current){setPreview(URL.createObjectURL(blob));setFileName(file.name);}}
 catch(e){if(current===version.current)setError(e instanceof Error?e.message:'No se pudo leer la imagen.');}finally{if(current===version.current)setLoading(false);if(input.current)input.current.value='';}}
 return <section className="photo-picker" aria-label="Fotografía opcional"><div className="photo-picker-row">{preview?
 // Blob local validado; nunca se envía al servidor.
 // eslint-disable-next-line @next/next/no-img-element
 <img className="photo-preview" src={preview} alt="Vista previa local de la fotografía" width={76} height={76}/>:<AuthorAvatar name={name} url={url} large/>}<div><strong>Fotografía del autor</strong><p className="small muted">JPEG, PNG o WebP · máximo 2 MB</p><label className="photo-select">{preview?'Reemplazar vista previa':'Seleccionar para vista previa'}<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||loading} onChange={e=>void select(e.target.files?.[0])}/></label>{preview&&<button type="button" className="text-button" disabled={disabled||loading} onClick={()=>{version.current++;setPreview('');setFileName('');setError('');}}>Quitar vista previa</button>}</div></div>{loading&&<p role="status">Validando imagen…</p>}{fileName&&<p className="small">Archivo seleccionado: {fileName}</p>}{error&&<p className="field-error" role="alert">{error}</p>}<p className="small muted">Solo vista previa local. Guardar autor conserva sus datos, pero no sube ni cambia fotografías: falta autorización segura para Storage.</p><button type="button" className="secondary" disabled>Guardar fotografía — no disponible</button></section>;
}
