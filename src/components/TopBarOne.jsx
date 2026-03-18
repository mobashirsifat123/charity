import Link from 'next/link';

const TopBarOne = () => {
    return (
        <div className="top-bar bg-primary text-white py-2 d-none d-lg-block" style={{ fontSize: '0.85rem' }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <div className="d-flex gap-4">
                            <span><i className="fa-solid fa-envelope me-2 opacity-75" />info@irwa.org</span>
                            <span><i className="fa-solid fa-phone me-2 opacity-75" />(+01)-793-7938</span>
                        </div>
                    </div>
                    <div className="col-md-6 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-3">
                            <Link href="/about-us" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-opacity">About</Link>
                            <span className="opacity-25">|</span>
                            <Link href="/faq" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-opacity">FAQ</Link>
                            <span className="opacity-25">|</span>
                            <Link href="/contact-us" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-opacity">Contact</Link>
                            <div className="d-flex gap-2 ms-4 border-start border-light border-opacity-25 ps-4">
                                <Link href="#" className="text-white opacity-75 hover-opacity-100"><i className="fa-brands fa-facebook-f" /></Link>
                                <Link href="#" className="text-white opacity-75 hover-opacity-100"><i className="fa-brands fa-twitter" /></Link>
                                <Link href="#" className="text-white opacity-75 hover-opacity-100"><i className="fa-brands fa-linkedin-in" /></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBarOne;
