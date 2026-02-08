"use client";
import { useState, useRef } from 'react';
import api from '@/utils/api';

/**
 * ImageUploader - File upload component with preview
 * @param {string} value - Current image URL
 * @param {function} onChange - Callback when image is uploaded, receives URL
 * @param {string} placeholder - Placeholder text
 */
const ImageUploader = ({ value, onChange, placeholder = "Click or drag to upload image" }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(value || '');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select an image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setError('');
        setUploading(true);

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        try {
            // Create form data
            const formData = new FormData();
            formData.append('image', file);

            // Upload to server
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const imageUrl = response.data.data.url;
                setPreview(imageUrl);
                onChange(imageUrl);
            } else {
                setError(response.data.message || 'Upload failed');
                setPreview('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image');
            setPreview('');
        } finally {
            setUploading(false);
            // Revoke local preview URL
            URL.revokeObjectURL(localPreview);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && fileInputRef.current) {
            // Create a new file list with the dropped file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            handleFileSelect({ target: { files: dataTransfer.files } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleRemove = () => {
        setPreview('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFullImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Prepend backend URL for relative paths
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    return (
        <div className="image-uploader">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="d-none"
                id="image-upload"
            />

            {preview ? (
                <div className="position-relative">
                    <img
                        src={getFullImageUrl(preview)}
                        alt="Campaign preview"
                        className="img-fluid rounded-3 shadow-sm"
                        style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="btn btn-danger btn-sm rounded-circle shadow"
                            title="Remove image"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-50 rounded-bottom-3">
                        <small className="text-white">
                            <i className="fa-solid fa-check-circle me-1"></i>
                            Image uploaded
                        </small>
                    </div>
                </div>
            ) : (
                <label
                    htmlFor="image-upload"
                    className={`upload-zone d-flex flex-column align-items-center justify-content-center p-5 border border-2 border-dashed rounded-3 ${uploading ? 'border-primary' : 'border-secondary'}`}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {uploading ? (
                        <>
                            <div className="spinner-border text-primary mb-2" role="status">
                                <span className="visually-hidden">Uploading...</span>
                            </div>
                            <span className="text-muted">Uploading image...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-cloud-arrow-up text-primary mb-2" style={{ fontSize: '2.5rem' }}></i>
                            <span className="text-muted text-center">{placeholder}</span>
                            <small className="text-muted mt-1">JPEG, PNG, GIF, WebP (Max 5MB)</small>
                        </>
                    )}
                </label>
            )}

            {error && (
                <div className="alert alert-danger mt-2 py-2 small mb-0">
                    <i className="fa-solid fa-circle-exclamation me-1"></i>
                    {error}
                </div>
            )}

            <style jsx>{`
                .upload-zone:hover {
                    border-color: var(--bs-primary) !important;
                    background-color: rgba(var(--bs-primary-rgb), 0.05);
                }
            `}</style>
        </div>
    );
};

export default ImageUploader;
