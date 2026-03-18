"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import AdminGuard from '@/components/AdminGuard';

function SiteSettingsContent() {
    const [settings, setSettings] = useState({
        site_name: '',
        contact_email: '',
        contact_phone: '',
        hero_title: '',
        hero_subtitle: '',
        about_title: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;
            
            if (data && data.length > 0) {
                const settingsObj = {};
                data.forEach(item => {
                    // Try parsing JSONB or use plain string if parsing fails
                    try {
                         settingsObj[item.setting_key] = JSON.parse(item.setting_value);
                    } catch(e) {
                         settingsObj[item.setting_key] = item.setting_value.replace(/^"|"$/g, '');
                    }
                });
                // Merge with default state structure
                setSettings(prev => ({ ...prev, ...settingsObj }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'danger', text: 'Ensure you have run the create_site_settings.sql script in Supabase! Error: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setSaving(true);
        
        try {
            const updates = Object.entries(settings).map(([key, value]) => ({
                setting_key: key,
                setting_value: JSON.stringify(value),
                updated_at: new Date()
            }));

            // Upsert all settings
            const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'setting_key' });
            if (error) throw error;
            
            setMessage({ type: 'success', text: 'Site settings updated successfully!' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'danger', text: error.message || 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="page-wrapper bg-light min-vh-100">
            <HeaderOne />
            <BreadcrumbOne
                title="Site Settings"
                links={[
                    { name: "Admin Dashboard", link: "/admin/dashboard" },
                    { name: "Settings", link: "/admin/settings" }
                ]}
            />

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white border-bottom p-4">
                                <h4 className="mb-0 fw-bold">
                                    <i className="fa-solid fa-gear text-primary me-2"></i>
                                    Global Site Configuration
                                </h4>
                                <p className="text-muted mb-0 mt-1">Update the text and configuration visible across the public website.</p>
                            </div>
                            
                            <div className="card-body p-4 p-md-5">
                                {message.text && (
                                    <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                                        {message.text}
                                        <button type="button" className="btn-close" onClick={() => setMessage({type: '', text: ''})}></button>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2 text-muted">Loading configuration from Supabase...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        
                                        <h5 className="mb-3 text-primary border-bottom pb-2">Branding</h5>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold">Site Name (Logo Text)</label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg bg-light border-0" 
                                                name="site_name"
                                                value={settings.site_name}
                                                onChange={handleChange}
                                                placeholder="e.g. IRWA"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold">Site Logo Image URL (Optional)</label>
                                            <input 
                                                type="url" 
                                                className="form-control form-control-lg bg-light border-0" 
                                                name="site_logo_url"
                                                value={settings.site_logo_url || ''}
                                                onChange={handleChange}
                                                placeholder="https://example.com/logo.png"
                                            />
                                            <small className="text-muted mt-1 d-block">If provided, this image will replace the text-based Site Name logo across the platform.</small>
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Hero / Banner Section</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Hero Subtitle</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="hero_subtitle"
                                                    value={settings.hero_subtitle}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Fundraising"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Hero Title</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="hero_title"
                                                    value={settings.hero_title}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Help the Poor..."
                                                />
                                            </div>
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Contact Information</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Contact Email</label>
                                                <input 
                                                    type="email" 
                                                    className="form-control bg-light border-0" 
                                                    name="contact_email"
                                                    value={settings.contact_email}
                                                    onChange={handleChange}
                                                    placeholder="info@irwa.org"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Contact Phone Options</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="contact_phone"
                                                    value={settings.contact_phone}
                                                    onChange={handleChange}
                                                    placeholder="(+01)-793-7938"
                                                />
                                            </div>
                                        </div>
                                        
                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">About Us Section</h5>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold">About Section Main Title</label>
                                            <input 
                                                type="text" 
                                                className="form-control bg-light border-0" 
                                                name="about_title"
                                                value={settings.about_title || ''}
                                                onChange={handleChange}
                                                placeholder="We Are In A Mission..."
                                            />
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Call To Action (CTA) Section</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label fw-bold">CTA Title</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="cta_title"
                                                    value={settings.cta_title || ''}
                                                    onChange={handleChange}
                                                    placeholder="Ready to Make a Difference?"
                                                />
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label fw-bold">CTA Subtitle</label>
                                                <textarea 
                                                    className="form-control bg-light border-0" 
                                                    name="cta_subtitle"
                                                    rows="2"
                                                    value={settings.cta_subtitle || ''}
                                                    onChange={handleChange}
                                                    placeholder="Join thousands of donors..."
                                                ></textarea>
                                            </div>
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Team Section</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Team Title</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="team_title"
                                                    value={settings.team_title || ''}
                                                    onChange={handleChange}
                                                    placeholder="Meet the Changemakers"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Team Subtitle</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="team_subtitle"
                                                    value={settings.team_subtitle || ''}
                                                    onChange={handleChange}
                                                    placeholder="Dedicated professionals..."
                                                />
                                            </div>
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Community Section</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label fw-bold">Community Title</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="community_title"
                                                    value={settings.community_title || ''}
                                                    onChange={handleChange}
                                                    placeholder="Together We Can Change the World"
                                                />
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label fw-bold">Community Subtitle</label>
                                                <textarea 
                                                    className="form-control bg-light border-0" 
                                                    name="community_subtitle"
                                                    rows="2"
                                                    value={settings.community_subtitle || ''}
                                                    onChange={handleChange}
                                                    placeholder="Our global community of donors..."
                                                ></textarea>
                                            </div>
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Blog Section</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Blog Title</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="blog_title"
                                                    value={settings.blog_title || ''}
                                                    onChange={handleChange}
                                                    placeholder="From Our Blog"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Blog Subtitle</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control bg-light border-0" 
                                                    name="blog_subtitle"
                                                    value={settings.blog_subtitle || ''}
                                                    onChange={handleChange}
                                                    placeholder="Stay updated with stories..."
                                                />
                                            </div>
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Global Images & Backgrounds</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Hero Background Image URL</label>
                                                <input 
                                                    type="url" 
                                                    className="form-control bg-light border-0" 
                                                    name="hero_bg_image"
                                                    value={settings.hero_bg_image || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/hero-bg.jpg"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Cause Section Background URL</label>
                                                <input 
                                                    type="url" 
                                                    className="form-control bg-light border-0" 
                                                    name="cause_bg_image"
                                                    value={settings.cause_bg_image || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/cause-bg.jpg"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Community Section Background URL</label>
                                                <input 
                                                    type="url" 
                                                    className="form-control bg-light border-0" 
                                                    name="community_bg_image"
                                                    value={settings.community_bg_image || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/community-bg.jpg"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Testimonial Default Avatar URL</label>
                                                <input 
                                                    type="url" 
                                                    className="form-control bg-light border-0" 
                                                    name="testimonial_avatar_url"
                                                    value={settings.testimonial_avatar_url || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/avatar.jpg"
                                                />
                                            </div>
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Partner Logos (Text/Image)</h5>
                                        <div className="row mb-4">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <div className="col-md-4 mb-3" key={`partner_${num}`}>
                                                    <label className="form-label fw-bold">Partner {num} Name/Logo URL</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control bg-light border-0" 
                                                        name={`partner_logo_${num}`}
                                                        value={settings[`partner_logo_${num}`] || ''}
                                                        onChange={handleChange}
                                                        placeholder={`Partner ${num}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <h5 className="mb-3 mt-5 text-primary border-bottom pb-2">Footer & Socials</h5>
                                        <div className="row mb-4">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label fw-bold">Footer Description</label>
                                                <textarea 
                                                    className="form-control bg-light border-0" 
                                                    name="footer_description"
                                                    rows="2"
                                                    value={settings.footer_description || ''}
                                                    onChange={handleChange}
                                                    placeholder="Connecting donors with..."
                                                ></textarea>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label fw-bold"><i className="fa-brands fa-facebook me-2 text-primary"></i>Facebook URL</label>
                                                <input 
                                                    type="url" 
                                                    className="form-control bg-light border-0" 
                                                    name="social_facebook"
                                                    value={settings.social_facebook || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://facebook.com/..."
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label fw-bold"><i className="fa-brands fa-twitter me-2 text-info"></i>Twitter / X URL</label>
                                                <input 
                                                    type="url" 
                                                    className="form-control bg-light border-0" 
                                                    name="social_twitter"
                                                    value={settings.social_twitter || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://x.com/..."
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label fw-bold"><i className="fa-brands fa-instagram me-2 text-danger"></i>Instagram URL</label>
                                                <input 
                                                    type="url" 
                                                    className="form-control bg-light border-0" 
                                                    name="social_instagram"
                                                    value={settings.social_instagram || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://instagram.com/..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-5 d-flex gap-3">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-lg px-5"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                                ) : (
                                                    <><i className="fa-solid fa-save me-2"></i> Save Changes</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <FooterOne />
        </section>
    );
}

export default function SiteSettingsPage() {
    return (
        <AdminGuard>
            <SiteSettingsContent />
        </AdminGuard>
    );
}
