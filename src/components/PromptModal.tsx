// src/components/PromptModal.tsx
'use client';

import { Prompt, PromptFormData } from '@/lib/types';
import { X, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PromptFormData) => void;
  editingPrompt: Prompt | null;
}

export default function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  editingPrompt,
}: PromptModalProps) {
  const [formData, setFormData] = useState<PromptFormData>({
    title: '',
    content: '',
    category: 'Work',
    image_url: null,
  });

  useEffect(() => {
    if (editingPrompt) {
      setFormData({
        title: editingPrompt.title,
        content: editingPrompt.content,
        category: editingPrompt.category,
        image_url: editingPrompt.image_url,
      });
    } else {
      setFormData({ title: '', content: '', category: 'Work', image_url: null });
    }
  }, [editingPrompt]);

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      ...formData,
      image_url: formData.category === 'Art' ? formData.image_url : null,
    });

    setFormData({ title: '', content: '', category: 'Work', image_url: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPrompt ? 'Edit Prompt' : 'New Prompt'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Weekly Report Template"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as 'Work' | 'Personal' | 'Art',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Art">Art</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your prompt here..."
              />
            </div>

            {formData.category === 'Art' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2 relative w-full h-48">
                    <Image
                      src={formData.image_url}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingPrompt ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}