"use client";

import { useEffect, useState } from 'react';
import { adminFetchJson } from '@/lib/adminApi';
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_SECTIONS, mergeSiteSettings } from '@/lib/siteSettings';

export default function SiteSettingsEditor({
  pageTitle = 'Site Builder',
  pageDescription = 'Manage the public-facing content, messages, and supporting details across the site.',
  sectionIds = null,
}) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const visibleSections = sectionIds
    ? SITE_SETTINGS_SECTIONS.filter((section) => sectionIds.includes(section.id))
    : SITE_SETTINGS_SECTIONS;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await adminFetchJson('/api/admin/content');
        setSettings(mergeSiteSettings(result.data || []));
      } catch (error) {
        console.error('Failed to load site settings:', error);
        setMessage({ type: 'danger', text: error.message || 'Failed to load site settings.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updates = Object.entries(settings).map(([setting_key, setting_value]) => ({
        setting_key,
        setting_value: JSON.stringify(setting_value ?? ''),
      }));

      await adminFetchJson('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      setMessage({ type: 'success', text: 'Site settings updated successfully.' });
    } catch (error) {
      console.error('Failed to save site settings:', error);
      setMessage({ type: 'danger', text: error.message || 'Failed to save site settings.' });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const value = settings[field.name] ?? '';
    const columnClass = field.type === 'textarea' ? 'col-12 mb-4' : 'col-md-6 mb-4';

    return (
      <div key={field.name} className={columnClass}>
        <label className="form-label fw-bold">{field.label}</label>
        {field.type === 'textarea' ? (
          <textarea
            className="form-control bg-light border-0"
            rows={field.rows || 3}
            value={value}
            onChange={(event) => handleChange(field.name, event.target.value)}
          />
        ) : (
          <input
            type={field.type || 'text'}
            className="form-control bg-light border-0"
            value={value}
            onChange={(event) => handleChange(field.name, event.target.value)}
          />
        )}
        {field.description ? <small className="text-muted d-block mt-2">{field.description}</small> : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-3 mb-0">Loading site settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">{pageTitle}</h2>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>
        <button type="submit" form="site-settings-form" className="btn btn-primary btn-lg px-4" disabled={saving}>
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk me-2"></i>
              Save Site Settings
            </>
          )}
        </button>
      </div>

      {message.text ? (
        <div className={`alert alert-${message.type} mb-4`} role="alert">
          {message.text}
        </div>
      ) : null}

      {visibleSections.length > 1 ? (
        <div className="d-flex flex-wrap gap-2 mb-4">
          {visibleSections.map((section) => (
            <a
              key={section.id}
              href={`#section-${section.id}`}
              className="btn btn-sm btn-outline-secondary rounded-pill"
            >
              {section.title}
            </a>
          ))}
        </div>
      ) : null}

      <form id="site-settings-form" onSubmit={handleSubmit}>
        {visibleSections.map((section) => (
          <div key={section.id} id={`section-${section.id}`} className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom p-4">
              <h4 className="mb-0 fw-bold">{section.title}</h4>
            </div>
            <div className="card-body p-4">
              <div className="row">
                {section.fields.map(renderField)}
              </div>
            </div>
          </div>
        ))}
      </form>
    </div>
  );
}
