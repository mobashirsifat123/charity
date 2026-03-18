"use client";

import { supabase } from '@/lib/supabaseClient';

export async function adminFetch(input, init = {}) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || 'Failed to read the current session.');
  }

  const accessToken = data?.session?.access_token;

  if (!accessToken) {
    throw new Error('You must be logged in as an admin to access this resource.');
  }

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);

  return fetch(input, {
    ...init,
    headers,
  });
}

export async function adminFetchJson(input, init = {}) {
  const response = await adminFetch(input, init);
  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(result?.error || result?.message || 'Admin request failed.');
  }

  return result;
}
