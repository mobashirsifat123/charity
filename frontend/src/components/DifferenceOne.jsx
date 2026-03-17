import Link from 'next/link';

const DifferenceOne = () => {
    return (
        <section className="py-5" style={{ background: '#fff' }}>
            <div className="container py-4">
                <div className="row align-items-center gy-5">
                    <div className="col-lg-6" data-aos="fade-right">
                        <div className="position-relative">
                            <div className="rounded-4 overflow-hidden" style={{ background: '#e9ecef', height: 400, width: '100%', position: 'relative' }}>
                                {/* Placeholder for an impactful image */}
                                <div className="absolute-center text-center w-100 h-100 d-flex flex-column align-items-center justify-content-center opacity-50">
                                    <i className="fa-solid fa-image mb-3" style={{ fontSize: '4rem', color: '#adb5bd' }} />
                                    <h5 className="text-secondary">Impact Image</h5>
                                </div>
                            </div>
                            {/* Floating stat card */}
                            <div className="position-absolute bg-white rounded-4 shadow p-4" 
                                style={{ bottom: -30, right: -20, width: 220, borderTop: '4px solid #4e9af1' }}>
                                <h3 className="fw-bold text-dark mb-1">15+</h3>
                                <p className="text-muted mb-0 small fw-semibold">Years of Global Impact</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-6 ps-lg-5" data-aos="fade-left">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-semibold">
                            Make A Difference
                        </span>
                        <h2 className="fw-bold mb-4">Every Act of Kindness<br />Creates a Ripple Effect</h2>
                        <p className="text-muted mb-4">
                            We believe that no contribution is too small. Together, our collective efforts are building schools,
                            providing clean water, and responding to medical emergencies across the globe.
                        </p>
                        
                        <ul className="list-unstyled mb-5">
                            {[
                                'Transparent donation tracking from start to finish',
                                'Direct partnership with local organizations',
                                'Tax-deductible contributions globally',
                            ].map((item, i) => (
                                <li key={i} className="mb-3 d-flex align-items-center">
                                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3" style={{ width: 32, height: 32 }}>
                                        <i className="fa-solid fa-check text-primary small" />
                                    </div>
                                    <span className="fw-medium text-dark">{item}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <Link href="/about-us" className="btn btn-primary btn-lg rounded-pill px-5">
                            Discover Our Story
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DifferenceOne;
