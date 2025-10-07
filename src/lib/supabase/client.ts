import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function createClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === "undefined") return undefined;
          return document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`))
            ?.split("=")[1];
        },
        set(name: string, value: string, options: any) {
          if (typeof document === "undefined") return;
          document.cookie = `${name}=${value}; path=/; ${
            options?.maxAge ? `max-age=${options.maxAge};` : ""
          }`;
        },
        remove(name: string, options: any) {
          if (typeof document === "undefined") return;
          document.cookie = `${name}=; path=/; max-age=0`;
        },
      },
    }
  );

  return client;
}