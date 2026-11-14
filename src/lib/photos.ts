export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export function imageFormat(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if(bytes.length>=3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255)return 'image/jpeg';
  if(bytes.length>=8 && [137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return 'image/png';
  if(bytes.length>=12 && String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
  return null;
}
export function validatePhotoBytes(bytes:Uint8Array){
  if(!bytes.length || bytes.length>MAX_PHOTO_BYTES)throw new Error('La imagen debe pesar como máximo 2 MB y no estar vacía.');
  const format=imageFormat(bytes);
  if(!format)throw new Error('Selecciona una imagen JPEG, PNG o WebP válida. No se admite SVG.');
  return format;
}
export function controlledPhotoUrl(value?:string|null){
 if(!value)return null;
 try{const url=new URL(value);return url.protocol==='https:' && url.hostname==='wkqoyfsjhcyyqmhwutml.supabase.co' && !url.username && !url.password && !url.search && !url.hash && /^\/storage\/v1\/object\/public\/author-avatars\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(url.pathname)?url.href:null;}catch{return null;}
}
export function initials(name:string){return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>Array.from(part)[0]).join('').toLocaleUpperCase('es')||'A';}
