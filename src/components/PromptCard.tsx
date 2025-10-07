// src/components/PromptCard.tsx
'use client';

import { Prompt } from '@/lib/types';
import { Copy, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export default function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    alert('Copied to clipboard!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work':
        return 'bg-blue-100 text-blue-800';
      case 'Personal':
        return 'bg-green-100 text-green-800';
      case 'Art':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {prompt.image_url && (
        <div className="relative w-full h-48">
          <Image
            src={prompt.image_url}
            alt={prompt.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {prompt.title}
            </h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded ${getCategoryColor(
                prompt.category
              )}`}
            >
              {prompt.category}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{prompt.content}</p>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={() => onEdit(prompt)}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}