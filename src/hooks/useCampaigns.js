"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';

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

    // Fetch campaigns
    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            params.append('page', String(page));
            params.append('limit', '6');

            const response = await api.get(`/campaigns?${params.toString()}`);

            if (response.data.success) {
                setCampaigns(response.data.data);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.currentPage);
                setTotal(response.data.total);
            } else {
                setError(response.data.message || 'Failed to fetch campaigns');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
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
