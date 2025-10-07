// src/app/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
   const { data: { user }, error } = await supabase.auth.getUser();
    // Check if user is authenticated
    if (error || !user) {
        redirect('/login');
    }

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}