// ============================================
//  src/lib/types.ts
// ============================================
export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: "Work" | "Personal" | "Art";
  ai_provider: "xAI" | "OpenAI" | "Gemini" | "Other";
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type PromptFormData = Omit<
  Prompt,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}