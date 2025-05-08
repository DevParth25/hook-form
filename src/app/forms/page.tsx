'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import { Form } from '@/types';

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isNavOpen, toggleNav, closeNav } = useNavigation();

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/forms');
      if (!res.ok) throw new Error('Failed to fetch forms');
      const data = await res.json();
      setForms(data);
    } catch {
      setError('Failed to load forms. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete form');
      setForms(forms.filter((form) => form.id !== id));
    } catch {
      setError('Failed to delete form. Please try again.');
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-deep-purple to-teal font-sans text-white">
      <nav className="fixed top-0 left-0 right-0 bg-deep-purple text-white shadow-lg z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
            Forms List
          </h1>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/form-builder"
              className="px-3 py-1 text-sm bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink transition-all"
            >
              Create New Form
            </Link>
          </div>
          <button
            className="md:hidden p-2"
            onClick={toggleNav}
            aria-label="Toggle Navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
        {isNavOpen && (
          <div className="md:hidden bg-deep-purple/90 px-4 py-2">
            <Link
              href="/form-builder"
              className="block py-2 text-sm bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink transition-all"
              onClick={closeNav}
            >
              Create New Form
            </Link>
          </div>
        )}
      </nav>

      <div className="pt-20 max-w-3xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 text-red-500 rounded-md backdrop-blur-md">
            {error}
          </div>
        )}
        <h2 className="text-lg font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent mb-6">
          Your Forms
        </h2>
        {forms.length === 0 ? (
          <p className="text-center text-neon-cyan">No forms found. Create a new form to get started!</p>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-neon-pink shadow-neon-pink"
              >
                <h3 className="text-lg font-orbitron text-neon-cyan">{form.formName}</h3>
                <p className="mt-2 text-sm text-white">{form.description}</p>
                <div className="mt-4 flex space-x-3">
                  <Link
                    href={`/forms/${form.id}`}
                    className="px-3 py-1 text-sm bg-neon-cyan text-white rounded-md hover:bg-neon-cyan/80 hover:shadow-neon-pink transition-all"
                  >
                    View
                  </Link>
                  <Link
                    href={`/form-builder?id=${form.id}`}
                    className="px-3 py-1 text-sm bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink transition-all"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 hover:shadow-neon-pink transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}