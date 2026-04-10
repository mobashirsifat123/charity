"use client";
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import HeaderOne from '@/components/HeaderOne';
import FooterOne from '@/components/FooterOne';
import BreadcrumbOne from '@/components/BreadcrumbOne';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [nextPath, setNextPath] = useState('/dashboard');
    const { t } = useLanguage();
    const { settings } = useSiteSettings();
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        setNextPath(params.get('next') || '/dashboard');
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccessMessage('');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Ensure email is provided
        if (!formData.email) {
            setError(t('resetNeedsEmail', 'Please enter your email address in the Email field to reset your password.'));
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Using supabase to send the reset email
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;
            
            setSuccessMessage(t('resetEmailSent', 'Password reset email sent! Please check your inbox.'));
        } catch (err) {
            console.error("Reset Password Error:", err);
            setError(err.message || t('resetFailed', 'Failed to send password reset email'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                },
            });

            if (oauthError) {
                throw oauthError;
            }
        } catch (err) {
            setError(err.message || t('googleLoginFailed', 'Unable to start Google sign in.'));
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        // Explicit error bounds on signInWithPassword
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                throw authError;
            }

            if (data?.session) {
                router.push(nextPath);
            }
        } catch (err) {
            setError(err.message || t('loginFailed', 'An error occurred during login'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="page-wrapper">
            <HeaderOne />
            <BreadcrumbOne
                title={t('login', 'Login')}
                links={[
                    { name: t('home', 'Home'), link: "/" },
                    { name: t('login', 'Login'), link: "/login" }
                ]}
            />

            <div className="container py-5 auth-shell">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-8">
                        <div className="card shadow-lg border-0 rounded-4 auth-card">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    {settings.site_logo_url ? (
                                        <div className="site-brand site-brand--auth mb-3 justify-content-center">
                                            <Image
                                                src={settings.site_logo_url}
                                                alt="IRWAA"
                                                className="site-logo site-logo--auth"
                                                width={220}
                                                height={88}
                                            />
                                            <span className="site-brand__wordmark">IRWAA</span>
                                        </div>
                                    ) : null}
                                    <h2 className="fw-bold text-primary mb-2">{t('welcomeBack', 'Welcome Back')}</h2>
                                    <p className="text-muted">{t('signInIntro', 'Sign in to continue to your account')}</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <i className="fa-solid fa-circle-exclamation me-2"></i>
                                        {error}
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setError('')}
                                        ></button>
                                    </div>
                                )}
                                
                                {successMessage && (
                                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                                        <i className="fa-solid fa-check-circle me-2"></i>
                                        {successMessage}
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setSuccessMessage('')}
                                        ></button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-light btn-ripple w-100 auth-provider-btn fw-semibold border mb-4"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <i className="fa-brands fa-google me-2"></i>
                                    {t('continueWithGoogle', 'Continue with Google')}
                                </button>

                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="flex-grow-1" style={{ height: '1px', background: 'var(--border-color)' }}></div>
                                    <span className="text-muted small">{t('orUseEmail', 'or use email')}</span>
                                    <div className="flex-grow-1" style={{ height: '1px', background: 'var(--border-color)' }}></div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label fw-semibold">
                                            {t('emailAddress', 'Email Address')}
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fa-solid fa-envelope text-muted"></i>
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control border-start-0 ps-0"
                                                id="email"
                                                name="email"
                                                placeholder={t('enterYourEmail', 'Enter your email')}
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label htmlFor="password" className="form-label fw-semibold mb-0">
                                                {t('password', 'Password')}
                                            </label>
                                            <button
                                                type="button"
                                                className="btn btn-link text-decoration-none small text-primary p-0"
                                                onClick={handleResetPassword}
                                            >
                                                {t('forgotPassword', 'Forgot Password?')}
                                            </button>
                                        </div>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fa-solid fa-lock text-muted"></i>
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control border-start-0 ps-0"
                                                id="password"
                                                name="password"
                                                placeholder={t('enterYourPassword', 'Enter your password')}
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-light border-start-0"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                            >
                                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 auth-submit-btn fw-semibold"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    {t('processing', 'Processing...')}
                                                </>
                                            ) : (
                                                <>
                                                    {t('signIn', 'Sign In')} <i className="fa-solid fa-arrow-right ms-2"></i>
                                                </>
                                            )}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="text-muted mb-0">
                                        {t('doNotHaveAccount', "Don't have an account?")}{' '}
                                        <Link href="/register" className="text-primary fw-semibold text-decoration-none">
                                            {t('createAccountInstead', 'Create Account')}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterOne />
        </section>
    );
}
