import Link from 'next/link';

const causes = [
    { title: 'Clean Water for All', category: 'Environment', raised: 18500, goal: 25000, donors: 312, color: '#4e9af1' },
    { title: 'Education for Girls', category: 'Education', raised: 42000, goal: 50000, donors: 890, color: '#9c59d1' },
    { title: 'Emergency Medical Aid', category: 'Medical', raised: 9800, goal: 15000, donors: 204, color: '#e05c5c' },
    { title: 'Community Food Bank', category: 'Community', raised: 31000, goal: 40000, donors: 673, color: '#f0a500' },
];

const CauseSliderTwo = () => {
    return (
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f4fd 100%)' }}>
            <div className="container py-4">
                <div className="text-center mb-5" data-aos="fade-up">
                    <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill mb-3 fw-semibold">
                        Featured Causes
                    </span>
                    <h2 className="fw-bold">Causes That Need <span className="text-success">Your Help</span></h2>
                    <p className="text-muted">Every campaign is making a real difference — be a part of it.</p>
                </div>

                <div className="row g-4">
                    {causes.map((cause, i) => {
                        const progress = Math.round((cause.raised / cause.goal) * 100);
                        return (
                            <div key={cause.title} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={i * 80}>
                                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
                                    style={{ transition: 'transform 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ height: 8, background: cause.color }} />
                                    <div className="card-body p-4">
                                        <span className="badge rounded-pill mb-3 px-3 py-2 small"
                                            style={{ background: cause.color + '15', color: cause.color }}>
                                            {cause.category}
                                        </span>
                                        <h6 className="fw-bold mb-3">{cause.title}</h6>
                                        <div className="mb-2">
                                            <div className="progress rounded-pill" style={{ height: 8, background: '#e9ecef' }}>
                                                <div className="progress-bar rounded-pill" role="progressbar"
                                                    style={{ width: `${progress}%`, background: cause.color }} />
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between small text-muted mb-3">
                                            <span><strong style={{ color: cause.color }}>${cause.raised.toLocaleString()}</strong> raised</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <small className="text-muted"><i className="fa-solid fa-users me-1" />{cause.donors} donors</small>
                                            <Link href="/#campaigns" className="btn btn-sm rounded-pill px-3 fw-semibold text-white"
                                                style={{ background: cause.color }}>
                                                Donate
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-5" data-aos="fade-up">
                    <Link href="/#campaigns" className="btn btn-success btn-lg rounded-pill px-5">
                        View All Causes <i className="fa-solid fa-arrow-right ms-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CauseSliderTwo;
