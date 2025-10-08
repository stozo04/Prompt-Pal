// src/components/PromptModal.tsx
'use client';

import { Prompt, PromptFormData } from '@/lib/types';
import { X, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

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
    user_id: '',
    title: '',
    content: '',
    description: '',
    category: 'Work',
    image_url: null,
    ai_provider: 'OpenAI',
  });
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);

  const supabase = createClient();
  const BUCKET = 'prompt_storage';

  // Fetch user when modal opens (or isOpen changes)
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user in PromptModal useEffect', error);
        return;
      }
      if (user) {
        setFormData((f) => ({ ...f, user_id: user.id }));
      }
    })();
  }, [isOpen, supabase]);

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        setUploading(true);

        const {
          data: { user: currentUser },
          error: sessionError,
        } = await supabase.auth.getUser();

        if (sessionError) {
          alert('Error checking auth session');
          console.error('Error checking auth session', sessionError);
          return null;
        }

        if (!currentUser) {
          alert('You must be signed in to upload images. Please sign in and try again.');
          return null;
        }

        if (!file.type.startsWith('image/')) {
          alert('Only image files are allowed');
          return null;
        }
        const MAX_BYTES = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_BYTES) {
          alert('Image must be smaller than 5MB');
          return null;
        }

        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('Upload error', uploadError);
          alert('Error uploading image: ' + uploadError.message);
          return null;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return data.publicUrl;
      } catch (err) {
        console.error(err);
        alert('Unexpected error uploading image');
        return null;
      } finally {
        setUploading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (editingPrompt) {
      setFormData({
        user_id: editingPrompt.user_id,
        title: editingPrompt.title,
        description: editingPrompt.description ?? '',
        content: editingPrompt.content,
        category: editingPrompt.category,
        image_url: editingPrompt.image_url,
        ai_provider: editingPrompt.ai_provider ?? 'OpenAI',
      });
      setLocalPreview(editingPrompt.image_url ?? null);
    } else {
      setFormData({
        user_id: '',
        title: '',
        description: '',
        content: '',
        category: 'Work',
        image_url: null,
        ai_provider: 'OpenAI',
      });
      setLocalPreview(null);
    }
  }, [editingPrompt]);

  const handleFileSelect = async (file?: File | null) => {
    if (!file) return;
    const publicUrl = await uploadFile(file);
    if (publicUrl) {
      setFormData((s) => ({ ...s, image_url: publicUrl }));
      setLocalPreview(publicUrl);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) await handleFileSelect(f);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    // As a safety, re-check user before submit
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();
    if (sessionError) {
      console.error('Error fetching user in handleSubmit', sessionError);
      alert('Error validating session');
      return;
    }
    if (!user) {
      alert('You must be signed in to submit.');
      return;
    }

    onSubmit({
      ...formData,
      user_id: user.id,
      image_url: formData.category === 'Art' ? formData.image_url : null,
    });

    setFormData({
      user_id: '',
      title: '',
      content: '',
      description: '',
      category: 'Work',
      image_url: null,
      ai_provider: 'OpenAI',
    });
    setLocalPreview(null);
  };

  if (!isOpen) return null;

  return (
    <>
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
                  AI Provider *
                </label>
                <select
                  value={formData.ai_provider}
                  onChange={(e) =>
                    setFormData({ ...formData, ai_provider: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="xAI">xAI</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Gemini">Gemini</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[150px]"
                  placeholder="description..."
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[150px]"
                  placeholder="Enter your prompt here..."
                />
              </div>

              {formData.category === 'Art' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Image (Optional)
                  </label>

                  {!localPreview ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center text-sm text-gray-500 hover:border-gray-400"
                    >
                      <p className="mb-2">Drag & drop an image here, or</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (e) => {
                            const f = e.target.files?.[0] ?? null;
                            await handleFileSelect(f);
                            if (e.target) {
                              e.target.value = '';
                            }
                          }}
                        />
                        <span className="px-4 py-2 bg-white border rounded shadow-sm text-blue-600 hover:bg-blue-50">
                          Select file
                        </span>
                      </label>

                      {uploading && <p className="mt-2 text-xs text-gray-400">Uploading...</p>}
                    </div>
                  ) : (
                      <div className="space-y-2">
                        <div
                          className="relative w-full h-64 rounded overflow-hidden border border-gray-300 bg-gray-100 cursor-pointer group"
                          onClick={() => setShowFullImage(true)}
                        >
                          <Image
                          src={localPreview}
                          alt="Preview"
                          fill
                            className="object-contain"
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                      </div>
                      <div className="flex gap-2">
                        <label className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors cursor-pointer text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={async (e) => {
                              const f = e.target.files?.[0] ?? null;
                              await handleFileSelect(f);
                              if (e.target) {
                                e.target.value = '';
                              }
                            }}
                          />
                          Change Image
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalPreview(null);
                            setFormData((s) => ({ ...s, image_url: null }));
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
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

      {showFullImage && localPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[60]"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image
              src={localPreview}
              alt="Full size preview"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
