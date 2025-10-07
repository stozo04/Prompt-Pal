// src/app/login/page.tsx
'use client';
import { useEffect, useState, useRef } from 'react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const supabaseRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import the browser-only helper and create the client only on the client
    let mounted = true;
    (async () => {
      const { createBrowserClient } = await import('@supabase/ssr');

      // createBrowserClient uses document (cookies) internally; ensure we run this only in browser
      supabaseRef.current = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return document.cookie
                .split('; ')
                .find((row) => row.startsWith(`${name}=`))
                ?.split('=')[1];
            },
            set(name: string, value: string, options: any) {
              document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge};` : ''}`;
            },
            remove(name: string, options: any) {
              document.cookie = `${name}=; path=/; max-age=0`;
            },
          },
        }
      );

      if (mounted) setClientReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (!clientReady || !supabaseRef.current) return;

    setLoading(true);
    try {
      const supabase = supabaseRef.current;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt Manager</h1>
          <p className="text-gray-600">Sign in to manage your prompts</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading || !clientReady}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Signing in...' : clientReady ? 'Continue with Google' : 'Preparing...'}
        </button>
      </div>
    </div>
  );
}