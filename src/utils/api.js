"use client";
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

// Create axios instance with base URL from environment variable
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.irwaa.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach JWT token to every request
api.interceptors.request.use(
    async (config) => {
        try {
            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error fetching session in interceptor:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear session via Supabase
            if (typeof window !== 'undefined') {
                try {
                    await supabase.auth.signOut();
                } catch (e) {
                    console.error('Error signing out on 401:', e);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
