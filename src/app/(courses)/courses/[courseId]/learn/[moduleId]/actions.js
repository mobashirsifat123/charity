"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function markModuleComplete(moduleId, formData) {
  const accessToken = String(formData.get('accessToken') || '').trim();

  if (!accessToken) {
    throw new Error('You must be logged in to save course progress.');
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !authData?.user?.email) {
    throw new Error('Your session could not be verified. Please log in again.');
  }

  const { data: profile, error: profileError } = await serviceClient
    .from('users')
    .select('id, email')
    .eq('email', authData.user.email)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error('Unable to find your course profile.');
  }

  const payload = {
    user_id: profile.id,
    module_id: Number(moduleId),
    is_completed: true,
    completed_at: new Date().toISOString(),
  };

  const { error } = await serviceClient
    .from('user_course_progress')
    .upsert(payload, { onConflict: 'user_id,module_id' });

  if (error) {
    throw new Error(error.message || 'Unable to save your course progress.');
  }

  const { data: moduleRow } = await serviceClient
    .from('course_modules')
    .select('course_id')
    .eq('id', moduleId)
    .maybeSingle();

  if (moduleRow?.course_id) {
    revalidatePath(`/courses/${moduleRow.course_id}`);
    revalidatePath(`/courses/${moduleRow.course_id}/learn/${moduleId}`);
  }
}
