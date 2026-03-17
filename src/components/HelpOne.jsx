import Link from 'next/link';

const HelpOne = () => {
    return (
        <section className="py-5" style={{ background: '#fff' }}>
            <div className="container py-4">
                <div className="row justify-content-center text-center mb-5" data-aos="fade-up">
                    <div className="col-lg-7">
                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-3 fw-semibold">
                            Get Involved
                        </span>
                        <h2 className="fw-bold">How You Can <span className="text-warning">Help</span></h2>
                        <p className="text-muted">There are many ways to support our mission. Whether it's your time, voice, or resources — we need you.</p>
                    </div>
                </div>

                <div className="row g-4">
                    {[
                        { title: 'Make a Donation', desc: 'Provide financial support to fund our global initiatives and immediate relief efforts.', icon: 'fa-hand-holding-dollar', color: '#4e9af1', link: '/donation', btnText: 'Donate' },
                        { title: 'Become a Volunteer', desc: 'Join our team on the ground or help us remotely with your skills and expertise.', icon: 'fa-hands-holding-child', color: '#4caf7d', link: '/become-volunteer', btnText: 'Join Us' },
                        { title: 'Start a Fundraiser', desc: 'Create your own campaign and rally your friends and family for a cause you love.', icon: 'fa-bullhorn', color: '#f0a500', link: '/#campaigns', btnText: 'Start Now' },
                    ].map((item, i) => (
                        <div key={item.title} className="col-lg-4" data-aos="fade-up" data-aos-delay={i * 100}>
                            <div className="card text-center h-100 border-0 shadow-sm rounded-4 p-4"
                                style={{ transition: 'transform 0.3s, box-shadow 0.3s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                                <div className="card-body d-flex flex-column align-items-center">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                                        style={{ width: 72, height: 72, background: item.color + '15' }}>
                                        <i className={`fa-solid ${item.icon} fs-2`} style={{ color: item.color }} />
                                    </div>
                                    <h4 className="fw-bold mb-3">{item.title}</h4>
                                    <p className="text-muted mb-4">{item.desc}</p>
                                    <Link href={item.link} className="btn rounded-pill px-4 mt-auto fw-medium"
                                        style={{ background: item.color + '20', color: item.color }}>
                                        {item.btnText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HelpOne;
