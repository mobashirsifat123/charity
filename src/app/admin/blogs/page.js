"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminFetchJson } from '@/lib/adminApi';

function AdminBlogsContent() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminFetchJson('/api/admin/resources/blogs');
      setBlogs(result.data || []);
    } catch (err) {
      showToast('Error fetching articles: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';

    try {
      await adminFetchJson(`/api/admin/resources/blogs/${blog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { status: newStatus } }),
      });
      setBlogs((prev) => prev.map((item) => (item.id === blog.id ? { ...item, status: newStatus } : item)));
      showToast(`Article status updated to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this article?')) return;

    try {
      await adminFetchJson(`/api/admin/resources/blogs/${id}`, { method: 'DELETE' });
      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast('Article deleted successfully');
    } catch (err) {
      showToast('Failed to delete article', 'danger');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected articles?`)) return;

    try {
      await adminFetchJson('/api/admin/resources/blogs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      setBlogs((prev) => prev.filter((blog) => !selectedIds.has(blog.id)));
      setSelectedIds(new Set());
      setCurrentPage(1);
      showToast(`Deleted ${selectedIds.size} articles successfully`);
    } catch (err) {
      showToast('Failed to delete selected articles', 'danger');
    }
  };

  const filteredAndSortedBlogs = useMemo(() => {
    let result = [...blogs];

    if (statusFilter !== 'all') {
      result = result.filter((blog) => blog.status === statusFilter);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((blog) =>
        [blog.title, blog.content, blog.category, blog.author_name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(lower))
      );
    }

    result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortOrder === 'az') return (a.title || '').localeCompare(b.title || '');
      if (sortOrder === 'za') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });

    return result;
  }, [blogs, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBlogs.length / itemsPerPage));
  const currentBlogs = filteredAndSortedBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((blog) => blog.status === 'published').length;
  const draftCount = totalCount - publishedCount;

  const toggleSelectAll = () => {
    if (selectedIds.size === currentBlogs.length) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(currentBlogs.map((blog) => blog.id)));
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <section className="bg-light pb-5 min-vh-100 position-relative">
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055 }}>
        <div className={`toast align-items-center text-bg-${toast.type} border-0 ${toast.show ? 'show' : 'hide'}`} role="alert">
          <div className="d-flex">
            <div className="toast-body fw-medium">{toast.message}</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ ...toast, show: false })}></button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1"><i className="fa-solid fa-pen-nib text-primary me-2"></i>Article Management</h2>
            <p className="text-muted mb-0">Create, edit, and organize all your community articles and insights.</p>
          </div>
          <Link href="/admin/blogs/new" className="btn btn-primary btn-lg shadow-sm fw-bold">
            <i className="fa-solid fa-plus me-2"></i> Write New Article
          </Link>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                  <i className="fa-solid fa-layer-group fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Total Articles</h6>
                  <h3 className="fw-bold mb-0">{totalCount}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
                  <i className="fa-solid fa-check-circle fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Published</h6>
                  <h3 className="fw-bold mb-0">{publishedCount}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3">
                  <i className="fa-solid fa-clock fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Drafts / Hidden</h6>
                  <h3 className="fw-bold mb-0">{draftCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body bg-white rounded-4 p-4">
            <div className="row g-3 align-items-center">
              <div className="col-lg-5">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-search"></i></span>
                  <input type="text" className="form-control bg-light border-start-0 ps-0" placeholder="Search articles by title or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="d-flex gap-2">
                  <select className="form-select bg-light" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="all">All Statuses</option>
                    <option value="published">Published Only</option>
                    <option value="draft">Drafts Only</option>
                  </select>
                  <select className="form-select bg-light" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="az">Title (A-Z)</option>
                    <option value="za">Title (Z-A)</option>
                  </select>
                </div>
              </div>
              {selectedIds.size > 0 ? (
                <div className="col-lg-3 text-lg-end">
                  <button onClick={handleBulkDelete} className="btn btn-outline-danger w-100">
                    <i className="fa-solid fa-trash me-2"></i> Delete {selectedIds.size} Selected
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary shadow-sm" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                <p className="mt-3 text-muted fw-medium">Fetching article data...</p>
              </div>
            ) : currentBlogs.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                  <i className="fa-regular fa-folder-open text-muted" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5 className="fw-bold">No Articles Found</h5>
                <p className="text-muted">Adjust your search or filters, or create a new article.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3" style={{ width: '50px' }}>
                        <input type="checkbox" className="form-check-input" checked={selectedIds.size > 0 && selectedIds.size === currentBlogs.length} onChange={toggleSelectAll} />
                      </th>
                      <th className="py-3">Title & Overview</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3">Date Published</th>
                      <th className="px-4 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBlogs.map((blog) => (
                      <tr key={blog.id} className={selectedIds.has(blog.id) ? 'bg-primary bg-opacity-10' : ''}>
                        <td className="px-4 py-3">
                          <input type="checkbox" className="form-check-input" checked={selectedIds.has(blog.id)} onChange={() => toggleSelect(blog.id)} />
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-3">
                            {blog.image_url ? (
                              <div className="bg-light rounded text-center overflow-hidden" style={{ width: '60px', height: '40px' }}>
                                <Image src={blog.image_url} alt="thumbnail" width={60} height={40} className="w-100 h-100 object-fit-cover" unoptimized />
                              </div>
                            ) : (
                              <div className="bg-light rounded text-center d-flex align-items-center justify-content-center" style={{ width: '60px', height: '40px' }}>
                                <i className="fa-solid fa-image text-muted"></i>
                              </div>
                            )}
                            <div>
                              <div className="fw-bold text-dark">{blog.title?.slice(0, 50)}{blog.title?.length > 50 ? '...' : ''}</div>
                              <div className="text-muted small">{blog.category || 'General'}{blog.author_name ? ` • ${blog.author_name}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <button onClick={() => handleToggleStatus(blog)} className={`btn btn-sm px-3 rounded-pill fw-medium border-0 bg-${blog.status === 'published' ? 'success' : 'warning text-dark'} bg-opacity-10 text-${blog.status === 'published' ? 'success' : 'warning text-dark'}`} title="Click to toggle status">
                            {blog.status === 'published' ? <><i className="fa-solid fa-eye me-1"></i> Published</> : <><i className="fa-solid fa-eye-slash me-1"></i> Draft</>}
                          </button>
                        </td>
                        <td className="py-3 text-muted fw-medium">
                          <i className="fa-regular fa-calendar me-2"></i>
                          {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <Link href={`/admin/blogs/edit/${blog.id}`} className="btn btn-sm btn-light border-secondary text-primary" title="Edit">
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Link>
                            <button onClick={() => handleDelete(blog.id)} className="btn btn-sm btn-light border-secondary text-danger" title="Delete">
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 ? (
          <div className="d-flex justify-content-center mt-4 gap-2">
            <button className="btn btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
            <span className="align-self-center text-muted">Page {currentPage} of {totalPages}</span>
            <button className="btn btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function AdminBlogsPage() {
  return <AdminBlogsContent />;
}
