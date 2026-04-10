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

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [nextPath, setNextPath] = useState('/dashboard');
    const { t } = useLanguage();
    const { settings } = useSiteSettings();
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
        setNextPath(params.get('next') || '/dashboard');
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error on input change
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError(t('passwordsDoNotMatch', 'Passwords do not match'));
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError(t('passwordTooShort', 'Password must be at least 6 characters'));
            return;
        }

        setLoading(true);

        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                    data: {
                        full_name: formData.name,
                        name: formData.name,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message || t('registrationFailed', 'Registration failed'));
                return;
            }

            if (data?.session) {
                router.push(nextPath);
            } else {
                // Supabase might require email confirmation
                setSuccessMessage(t('registrationSuccessCheckEmail', 'Registration successful! Please check your email to confirm your account.'));
            }
        } catch (err) {
            setError(err.message || t('registrationFailed', 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
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
            setError(err.message || t('googleSignupFailed', 'Unable to start Google sign up.'));
            setLoading(false);
        }
    };

    return (
        <section className="page-wrapper">
            <HeaderOne />
            <BreadcrumbOne
                title={t('createAccount', 'Create Account')}
                links={[
                    { name: t('home', 'Home'), link: "/" },
                    { name: t('register', 'Register'), link: "/register" }
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
                                    <h2 className="fw-bold text-primary mb-2">{t('joinOurCommunity', 'Join Our Community')}</h2>
                                    <p className="text-muted">{t('createAccountIntro', 'Create an account to start making a difference')}</p>
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
                                        <i className="fa-solid fa-circle-check me-2"></i>
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
                                    onClick={handleGoogleRegister}
                                    disabled={loading}
                                >
                                    <i className="fa-brands fa-google me-2"></i>
                                    {t('continueWithGoogle', 'Continue with Google')}
                                </button>

                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="flex-grow-1" style={{ height: '1px', background: 'var(--border-color)' }}></div>
                                    <span className="text-muted small">{t('orCreateWithEmail', 'or create with email')}</span>
                                    <div className="flex-grow-1" style={{ height: '1px', background: 'var(--border-color)' }}></div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label fw-semibold">
                                            {t('fullName', 'Full Name')}
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fa-solid fa-user text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                id="name"
                                                name="name"
                                                placeholder={t('enterYourFullName', 'Enter your full name')}
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
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

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label fw-semibold">
                                            {t('password', 'Password')}
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fa-solid fa-lock text-muted"></i>
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control border-start-0 ps-0"
                                                id="password"
                                                name="password"
                                                placeholder={t('createYourPassword', 'Create a password')}
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-light border-start-0"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                            >
                                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                            </button>
                                        </div>
                                        <small className="text-muted">{t('minimumSixCharacters', 'Minimum 6 characters')}</small>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="form-label fw-semibold">
                                            {t('confirmPassword', 'Confirm Password')}
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fa-solid fa-lock text-muted"></i>
                                            </span>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="form-control border-start-0 ps-0"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder={t('confirmYourPassword', 'Confirm your password')}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-light border-start-0"
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            >
                                                <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
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
                                                    {t('creatingAccount', 'Creating Account...')}
                                                </>
                                            ) : (
                                                <>
                                                {t('createAccount', 'Create Account')} <i className="fa-solid fa-arrow-right ms-2"></i>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="text-muted mb-0">
                                        {t('alreadyHaveAccount', 'Already have an account?')}{' '}
                                        <Link href="/login" className="text-primary fw-semibold text-decoration-none">
                                            {t('signInInstead', 'Sign in')}
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
