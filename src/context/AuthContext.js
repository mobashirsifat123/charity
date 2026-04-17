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

        let userData = null;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', sessionUser.email)
                .maybeSingle();

            if (error) {
                throw error;
            }

            userData = data || null;
        } catch (profileError) {
            console.warn('Unable to read public.users profile during auth hydration. Falling back to Supabase auth user only.', profileError);
        }

        return {
            ...sessionUser,
            ...userData,
            name:
                userData?.name ||
                sessionUser.user_metadata?.full_name ||
                sessionUser.user_metadata?.name ||
                sessionUser.email,
            email: userData?.email || sessionUser.email,
            role: userData?.role || 'donor',
        };
    };

    const refreshUser = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        if (!session?.user) {
            setUser(null);
            return null;
        }

        const hydratedUser = await hydrateUser(session.user);
        setUser(hydratedUser);
        return hydratedUser;
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

    const updateProfile = async ({ name }) => {
        const trimmedName = String(name || '').trim();

        if (!trimmedName) {
            throw new Error('Name is required.');
        }

        const { error: authError } = await supabase.auth.updateUser({
            data: {
                full_name: trimmedName,
                name: trimmedName,
            },
        });

        if (authError) {
            throw authError;
        }

        if (user?.email) {
            const { error: profileError } = await supabase
                .from('users')
                .update({ name: trimmedName })
                .eq('email', user.email);

            if (profileError) {
                console.warn('Unable to update public.users profile name from dashboard.', profileError);
            }
        }

        return refreshUser();
    };

    const changePassword = async ({ password }) => {
        const normalizedPassword = String(password || '');

        if (normalizedPassword.length < 6) {
            throw new Error('Password must be at least 6 characters.');
        }

        const { error } = await supabase.auth.updateUser({
            password: normalizedPassword,
        });

        if (error) {
            throw error;
        }

        return true;
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
        refreshUser,
        updateProfile,
        changePassword,
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
