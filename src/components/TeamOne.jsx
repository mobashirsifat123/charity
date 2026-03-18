"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { supabase } from '@/lib/supabaseClient';

const TeamOne = () => {
    const { settings } = useSiteSettings();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTeam(data || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-5" style={{ background: '#fff' }}>
            <div className="container py-4">
                <div className="text-center mb-5" data-aos="fade-up">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-semibold">
                        {settings.team_badge || 'Our Team'}
                    </span>
                    <h2 className="fw-bold">{settings.team_title || 'Meet the Changemakers'}</h2>
                    <p className="text-muted">{settings.team_subtitle || 'Dedicated professionals working tirelessly behind the scenes to maximize impact.'}</p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : team.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted mb-0">No team members currently listed.</p>
                    </div>
                ) : (
                    <div className="row g-4 justify-content-center">
                        {team.map((member, i) => (
                            <div key={member.id} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={i * 100}>
                                <div className="card border-0 shadow-sm rounded-4 text-center overflow-hidden h-100"
                                    style={{ transition: 'transform 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ height: 250, backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
                                        {member.image_url ? (
                                            <img src={member.image_url} alt={member.name} className="w-100 h-100 object-fit-cover" 
                                                style={{ transition: 'transform 0.5s' }} />
                                        ) : (
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary">
                                                <i className="fa-solid fa-user fa-3x"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-body p-4 position-relative">
                                        <h5 className="fw-bold mb-1">{member.name}</h5>
                                        <p className="text-muted small mb-3">{member.role}</p>
                                        
                                        {(member.linkedin_url || member.twitter_url) && (
                                            <div className="d-flex justify-content-center gap-2">
                                                {member.linkedin_url && (
                                                    <Link href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light rounded-circle" style={{ width: 32, height: 32 }} title="LinkedIn">
                                                        <i className="fa-brands fa-linkedin-in text-primary" />
                                                    </Link>
                                                )}
                                                {member.twitter_url && (
                                                    <Link href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light rounded-circle" style={{ width: 32, height: 32 }} title="Twitter">
                                                        <i className="fa-brands fa-twitter text-info" />
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TeamOne;
