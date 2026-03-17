"use client";
import { useState, useEffect } from 'react';

const Preloader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hide preloader after a short delay or when window loads
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);

        if (typeof window !== 'undefined') {
            window.onload = () => {
                setLoading(false);
            };
        }

        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#fff',
                zIndex: 999999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'opacity 0.5s',
            }}
        >
            <div className="text-center">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mt-3 fw-bold text-primary tracking-wider" style={{ letterSpacing: 2 }}>CHARIFUND</h4>
            </div>
        </div>
    );
};

export default Preloader;
