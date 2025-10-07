'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
          },
          set(name: string, value: string, options: any) {
            document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge};` : ''}`
          },
          remove(name: string, options: any) {
            document.cookie = `${name}=; path=/; max-age=0`
          },
        },
      }
    )

    async function handle() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const next = url.searchParams.get('next') ?? '/' 
      
      console.log('callback code:', code)
      console.log('cookies:', document.cookie)

      if (!code) {
        router.replace('/login?error_message=Missing+authorization+code')
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error exchanging code for session:', error)
        router.replace(`/auth/auth-code-error?error_message=${encodeURIComponent(error.message)}`)
        return
      }

      router.replace(next)
    }

    handle()
  }, [router])

  return <div className="min-h-screen flex items-center justify-center">Processing sign-in...</div>
}