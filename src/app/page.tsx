'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FormData } from '@/types';

export default function Home() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/forms');
        if (!res.ok) throw new Error('Failed to fetch forms');
        const data = await res.json();
        setForms(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Unable to load forms. Please try again.');
        } else {
          setError('Unable to load forms. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchForms();
  }, []);

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-form-bg font-roboto text-form-text">
      <header className="bg-form-card shadow-form-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-form-purple">Your Forms</h1>
          <Link
            href="/form-builder"
            className="px-4 py-2 bg-form-blue text-white rounded-md hover:bg-form-blue-light hover:text-form-blue transition-all"
            aria-label="Create a new form"
          >
            Create New Form
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 bg-form-card border border-form-border rounded-md text-form-text focus:ring-2 focus:ring-form-blue focus:border-form-blue transition-all"
            aria-label="Search forms by name"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-form-error text-form-error rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-form-card p-4 rounded-lg border border-form-border shadow-form-card animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          <p className="text-form-secondary text-center">
            {searchQuery ? 'No forms match your search.' : 'No forms found. Create a new form to get started!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((form) => (
              <Link
                key={form.id}
                href={`/form-builder?id=${form.id}`}
                className="bg-form-card p-4 rounded-lg border border-form-border shadow-form-card hover:bg-form-blue-light transition-all"
                aria-label={`Edit form: ${form.name}`}
              >
                <h2 className="text-lg font-bold text-form-text truncate">{form.name}</h2>
                <p className="text-sm text-form-secondary truncate">{form.description || 'No description'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}