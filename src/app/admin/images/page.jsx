"use client";
import React, { useState, useEffect } from 'react';
import { adminFetch, adminFetchJson } from '@/lib/adminApi';

export default function ImageManagement() {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [images, setImages] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [fatwas, setFatwas] = useState([]);
    const [team, setTeam] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const [previewSelected, setPreviewSelected] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // For fullscreen preview
    const [fullscreenImage, setFullscreenImage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [registryResult, campaignResult, blogResult, fatwaResult, teamResult] = await Promise.all([
                adminFetchJson('/api/admin/images/registry'),
                adminFetchJson('/api/admin/resources/campaigns'),
                adminFetchJson('/api/admin/resources/blogs'),
                adminFetchJson('/api/admin/resources/fatwas'),
                adminFetchJson('/api/admin/resources/team'),
            ]);
            setImages(registryResult.data || []);
            setCampaigns(campaignResult.data || []);
            setBlogs(blogResult.data || []);
            setFatwas(fatwaResult.data || []);
            setTeam(teamResult.data || []);

        } catch (err) {
            console.error('Failed to fetch data', err);
            showToast('Failed to load image data', 'error');
        }
        setLoading(false);
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // --- File Handling and Drag/Drop ---
    const handleFileSelect = (e, itemData) => {
        const file = e.target.files?.[0];
        if (!file) return;
        prepareUpload(file, itemData);
    };

    const handleDrop = (e, itemData) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) prepareUpload(file, itemData);
    };

    const prepareUpload = (file, itemData) => {
        if (file.size > 5 * 1024 * 1024) {
            showToast('File too large. Maximum size is 5MB.', 'error');
            return;
        }
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            showToast('Invalid file format. Please upload JPG, PNG, WEBP, or SVG.', 'error');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviewSelected({
            ...itemData,
            file,
            previewUrl
        });
    };

    const confirmUpload = async () => {
        if (!previewSelected || !previewSelected.file) return;
        
        setUploadingId(previewSelected.uniqueId);
        showToast('Uploading image...', 'info');

        try {
            const formData = new FormData();
            formData.append('file', previewSelected.file);
            formData.append('folder', previewSelected.folder || 'general');

            if (previewSelected.table_name) {
                formData.append('table_name', previewSelected.table_name);
            }
            if (previewSelected.column_name) {
                formData.append('column_name', previewSelected.column_name);
            }
            if (previewSelected.row_id) {
                formData.append('row_id', previewSelected.row_id);
            }
            if (previewSelected.setting_key) {
                formData.append('setting_key', previewSelected.setting_key);
            }

            const res = await adminFetch('/api/admin/images', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            
            if (data.success) {
                showToast('Image uploaded and updated successfully!', 'success');
                fetchData(); // Refresh data to show new image
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            showToast(`Upload failed: ${err.message}`, 'error');
        } finally {
            setUploadingId(null);
            setPreviewSelected(null);
        }
    };

    const removeImage = async (itemData) => {
        if (!confirm('Are you sure you want to remove this image?')) return;
        
        setUploadingId(itemData.uniqueId);
        try {
            const res = await adminFetch('/api/admin/images/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table_name: itemData.table_name,
                    column_name: itemData.column_name,
                    row_id: itemData.row_id,
                    setting_key: itemData.setting_key,
                    image_url: itemData.current_url
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Image removed successfully!', 'success');
                fetchData();
            } else {
                throw new Error(data.error || 'Failed to remove');
            }
        } catch (err) {
            showToast(`Removal failed: ${err.message}`, 'error');
        } finally {
            setUploadingId(null);
        }
    };

    const copyToClipboard = (url) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        showToast('Image URL copied to clipboard!', 'success');
    };

    // --- Rendering Helpers ---
    
    // Unify all items into an array of cards to render
    let compiledItems = [];

    // Registry items
    images.forEach(reg => {
        compiledItems.push({
            uniqueId: `reg_${reg.id}`,
            section: reg.section,
            label: reg.label,
            description: reg.description,
            recommended_size: reg.recommended_size,
            current_url: reg.current_url,
            table_name: reg.table_name,
            column_name: reg.column_name,
            setting_key: reg.setting_key,
            folder: reg.folder,
            ...reg
        });
    });

    // Campaigns loop
    campaigns.forEach(c => {
        compiledItems.push({
            uniqueId: `camp_${c.id}_thumb`,
            table_name: 'campaigns',
            row_id: c.id,
            section: 'Campaigns',
            label: `${c.title} (Primary Image)`,
            description: c.category || 'Campaign image used across listings and cards.',
            column_name: 'image_url',
            folder: 'campaigns',
            current_url: c.image_url,
            recommended_size: '600x400px'
        });
        if (Object.prototype.hasOwnProperty.call(c, 'cover_image')) {
            compiledItems.push({
                uniqueId: `camp_${c.id}_cover`,
                table_name: 'campaigns',
                row_id: c.id,
                section: 'Campaigns',
                label: `${c.title} (Cover Image)`,
                description: 'Optional wide banner image for campaign detail layouts.',
                column_name: 'cover_image',
                folder: 'campaigns',
                current_url: c.cover_image,
                recommended_size: '1920x600px'
            });
        }
    });

    // Articles loop
    blogs.forEach(b => {
        compiledItems.push({
            uniqueId: `blog_${b.id}_feature`,
            table_name: 'blogs',
            row_id: b.id,
            section: 'Articles',
            label: `${b.title} (Feature Image)`,
            column_name: 'image_url',
            folder: 'blogs',
            current_url: b.image_url,
            recommended_size: '800x600px'
        });
        if (Object.prototype.hasOwnProperty.call(b, 'social_image')) {
            compiledItems.push({
                uniqueId: `blog_${b.id}_social`,
                table_name: 'blogs',
                row_id: b.id,
                section: 'Articles',
                label: `${b.title} (Social Preview)`,
                description: 'Used for social sharing and preview metadata.',
                column_name: 'social_image',
                folder: 'blogs',
                current_url: b.social_image,
                recommended_size: '1200x630px'
            });
        }
    });

    // Fatwas loop
    fatwas.forEach(f => {
        if (Object.prototype.hasOwnProperty.call(f, 'social_image')) {
            compiledItems.push({
                uniqueId: `fatwa_${f.id}_social`,
                table_name: 'fatwas',
                row_id: f.id,
                section: 'Fatwas',
                label: `${f.title || f.question} (Social Preview)`,
                description: f.category || 'Social sharing image for this fatwa.',
                column_name: 'social_image',
                folder: 'fatwas',
                current_url: f.social_image,
                recommended_size: '1200x630px'
            });
        }
    });

    // Team loop
    team.forEach(t => {
        compiledItems.push({
            uniqueId: `team_${t.id}`,
            table_name: 'team_members',
            row_id: t.id,
            section: 'Team',
            label: t.name,
            description: t.role,
            column_name: 'image_url',
            folder: 'team',
            current_url: t.image_url,
            recommended_size: '400x500px'
        });
    });

    // Map out available sections for tabs
    const sections = ['All', ...new Set(compiledItems.map(item => item.section).filter(Boolean))].sort();

    // Filter items
    const filteredItems = compiledItems.filter(item => {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch =
            item.label?.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery) ||
            item.section?.toLowerCase().includes(lowerQuery);
        const matchesTab = activeTab === 'All' || item.section === activeTab;
        return matchesSearch && matchesTab;
    });

    if (loading && compiledItems.length === 0) {
        return (
            <div className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="placeholder-glow"><span className="placeholder col-4"></span></h2>
                </div>
                <div className="row">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="col-md-4 col-lg-3 mb-4">
                            <div className="card shadow-sm border-0 h-100 placeholder-glow">
                                <div className="card-body pb-0"><span className="placeholder col-8"></span></div>
                                <div className="p-3"><div className="placeholder w-100" style={{ height: '150px' }}></div></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="position-relative">
            {/* Toast Container */}
            <div className="toast-container position-fixed bottom-0 end-0 p-3 z-3">
                {toast.show && (
                    <div className={`toast show align-items-center text-white bg-${toast.type === 'error' ? 'danger' : toast.type === 'info' ? 'info' : 'success'} border-0`} role="alert">
                        <div className="d-flex">
                            <div className="toast-body">
                                <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation' : toast.type === 'info' ? 'fa-spinner fa-spin' : 'fa-check'} me-2`}></i>
                                {toast.message}
                            </div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ show: false, message: '', type: 'success' })}></button>
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4 bg-white p-3 rounded shadow-sm sticky-top" style={{ zIndex: 10, top: '0' }}>
                <div>
                    <h2 className="mb-1 fs-4">Image Management System</h2>
                    <p className="text-muted mb-0 small">Manage campaign artwork, article and fatwa previews, team portraits, branding assets, and homepage images in one place.</p>
                </div>
                <div className="d-flex gap-3 mt-3 mt-md-0">
                    <div className="input-group" style={{ width: '250px' }}>
                        <span className="input-group-text bg-light border-end-0"><i className="fa-solid fa-search text-muted"></i></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 ps-0" 
                            placeholder="Search images..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewSelected && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title">Confirm Image Upload</h5>
                                <button type="button" className="btn-close" onClick={() => setPreviewSelected(null)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <h6 className="mb-3 text-muted">Updating: <strong>{previewSelected.label}</strong></h6>
                                <div className="row g-4">
                                    <div className="col-6">
                                        <p className="small mb-1 fw-bold text-muted">Current Image</p>
                                        <div className="border rounded d-flex align-items-center justify-content-center bg-light" style={{ height: '200px' }}>
                                            {previewSelected.current_url ? 
                                                <img src={previewSelected.current_url} alt="Current" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/> : 
                                                <span className="text-muted">None</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <p className="small mb-1 fw-bold text-primary">New Upload Preview</p>
                                        <div className="border border-primary rounded d-flex align-items-center justify-content-center bg-light" style={{ height: '200px' }}>
                                            <img src={previewSelected.previewUrl} alt="New" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 small text-muted">
                                    File: {previewSelected.file.name} ({(previewSelected.file.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                            </div>
                            <div className="modal-footer pb-3">
                                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setPreviewSelected(null)}>Cancel</button>
                                <button type="button" className="btn btn-primary px-4 fw-bold" onClick={confirmUpload}>
                                    <i className="fa-solid fa-cloud-arrow-up me-2"></i> Confirm & Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Modal */}
            {fullscreenImage && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1060 }} onClick={() => setFullscreenImage(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="modal-content bg-transparent border-0">
                            <div className="modal-body text-center position-relative p-0">
                                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setFullscreenImage(null)} style={{ zIndex: 2 }}></button>
                                <img src={fullscreenImage} alt="Fullscreen Preview" className="img-fluid rounded shadow" style={{ maxHeight: '85vh' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <ul className="nav nav-pills mb-4 gap-2 flex-wrap" style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                {sections.map(sec => (
                    <li className="nav-item" key={sec}>
                        <button 
                            className={`nav-link text-dark ${activeTab === sec ? 'active text-white fw-bold shadow-sm' : 'bg-white border'}`}
                            onClick={() => setActiveTab(sec)}
                            style={{ borderRadius: '20px', padding: '6px 16px' }}
                        >
                            {sec}
                            <span className={`badge rounded-pill ms-2 ${activeTab === sec ? 'bg-light text-dark' : 'bg-secondary'}`}>
                                {sec === 'All' ? compiledItems.length : compiledItems.filter(i => i.section === sec).length}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="row g-4">
                {filteredItems.length === 0 ? (
                    <div className="col-12 text-center py-5 bg-white rounded shadow-sm">
                        <i className="fa-regular fa-image" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                        <h5 className="mt-3 text-muted">No images found.</h5>
                        <p className="text-muted small">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const hasImage = !!item.current_url;
                        const isUploading = uploadingId === item.uniqueId;
                        
                        return (
                            <div className="col-sm-6 col-md-4 col-xl-3" key={item.uniqueId}>
                                <div 
                                    className={`card h-100 shadow-sm border-0 ${isUploading ? 'opacity-75' : ''}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, item)}
                                >
                                    <div className="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-start">
                                        <span className="badge bg-light text-secondary border">{item.section}</span>
                                        {hasImage ? (
                                            <span className="badge bg-success-subtle text-success"><i className="fa-solid fa-check-circle me-1"></i>Set</span>
                                        ) : (
                                            <span className="badge bg-danger-subtle text-danger"><i className="fa-solid fa-times-circle me-1"></i>Missing</span>
                                        )}
                                    </div>
                                    
                                    <div className="card-body d-flex flex-column text-center">
                                        <h6 className="card-title text-truncate fw-bold mb-1" title={item.label}>{item.label}</h6>
                                        {item.description && <p className="small text-muted mb-2 text-truncate" title={item.description}>{item.description}</p>}
                                        
                                        <div 
                                            className="position-relative mt-2 mb-3 bg-light rounded shadow-sm overflow-hidden" 
                                            style={{ height: '160px', cursor: hasImage ? 'pointer' : 'default', border: '2px dashed #dee2e6' }}
                                            onClick={() => hasImage && !isUploading && setFullscreenImage(item.current_url)}
                                            title={hasImage ? "Click to view fullscreen" : "Drag and drop an image here"}
                                        >
                                            {isUploading ? (
                                                <div className="h-100 w-100 d-flex flex-column align-items-center justify-content-center bg-light">
                                                    <div className="spinner-border text-primary mb-2" role="status"></div>
                                                    <span className="small text-muted fw-bold">Uploading...</span>
                                                </div>
                                            ) : hasImage ? (
                                                <>
                                                    <img src={item.current_url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <div className="position-absolute top-0 end-0 p-1">
                                                        <button 
                                                            className="btn btn-sm btn-light shadow-sm rounded-circle opacity-75 hover-opacity-100" 
                                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(item.current_url); }}
                                                            title="Copy URL"
                                                        >
                                                            <i className="fa-regular fa-copy"></i>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-100 w-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                                    <i className="fa-regular fa-image fs-1 mb-2 opacity-50"></i>
                                                    <span className="small fw-semibold">No Image</span>
                                                    <span className="small" style={{ fontSize: '0.7rem' }}>Drag & drop</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            {item.recommended_size && (
                                                <div className="small text-muted mb-2">
                                                    <i className="fa-solid fa-compress me-1"></i> 
                                                    Rec. Size: <span className="fw-semibold">{item.recommended_size}</span>
                                                </div>
                                            )}
                                            
                                            <div className="d-flex gap-2">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="d-none" 
                                                    id={`upload-${item.uniqueId}`} 
                                                    onChange={(e) => handleFileSelect(e, item)}
                                                    disabled={isUploading}
                                                />
                                                <label htmlFor={`upload-${item.uniqueId}`} className={`btn btn-sm btn-primary flex-grow-1 ${isUploading ? 'disabled' : ''}`}>
                                                    <i className="fa-solid fa-upload me-1"></i> Replace
                                                </label>
                                                {hasImage && (
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger px-3" 
                                                        onClick={() => removeImage(item)}
                                                        disabled={isUploading}
                                                        title="Remove Image"
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
