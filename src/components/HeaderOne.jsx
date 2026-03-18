"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const HeaderOne = () => {
  let pathname = usePathname();
  const router = useRouter();
  let [search, setSearch] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scroll, setScroll] = useState(false);
  const { user, logout, loading } = useAuth();
  const { settings } = useSiteSettings();
  const isArticleRoute = pathname === "/blog-grid" || pathname.startsWith("/blog-details/");
  const isFatwaRoute = pathname === "/fatwa" || pathname.startsWith("/fatwa/");
  const isCauseRoute = pathname === "/" || pathname.startsWith("/cause-details/");
  const isAccountRoute =
    ["/login", "/register", "/dashboard"].includes(pathname) ||
    pathname.startsWith("/admin");
  const handleSearch = () => {
    setSearch(!search);
  };
  const handleMobileMenu = () => {
    setMobileMenu(!mobileMenu);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    setSearch(false);
    if (!query) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    window.onscroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false);
      } else if (window.pageYOffset > 150) {
        setScroll(true);
      }
      return () => (window.onscroll = null);
    };
  }, []);

  const mobileMenuListRef = useRef(null);

  useEffect(() => {
    const desktopMenu = document.querySelector(".navbar__menu");

    if (desktopMenu && mobileMenuListRef.current) {
      mobileMenuListRef.current.innerHTML = desktopMenu.innerHTML;

      const setupDropdownToggles = (container) => {
        const dropdownLabels = container.querySelectorAll(
          ".navbar__dropdown-label"
        );

        dropdownLabels.forEach((label) => {
          label.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const subMenu = this.nextElementSibling;

            // ✅ Only close siblings within the same level (UL)
            const siblingLabels = Array.from(
              this.closest("ul")?.querySelectorAll(
                ":scope > li > .navbar__dropdown-label"
              ) || []
            );

            siblingLabels.forEach((sibling) => {
              const siblingSubMenu = sibling.nextElementSibling;

              if (
                sibling !== this &&
                siblingSubMenu &&
                siblingSubMenu.classList.contains("navbar__sub-menu")
              ) {
                siblingSubMenu.style.maxHeight = "0px";
                siblingSubMenu.classList.remove("show");
                sibling.classList.remove("navbar__item-active");
              }
            });

            // Toggle current submenu with smooth animation
            if (subMenu && subMenu.classList.contains("navbar__sub-menu")) {
              const isOpen = subMenu.classList.contains("show");

              if (isOpen) {
                subMenu.style.maxHeight = "0px";
                subMenu.classList.remove("show");
                this.classList.remove("navbar__item-active");
              } else {
                subMenu.classList.add("show");
                subMenu.style.maxHeight = subMenu.scrollHeight + "px";
                this.classList.add("navbar__item-active");
              }
            }
          });
        });
      };

      setupDropdownToggles(mobileMenuListRef.current);
    }
  }, [user, loading, pathname]);

  return (
    <>
      <header
        className={`header header-secondary ${scroll && "sticky-header"}`}
      >
        <div className='container'>
          <div className='row'>
            <div className='col-12'>
              <div className='main-header__menu-box'>
                <nav className='navbar p-0'>
                  <div className='navbar-logo'>
                    <Link href='/' className='text-decoration-none'>
                      {settings.site_logo_url ? (
                        <img src={settings.site_logo_url} alt={settings.site_name || 'Site Logo'} style={{ maxHeight: '45px' }} />
                      ) : (
                        <h3 className='m-0 fw-bold' style={{ color: 'var(--primary-color)' }}>{settings.site_name || 'IRWA'}</h3>
                      )}
                    </Link>
                  </div>
                  <div className='navbar__menu-wrapper'>
                    <div className='navbar__menu d-none d-xl-block'>
                      <ul className='navbar__list'>
                        <li
                          className={`navbar__item nav-fade ${pathname === "/" ? "active" : ""
                            }`}
                        >
                          <Link href='/'>{settings.nav_home_label || 'Home'}</Link>
                        </li>
                        <li
                          className={`navbar__item nav-fade ${["/about-us"].includes(pathname) ? "active" : ""
                            }`}
                        >
                          <Link href='/about-us'>{settings.nav_about_label || 'About Us'}</Link>
                        </li>
                        <li
                          className={`navbar__item nav-fade ${isArticleRoute ? "active" : ""
                            }`}
                        >
                          <Link href='/blog-grid'>{settings.nav_articles_label || 'Articles'}</Link>
                        </li>
                        <li
                          className={`navbar__item nav-fade ${isFatwaRoute ? "active" : ""
                            }`}
                        >
                          <Link href='/fatwa'>{settings.nav_fatwas_label || 'Fatwas'}</Link>
                        </li>
                        <li
                          className={`navbar__item nav-fade ${pathname === "/search" ? "active" : ""
                            }`}
                        >
                          <Link href='/search'>{settings.nav_search_label || 'Search'}</Link>
                        </li>
                        <li
                          className={`navbar__item navbar__item--has-children nav-fade ${isCauseRoute ? "active" : ""
                            }`}
                        >
                          <Link
                            href='#'
                            aria-label='dropdown menu'
                            className='navbar__dropdown-label dropdown-label-alter'
                          >
                            {settings.nav_causes_label || 'Causes'}
                          </Link>
                          <ul className='navbar__sub-menu'>
                            <li
                              className={
                                pathname === "/"
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/#campaigns'>{settings.nav_causes_overview_label || 'Our Causes'}</Link>
                            </li>
                            <li
                              className={pathname.startsWith("/cause-details/") ? "active" : ""}
                            >
                              <Link href='/#campaigns'>{settings.nav_support_mission_label || 'Support the Mission'}</Link>
                            </li>
                          </ul>
                        </li>
                        <li
                          className={`navbar__item navbar__item--has-children nav-fade ${[
                            "/faq",
                            "/donation",
                            "/contact-us",
                          ].includes(pathname) || isAccountRoute
                            ? "active"
                            : ""
                            }`}
                        >
                          <Link
                            href='#'
                            aria-label='dropdown menu'
                            className='navbar__dropdown-label dropdown-label-alter'
                          >
                            {settings.nav_pages_label || 'Pages'}
                          </Link>
                          <ul className='navbar__sub-menu'>
                            <li
                              className={
                                ["/faq"].includes(pathname) ? "active" : ""
                              }
                            >
                              <Link href='/faq'>{settings.nav_faq_label || 'FAQ'}</Link>
                            </li>
                            <li
                              className={
                                ["/donation"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/donation'>{settings.nav_donate_label || 'Donate Us'}</Link>
                            </li>
                            <li
                              className={
                                ["/contact-us"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/contact-us'>
                                {settings.nav_contact_label || 'Contact Us'}
                              </Link>
                            </li>
                            <li>
                              <Link href='/request-fatwa'>{settings.nav_request_fatwa_label || 'Request Fatwa'}</Link>
                            </li>
                            {!loading && user ? (
                              <>
                                <li className={pathname === "/dashboard" ? "active" : ""}>
                                  <Link href='/dashboard'>{settings.nav_dashboard_label || 'My Dashboard'}</Link>
                                </li>
                                {user.role === 'admin' && (
                                  <li className={pathname.startsWith("/admin") ? "active" : ""}>
                                    <Link href='/admin/dashboard'>{settings.nav_admin_label || 'Admin Panel'}</Link>
                                  </li>
                                )}
                              </>
                            ) : !loading ? (
                              <>
                                <li className={pathname === "/login" ? "active" : ""}>
                                  <Link href='/login'>{settings.nav_login_label || 'Login'}</Link>
                                </li>
                                <li className={pathname === "/register" ? "active" : ""}>
                                  <Link href='/register'>{settings.nav_register_label || 'Register'}</Link>
                                </li>
                              </>
                            ) : null}
                          </ul>
                        </li>
                        <li
                          className={`navbar__item nav-fade ${["/contact-us"].includes(pathname) ? "active" : ""
                            } `}
                        >
                          <Link href='/contact-us'>Contact Us</Link>
                        </li>
                      </ul>
                    </div>
                    <div className='contact-btn'>
                      <div className='contact-icon'>
                        <i className='icon-support' />
                      </div>
                      <div className='contact-content'>
                        <p>Call Us Now</p>
                        <a href='tel:01-793-7938'>(+01)-793-7938 </a>
                      </div>
                    </div>
                  </div>
                  <div className='navbar__options'>
                    <div className='navbar__mobile-options '>
                      <div className='search-box'>
                        <button
                          onClick={handleSearch}
                          className='open-search'
                          aria-label='search products'
                          title='open search box'
                        >
                          <i className='fa-solid fa-magnifying-glass' />
                        </button>
                      </div>

                      {/* Auth Buttons */}
                      {!loading && (
                        <>
                          {user ? (
                            <div className='d-none d-md-flex align-items-center gap-3'>
                              <span className='text-dark fw-semibold'>
                                <i className='fa-solid fa-user me-2'></i>
                                Welcome, {user.name?.split(' ')[0]}
                              </span>
                              {user.role === 'admin' && (
                                <Link
                                  href='/admin/dashboard'
                                  className='btn--primary'
                                  style={{ padding: '10px 20px' }}
                                >
                                  <i className='fa-solid fa-shield-halved me-1' />
                                  Admin
                                </Link>
                              )}
                              <Link
                                href='/dashboard'
                                className='btn--secondary'
                                style={{ padding: '10px 20px' }}
                              >
                                <i className='fa-solid fa-chart-line me-1' />
                                Dashboard
                              </Link>
                              <button
                                onClick={logout}
                                className='btn--secondary'
                                style={{ padding: '10px 20px', cursor: 'pointer' }}
                              >
                                Logout <i className='fa-solid fa-sign-out-alt ms-1' />
                              </button>
                            </div>
                          ) : (
                            <div className='d-none d-md-flex align-items-center gap-2'>
                              <Link
                                href='/login'
                                className='btn--secondary'
                                style={{ padding: '10px 20px' }}
                              >
                                Login
                              </Link>
                              <Link
                                href='/register'
                                className='btn--primary'
                              >
                                Register <i className='fa-solid fa-arrow-right' />
                              </Link>
                            </div>
                          )}
                        </>
                      )}

                      <Link
                        href='/donation'
                        className='btn--primary d-none d-lg-none'
                      >
                        Donate Now <i className='fa-solid fa-arrow-right' />
                      </Link>
                    </div>
                    <button
                      onClick={handleMobileMenu}
                      className='open-offcanvas-nav d-flex d-xl-none'
                      aria-label='toggle mobile menu'
                      title='open offcanvas menu'
                    >
                      <span className='icon-bar top-bar' />
                      <span className='icon-bar middle-bar' />
                      <span className='icon-bar bottom-bar' />
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${search ? "search-active search-popup" : "search-popup"
            }`}
        >
          <button
            onClick={handleSearch}
            className='close-search'
            aria-label='close search box'
            title='close search box'
          >
            <i className='fa-solid fa-xmark' />
          </button>
          <form onSubmit={handleSearchSubmit}>
            <div className='search-popup__group'>
              <input
                type='text'
                name='search-field'
                id='searchField'
                placeholder='Search....'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required=''
              />
              <button
                type='submit'
                aria-label='search products'
                title='search products'
              >
                <i className='fa-solid fa-magnifying-glass' />
              </button>
            </div>
          </form>
        </div>
      </header>

      <div
        className={`mobile-menu mobile-menu--primary d-block d-xxl-none ${mobileMenu ? "show-menu" : ""
          }`}
      >
        <nav className='mobile-menu__wrapper'>
          <div className='mobile-menu__header nav-fade'>
            <div className='logo'>
              <Link href='/' className='text-decoration-none'>
                 <h4 className='m-0 fw-bold' style={{ color: 'var(--primary-color)' }}>{settings.site_name || 'IRWA'}</h4>
              </Link>
            </div>
            <button
              onClick={handleMobileMenu}
              aria-label='close mobile menu'
              className='close-mobile-menu'
            >
              <i className='fa-solid fa-xmark' />
            </button>
          </div>
          <div className='mobile-menu__list' ref={mobileMenuListRef}></div>

          <div className='mobile-menu__cta nav-fade d-block d-md-none'>
            {!loading && user ? (
              <div className='d-flex flex-column gap-2 mb-3'>
                <Link href='/dashboard' className='btn--secondary'>
                  Dashboard <i className='fa-solid fa-chart-line' />
                </Link>
                {user.role === 'admin' && (
                  <Link href='/admin/dashboard' className='btn--primary'>
                    Admin Panel <i className='fa-solid fa-shield-halved' />
                  </Link>
                )}
              </div>
            ) : !loading ? (
              <div className='d-flex flex-column gap-2 mb-3'>
                <Link href='/login' className='btn--secondary'>
                  Login
                </Link>
                <Link href='/register' className='btn--primary'>
                  Register <i className='fa-solid fa-arrow-right' />
                </Link>
              </div>
            ) : null}
            <Link href='/donation' className='btn--primary '>
              Donate Now <i className='fa-solid fa-arrow-right' />
            </Link>
          </div>
          <div className='mobile-menu__social social nav-fade'>
            <Link
              href='https://www.facebook.com/'
              target='_blank'
              aria-label='share us on facebook'
              title='facebook'
            >
              <i className='fa-brands fa-facebook-f' />
            </Link>
            <Link
              href='https://vimeo.com/'
              target='_blank'
              aria-label='share us on vimeo'
              title='vimeo'
            >
              <i className='fa-brands fa-vimeo-v' />
            </Link>
            <Link
              href='https://x.com/'
              target='_blank'
              aria-label='share us on twitter'
              title='twitter'
            >
              <i className='fa-brands fa-twitter' />
            </Link>
            <Link
              href='https://www.linkedin.com/'
              target='_blank'
              aria-label='share us on linkedin'
              title='linkedin'
            >
              <i className='fa-brands fa-linkedin-in' />
            </Link>
          </div>
        </nav>
      </div>

      <div
        className={`mobile-menu__backdrop ${mobileMenu ? "mobile-menu__backdrop-active" : ""
          }`}
        onClick={() => setMobileMenu(false)}
      ></div>
    </>
  );
};

export default HeaderOne;
