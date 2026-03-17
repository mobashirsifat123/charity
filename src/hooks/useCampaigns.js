"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/**
 * useCampaigns - Hook for fetching campaigns with search, filter, pagination
 * Automatically syncs with URL parameters
 */
export function useCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Get current params from URL
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 6;

    // Fetch campaigns
    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            let query = supabase.from('campaigns').select('*', { count: 'exact' });

            if (search) {
                query = query.ilike('title', `%${search}%`);
            }
            if (category) {
                // Ignore for now, campaigns table does not have category yet
            }

            const from = (page - 1) * limit;
            const to = from + limit - 1;

            query = query.range(from, to).order('created_at', { ascending: false });

            const { data, count, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setCampaigns(data || []);
            setTotal(count || 0);
            setTotalPages(Math.ceil((count || 0) / limit) || 1);
            setCurrentPage(page);
        } catch (err) {
            setError(err.message || 'An error occurred fetching campaigns');
        } finally {
            setLoading(false);
        }
    }, [search, category, page]);

    // Refetch when URL params change
    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    // Update URL params helper
    const updateParams = useCallback((updates = {}) => {
        const newParams = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });

        // Reset to page 1 when search or category changes (unless page is being explicitly set)
        if (('search' in updates || 'category' in updates) && !('page' in updates)) {
            newParams.set('page', '1');
        }

        router.push(`?${newParams.toString()}`, { scroll: false });
    }, [searchParams, router]);

    // Search handler
    const setSearch = useCallback((term) => {
        updateParams({ search: term || '' });
    }, [updateParams]);

    // Category handler
    const setCategory = useCallback((cat) => {
        updateParams({ category: cat === 'all' ? '' : cat });
    }, [updateParams]);

    // Page handler
    const setPage = useCallback((newPage) => {
        updateParams({ page: String(newPage) });
    }, [updateParams]);

    return {
        campaigns,
        loading,
        error,
        totalPages,
        currentPage,
        total,
        search,
        category,
        setSearch,
        setCategory,
        setPage,
        refetch: fetchCampaigns,
    };
}

export default useCampaigns;
