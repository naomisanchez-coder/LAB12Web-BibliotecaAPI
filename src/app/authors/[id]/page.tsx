import {AuthorProfile} from '@/components/author-profile';
export default async function AuthorPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <AuthorProfile id={id}/>;}
