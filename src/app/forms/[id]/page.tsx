'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { Form } from '@/types';

export default function FormView() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isNavOpen, toggleNav, closeNav } = useNavigation();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${id}`);
        if (!res.ok) throw new Error('Failed to fetch form');
        const data = await res.json();
        setForm(data);
      } catch {
        setError('Failed to load form. Please try again.');
      }
    };
    fetchForm();
  }, [id]);

  if (!form && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-purple to-teal flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-neon-pink"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-deep-purple to-teal font-sans text-white">
      <nav className="fixed top-0 left-0 right-0 bg-deep-purple text-white shadow-lg z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
            Form View
          </h1>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/forms"
              className="px-3 py-1 text-sm hover:bg-neon-pink hover:text-white rounded-md transition-colors"
            >
              Back to Forms
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
              href="/forms"
              className="block py-2 text-sm hover:bg-neon-pink hover:text-white rounded-md transition-colors"
              onClick={closeNav}
            >
              Back to Forms
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
        {form && (
          <>
            <section className="mb-8 bg-white/10 backdrop-blur-md p-6 rounded-lg border border-neon-pink shadow-neon-pink">
              <h2 className="text-lg font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent mb-4">
                Form Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neon-cyan">Form Name</label>
                  <p className="mt-1 text-white">{form.formName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neon-cyan">Form Description</label>
                  <p className="mt-1 text-white">{form.description}</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                Questions
              </h2>
              {form.questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-neon-pink shadow-neon-pink"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-neon-cyan">Question Title</label>
                      <p className="mt-1 text-white">{question.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neon-cyan">Question Type</label>
                      <p className="mt-1 text-white capitalize">{question.questionType}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neon-cyan">Question Description</label>
                    <p className="mt-1 text-white">{question.questionText}</p>
                  </div>
                  {question.questionType === 'score' && question.scoreRanges && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neon-cyan">Score Ranges</label>
                      <div className="mt-2 space-y-2">
                        {question.scoreRanges.map((range, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <span className="text-white">{range.title}</span>
                            <span className="text-neon-cyan">
                              {range.min} - {range.max}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {question.questionType === 'checkbox' && question.options && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neon-cyan">Options</label>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <input type="checkbox" disabled className="h-4 w-4 text-neon-pink border-neon-pink rounded" />
                            <span className="text-white">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex items-center space-x-4">
                    <span className="text-sm text-neon-cyan">
                      Required: {question.required ? 'Yes' : 'No'}
                    </span>
                    <span className="text-sm text-neon-cyan">
                      Allow Comments: {question.commentRequired ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}