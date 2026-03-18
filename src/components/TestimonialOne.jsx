import { useSiteSettings } from '@/context/SiteSettingsContext';

const TestimonialOne = () => {
    const { settings } = useSiteSettings();
    return (
        <section className="py-5" style={{ background: '#f8f9fa', position: 'relative', overflow: 'hidden' }}>
            <div className="container py-4">
                <div className="row justify-content-center text-center mb-5" data-aos="fade-up">
                    <div className="col-lg-6">
                        <i className="fa-solid fa-quote-right fs-1 text-primary opacity-25 mb-3" />
                        <h2 className="fw-bold mb-3">Words From Our <span className="text-primary">Donors</span></h2>
                        <p className="text-muted">Hear from the people who are making a real impact through our platform.</p>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white" data-aos="zoom-in">
                            <h4 className="fw-normal fst-italic text-dark mb-4" style={{ lineHeight: 1.6 }}>
                                "I was looking for a way to give back to education initiatives, and IRWA made the process incredibly transparent. Being able to see exactly where my money went and receiving updates from the campaign leaders is truly rewarding."
                            </h4>
                            <div className="d-flex align-items-center justify-content-center mt-4">
                                <img src={settings.testimonial_avatar_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"} 
                                    alt="Reviewer" className="rounded-circle object-fit-cover me-3 shadow-sm" style={{ width: 60, height: 60 }} />
                                <div className="text-start">
                                    <h6 className="fw-bold mb-0">Emily Thompson</h6>
                                    <small className="text-muted">Monthly Donor</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialOne;
