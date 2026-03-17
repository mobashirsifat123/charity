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

    useEffect(() => {
        // Initial session fetch
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                if (session) {
                    // Check if we also have user metadata from the DB
                    const { data: userData } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', session.user.email)
                        .single();
                        
                    setUser({ ...session.user, ...userData });
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
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();
                setUser({ ...session.user, ...userData });
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
