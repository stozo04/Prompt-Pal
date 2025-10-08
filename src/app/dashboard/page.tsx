// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Prompt, PromptFormData } from '@/lib/types';
import { Plus } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import PromptModal from '@/components/PromptModal';
import AuthButton from '@/components/AuthButton';
import SearchBar from '@/components/SearchBar';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr/dist/main/createBrowserClient';

const categories = ['All', 'Work', 'Personal', 'Art'];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('user: ', user)
    if (!user) {
      router.push('/login');
    }
  }, [router, supabase.auth]);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    // get current user and fetch only their prompts
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPrompts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      setPrompts([]);
    } else {
      setPrompts((data as Prompt[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  const filterPrompts = useCallback(() => {
    let filtered = prompts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPrompts(filtered);
  }, [prompts, selectedCategory, searchQuery]);

  useEffect(() => {
    checkUser();
    fetchPrompts();
  }, [checkUser, fetchPrompts]);

  useEffect(() => {
    filterPrompts();
  }, [filterPrompts]);

  const handleCreatePrompt = async (data: PromptFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('prompts').insert([
      {
        ...data,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert('Error creating prompt: ' + error.message);
    } else {
      fetchPrompts();
      setShowModal(false);
    }
  };

  const handleUpdatePrompt = async (data: PromptFormData) => {
    if (!editingPrompt) return;

    const { error } = await supabase
      .from('prompts')
      .update({
        ...data,
        ai_provider: data.ai_provider ?? 'OpenAI',
      })
      .eq('id', editingPrompt.id);

    if (error) {
      alert('Error updating prompt: ' + error.message);
    } else {
      fetchPrompts();
      setShowModal(false);
      setEditingPrompt(null);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    const { error } = await supabase.from('prompts').delete().eq('id', id);

    if (error) {
      alert('Error deleting prompt: ' + error.message);
    } else {
      fetchPrompts();
    }
  };

  const handleOpenModal = (prompt: Prompt | null = null) => {
    setEditingPrompt(prompt);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Prompt Manager
            </h1>
            <p className="text-slate-600">Organize and manage your AI prompts</p>
          </div>
          <AuthButton />
        </div>

        {/* Search and Add */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search prompts..."
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Prompt
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Prompts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              No prompts found. Create your first one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={handleOpenModal}
                onDelete={handleDeletePrompt}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <PromptModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPrompt(null);
          }}
          onSubmit={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}
          editingPrompt={editingPrompt}
        />
      </div>
    </div>
  );
}