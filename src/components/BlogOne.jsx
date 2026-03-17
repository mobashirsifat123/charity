import Link from 'next/link';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const BlogOne = () => {
    const { settings } = useSiteSettings();
    const posts = [
        {
            id: 1,
            title: 'How Your Donations Are Changing Lives',
            excerpt: 'Discover the real-world impact of charitable giving and how every dollar reaches those who need it most.',
            date: 'March 10, 2026',
            category: 'Impact Stories',
            icon: 'fa-heart',
            color: '#e05c5c',
        },
        {
            id: 2,
            title: '5 Ways to Maximize Your Charitable Impact',
            excerpt: 'Smart giving strategies that help you make the biggest difference with your donations.',
            date: 'March 5, 2026',
            category: 'Tips & Guides',
            icon: 'fa-lightbulb',
            color: '#f0a500',
        },
        {
            id: 3,
            title: 'Community Spotlight: Education Fund Success',
            excerpt: 'How a small community campaign raised enough to build a new school library in rural areas.',
            date: 'February 28, 2026',
            category: 'Success Stories',
            icon: 'fa-graduation-cap',
            color: '#4e9af1',
        },
    ];

    return (
        <section className="py-5" style={{ background: '#f8f9fa' }}>
            <div className="container py-4">
                <div className="text-center mb-5" data-aos="fade-up">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-semibold">
                        Latest News
                    </span>
                    <h2 className="fw-bold">{settings.blog_title || 'From Our Blog'}</h2>
                    <p className="text-muted">{settings.blog_subtitle || 'Stay updated with stories, tips, and insights from the ChariFund community.'}</p>
                </div>

                <div className="row g-4">
                    {posts.map((post, i) => (
                        <div key={post.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={i * 100}>
                            <div className="card border-0 shadow-sm rounded-4 h-100" style={{ transition: 'transform 0.3s, box-shadow 0.3s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48, background: post.color + '15', flexShrink: 0 }}>
                                            <i className={`fa-solid ${post.icon}`} style={{ color: post.color }} />
                                        </div>
                                        <span className="badge rounded-pill px-3 py-2" style={{ background: post.color + '15', color: post.color }}>
                                            {post.category}
                                        </span>
                                    </div>
                                    <h5 className="fw-bold mb-3">{post.title}</h5>
                                    <p className="text-muted small mb-4">{post.excerpt}</p>
                                    <div className="d-flex align-items-center justify-content-between mt-auto">
                                        <small className="text-muted"><i className="fa-regular fa-calendar me-1" />{post.date}</small>
                                        <Link href="/blog-grid" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-5" data-aos="fade-up">
                    <Link href="/blog-grid" className="btn btn-primary btn-lg rounded-pill px-5">
                        View All Posts <i className="fa-solid fa-arrow-right ms-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BlogOne;
