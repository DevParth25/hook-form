'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-deep-purple to-teal font-sans text-white flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-neon-pink shadow-neon-pink max-w-md w-full text-center">
        <h1 className="text-3xl font-orbitron bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent mb-4">
          Welcome to Form Builder
        </h1>
        <p className="text-neon-cyan mb-6">
          Create and manage your forms with ease using our futuristic form builder application.
        </p>
        <div className="space-y-4">
          <Link
            href="/form-builder"
            className="block px-6 py-2 bg-neon-pink text-white rounded-md hover:bg-neon-pink/80 hover:shadow-neon-pink transition-all"
          >
            Create a New Form
          </Link>
          <Link
            href="/forms"
            className="block px-6 py-2 border border-neon-pink text-neon-pink rounded-md hover:bg-neon-pink hover:text-white hover:shadow-neon-pink transition-all"
          >
            View All Forms
          </Link>
        </div>
      </div>
    </main>
  );
}