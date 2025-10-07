// ============================================
//  src/lib/types.ts
// ============================================
export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: 'Work' | 'Personal' | 'Art';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type PromptFormData = Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>;