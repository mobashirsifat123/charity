import Link from 'next/link';

/**
 * BreadcrumbOne component
 * @param {string} title - Page title shown in breadcrumb
 * @param {Array<{name: string, link: string}>} links - Breadcrumb navigation links
 */
const BreadcrumbOne = ({ title = 'Page', links = [] }) => {
    return (
        <section
            className="breadcrumb"
            style={{
                background: 'linear-gradient(135deg, #1a3c5e 0%, #2d6a9f 100%)',
                padding: '60px 0',
            }}
        >
            <div className="container">
                <div className="row justify-content-center text-center">
                    <div className="col-lg-8">
                        <h1 className="text-white fw-bold mb-3">{title}</h1>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb justify-content-center mb-0">
                                {links.length > 0 ? (
                                    links.map((link, index) => (
                                        <li
                                            key={index}
                                            className={`breadcrumb-item ${index === links.length - 1 ? 'active text-warning' : ''}`}
                                        >
                                            {index === links.length - 1 ? (
                                                link.name
                                            ) : (
                                                <Link href={link.link} className="text-white text-decoration-none opacity-75">
                                                    {link.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="breadcrumb-item active text-warning">{title}</li>
                                )}
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BreadcrumbOne;
