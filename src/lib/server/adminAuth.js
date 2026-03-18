import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for admin API routes.`);
  }

  return value;
};

const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export const createAdminSupabaseClient = () =>
  createClient(supabaseUrl, supabaseServiceRoleKey, clientOptions);

const createAuthSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, clientOptions);

const unauthorized = (message, status = 401) =>
  NextResponse.json({ success: false, error: message }, { status });

export async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return {
      errorResponse: unauthorized('Authentication required. Missing bearer token.'),
    };
  }

  const authClient = createAuthSupabaseClient();
  const { data: userData, error: authError } = await authClient.auth.getUser(token);

  if (authError || !userData?.user) {
    return {
      errorResponse: unauthorized('Authentication failed. Invalid or expired session token.'),
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, role, name')
    .eq('email', userData.user.email)
    .maybeSingle();

  if (profileError) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: profileError.message || 'Failed to verify admin role.' },
        { status: 500 }
      ),
    };
  }

  if (!profile || profile.role !== 'admin') {
    return {
      errorResponse: unauthorized('Admin privileges are required to access this resource.', 403),
    };
  }

  return {
    supabase,
    user: userData.user,
    profile,
  };
}
