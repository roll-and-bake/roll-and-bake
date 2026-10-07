export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default async function Storefront() {
  const { data, error } = await supabase.from('products').select('*');
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing';
  
  return (
    <main className="p-8">
      <h1>DEBUG PAGE</h1>
      <p>URL Length: {envUrl.length}</p>
      <p>Error: {JSON.stringify(error)}</p>
      <p>Data length: {data?.length}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
