"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

function CompleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn btn-success rounded-pill px-4"
      disabled={pending}
    >
      {pending ? 'Saving progress...' : 'Mark Module Complete'}
    </button>
  );
}

export default function MarkModuleCompleteButton({ action, nextHref = '/courses' }) {
  const { user, loading } = useAuth();
  const [accessToken, setAccessToken] = useState('');
  const [tokenLoading, setTokenLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (active) {
          setAccessToken(session?.access_token || '');
          setTokenLoading(false);
        }
      } catch (error) {
        console.error('Unable to load session token for course progress:', error);
        if (active) {
          setTokenLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <button type="button" className="btn btn-outline-secondary rounded-pill px-4" disabled>
        Loading...
      </button>
    );
  }

  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(nextHref)}`} className="btn btn-outline-primary rounded-pill px-4">
        Log in to save progress
      </Link>
    );
  }

  if (tokenLoading) {
    return (
      <button type="button" className="btn btn-outline-secondary rounded-pill px-4" disabled>
        Preparing...
      </button>
    );
  }

  if (!accessToken) {
    return (
      <Link href={`/login?next=${encodeURIComponent(nextHref)}`} className="btn btn-outline-primary rounded-pill px-4">
        Refresh login to save progress
      </Link>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="accessToken" value={accessToken} />
      <CompleteButton />
    </form>
  );
}
