'use client';

import dynamic from 'next/dynamic';

const RegisterClient = dynamic(() => import('./RegisterClient').then((m) => ({ default: m.RegisterClient })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  ),
});

export default function RegisterPage() {
  return <RegisterClient />;
}
