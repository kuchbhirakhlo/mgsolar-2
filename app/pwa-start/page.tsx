'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PWAStart() {
  const router = useRouter();

  useEffect(() => {
    const startPath = localStorage.getItem('pwa_start') || '/';
    router.replace(startPath);
  }, [router]);

  return <div>Redirecting...</div>;
}