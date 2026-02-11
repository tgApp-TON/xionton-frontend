'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Temporary testing page: clears matrix_ton_user_id and redirects to /register */
export default function ClearPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('matrix_ton_user_id');
    }
    router.replace('/register');
  }, [router]);

  return null;
}
