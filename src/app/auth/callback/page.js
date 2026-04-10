"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    
    const handleCallback = async () => {
      if (!mounted) return;
      const url = new URL(window.location.href);
      const nextPath = url.searchParams.get('next') || '/dashboard';

      setTimeout(async () => {
        if (!mounted) return;
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during auth callback:', error.message);
          router.push('/login?error=' + encodeURIComponent(error.message));
          return;
        }

        router.push(nextPath);
      }, 500); 
    };

    handleCallback();
    return () => { mounted = false; };
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <h4 className="mt-3 text-muted">Completing sign in...</h4>
    </div>
  );
}
