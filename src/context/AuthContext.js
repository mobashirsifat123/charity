"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Create the Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const hydrateUser = async (sessionUser) => {
        if (!sessionUser?.email) {
            return sessionUser || null;
        }

        let { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', sessionUser.email)
            .maybeSingle();

        if (!userData) {
            try {
                await supabase.from('users').insert({
                    name:
                        sessionUser.user_metadata?.full_name ||
                        sessionUser.user_metadata?.name ||
                        sessionUser.email,
                    email: sessionUser.email,
                    password_hash: 'managed_by_supabase_auth',
                    role: 'donor',
                });

                const result = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', sessionUser.email)
                    .maybeSingle();

                userData = result.data || null;
            } catch (profileError) {
                console.error('Unable to sync public.users profile:', profileError);
            }
        }

        return { ...sessionUser, ...userData };
    };

    useEffect(() => {
        // Initial session fetch
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                if (session) {
                    const hydratedUser = await hydrateUser(session.user);
                    setUser(hydratedUser);
                }
            } catch (error) {
                console.error('Error fetching Supabase session:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for Auth changes (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                const hydratedUser = await hydrateUser(session.user);
                setUser(hydratedUser);
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Logout function - clears Supabase session
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user;
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        loading,
        logout,
        isAuthenticated,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
