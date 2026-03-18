"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { adminFetchJson } from '@/lib/adminApi';
import Link from 'next/link';

function AdminFatwasContent() {
  const [fatwas, setFatwas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchFatwas = async () => {
      try {
        setLoading(true);
        const result = await adminFetchJson('/api/admin/resources/fatwas');
        setFatwas(result.data || []);
      } catch (err) {
        showToast('Error fetching fatwas: ' + err.message, 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchFatwas();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleToggleStatus = async (fatwa) => {
    const newStatus = fatwa.status === 'published' ? 'draft' : 'published';
    try {
      await adminFetchJson(`/api/admin/resources/fatwas/${fatwa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: { status: newStatus } }),
      });
      setFatwas(fatwas.map(f => f.id === fatwa.id ? { ...f, status: newStatus } : f));
      showToast(`Fatwa updated to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this Fatwa ruling?')) return;
    try {
      await adminFetchJson(`/api/admin/resources/fatwas/${id}`, { method: 'DELETE' });
      setFatwas(fatwas.filter(f => f.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      showToast('Fatwa deleted successfully');
    } catch (err) {
      showToast('Failed to delete fatwa', 'danger');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected fatwas?`)) return;
    
    try {
      await adminFetchJson('/api/admin/resources/fatwas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      
      setFatwas(fatwas.filter(f => !selectedIds.has(f.id)));
      setSelectedIds(new Set());
      showToast(`Deleted ${selectedIds.size} fatwas successfully`);
      setCurrentPage(1);
    } catch (err) {
      showToast('Failed to delete selected fatwas', 'danger');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === currentFatwas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentFatwas.map(f => f.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Derived state (Filter & Sort & Pagination)
  const filteredAndSortedFatwas = useMemo(() => {
    let result = [...fatwas];
    
    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(f => f.status === statusFilter);
    }
    
    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(f => 
        (f.title && f.title.toLowerCase().includes(lower)) || 
        (f.question && f.question.toLowerCase().includes(lower)) ||
        (f.answer && f.answer.toLowerCase().includes(lower))
      );
    }
    
    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortOrder === 'az') return (a.title || '').localeCompare(b.title || '');
      if (sortOrder === 'za') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
    
    return result;
  }, [fatwas, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedFatwas.length / itemsPerPage));
  const currentFatwas = filteredAndSortedFatwas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats
  const totalCount = fatwas.length;
  const publishedCount = fatwas.filter(f => f.status === 'published').length;
  const draftCount = totalCount - publishedCount;

  return (
    <section className="bg-light pb-5 min-vh-100 position-relative">
      {/* Toast Notification Container */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055 }}>
        <div className={`toast align-items-center text-bg-${toast.type} border-0 ${toast.show ? 'show' : 'hide'}`} role="alert">
          <div className="d-flex">
            <div className="toast-body fw-medium">
              <i className={toast.type === 'success' ? 'fa-solid fa-check-circle me-2' : 'fa-solid fa-triangle-exclamation me-2'}></i>
              {toast.message}
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ ...toast, show: false })}></button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1"><i className="fa-solid fa-scale-balanced text-primary me-2"></i>Fatwa Directives</h2>
            <p className="text-muted mb-0">Manage community questions and publish official Islamic rulings.</p>
          </div>
          <div>
            <Link href="/admin/fatwas/new" className="btn btn-primary btn-lg shadow-sm fw-bold">
              <i className="fa-solid fa-plus me-2"></i> Register New Ruling
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                  <i className="fa-solid fa-book-quran fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Total Statements</h6>
                  <h3 className="fw-bold mb-0">{totalCount}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
             <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
                  <i className="fa-solid fa-gavel fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Public / Handled</h6>
                  <h3 className="fw-bold mb-0">{publishedCount}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
             <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3">
                  <i className="fa-solid fa-exclamation-circle fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-0">Needs Response</h6>
                  <h3 className="fw-bold mb-0">{draftCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body bg-white rounded-4 p-4">
            <div className="row g-3 align-items-center">
              <div className="col-lg-5">
                 <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-search"></i></span>
                    <input 
                      type="text" 
                      className="form-control bg-light border-start-0 ps-0" 
                      placeholder="Search questions or keywords..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>
              <div className="col-lg-4">
                <div className="d-flex gap-2">
                   <select className="form-select bg-light focus-ring-none" value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}>
                     <option value="all">All States</option>
                     <option value="published">Published</option>
                     <option value="draft">Review / Draft</option>
                   </select>
                   <select className="form-select bg-light" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                     <option value="newest">Newest First</option>
                     <option value="oldest">Oldest First</option>
                     <option value="az">Topic (A-Z)</option>
                     <option value="za">Topic (Z-A)</option>
                   </select>
                </div>
              </div>
              {selectedIds.size > 0 && (
                <div className="col-lg-3 text-lg-end">
                   <button onClick={handleBulkDelete} className="btn btn-outline-danger w-100 fw-medium">
                     <i className="fa-solid fa-trash me-2"></i> Drop {selectedIds.size} Selected
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary shadow-sm" style={{width: '3rem', height: '3rem'}} role="status"></div>
                <p className="mt-3 text-muted fw-medium">Compiling index...</p>
              </div>
            ) : currentFatwas.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                    <i className="fa-solid fa-folder-open text-muted" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5 className="fw-bold">No Records Found</h5>
                <p className="text-muted">No fatwas matched your query. Clear filters or add a new record.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3" style={{width: '50px'}}>
                        <input 
                           type="checkbox" 
                           className="form-check-input shadow-sm"
                           checked={selectedIds.size > 0 && selectedIds.size === currentFatwas.length}
                           onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3">Topic / Question</th>
                      <th className="py-3 text-center">Visibility</th>
                      <th className="py-3">Created On</th>
                      <th className="px-4 py-3 text-end">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFatwas.map((fatwa) => (
                      <tr key={fatwa.id} className={selectedIds.has(fatwa.id) ? 'bg-primary bg-opacity-10' : ''}>
                        <td className="px-4 py-3">
                           <input 
                             type="checkbox" 
                             className="form-check-input shadow-sm"
                             checked={selectedIds.has(fatwa.id)}
                             onChange={() => toggleSelect(fatwa.id)}
                           />
                        </td>
                        <td className="py-3">
                           <div className="d-flex align-items-center gap-3">
                               <div className="bg-light rounded-circle text-center d-flex align-items-center justify-content-center border" style={{width: '45px', height: '45px'}}>
                                  <i className="fa-solid fa-quote-left text-muted"></i>
                               </div>
                               <div>
                                   <div className="fw-bold text-dark">{fatwa.title?.slice(0, 60)}{fatwa.title?.length > 60 && '...'}</div>
                                   <div className="text-muted small font-monospace">UUID: {fatwa.id.split('-')[0]}</div>
                               </div>
                           </div>
                        </td>
                        <td className="py-3 text-center">
                           <button 
                             onClick={() => handleToggleStatus(fatwa)}
                             className={`btn btn-sm px-3 rounded-pill fw-medium border-0 bg-${fatwa.status === 'published' ? 'success' : 'warning text-dark'} bg-opacity-10 text-${fatwa.status === 'published' ? 'success' : 'warning text-dark'}`}
                             title="Click to switch tracking state"
                           >
                              {fatwa.status === 'published' ? <><i className="fa-solid fa-volume-high me-1"></i> Public</> : <><i className="fa-solid fa-lock me-1"></i> Private</>}
                           </button>
                        </td>
                        <td className="py-3 text-muted fw-medium">
                          <i className="fa-regular fa-calendar-days me-2"></i>
                          {new Date(fatwa.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <Link href={`/admin/fatwas/edit/${fatwa.id}`} className="btn btn-sm btn-light border-secondary text-primary" title="Update Entry">
                              <i className="fa-solid fa-pen-circle"></i>
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Link>
                            <button onClick={() => handleDelete(fatwa.id)} className="btn btn-sm btn-light border-secondary text-danger" title="Erase Record">
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
          
          {/* Advanced Pagination Footer */}
          {!loading && currentFatwas.length > 0 && (
             <div className="card-footer bg-white border-0 p-4">
                 <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                     <span className="text-muted small">
                         Displaying <span className="fw-bold text-dark">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="fw-bold text-dark">{Math.min(currentPage * itemsPerPage, filteredAndSortedFatwas.length)}</span> records of <span className="fw-bold text-dark">{filteredAndSortedFatwas.length}</span> total
                     </span>
                     <nav>
                         <ul className="pagination pagination-sm mb-0 shadow-sm">
                             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                 <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                             </li>
                             {Array.from({ length: totalPages }, (_, i) => (
                                 <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                     <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                 </li>
                             ))}
                             <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                 <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                             </li>
                         </ul>
                     </nav>
                 </div>
             </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function AdminFatwasPage() {
    return <AdminFatwasContent />;
}
