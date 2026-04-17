"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { parseJsonArraySetting } from "@/lib/siteSettings";

const HeaderOne = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scroll, setScroll] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSiteSettings();
  const customNavLinks = parseJsonArraySetting(settings.nav_custom_links_json, []).filter(
    (item) => item && typeof item.href === "string" && typeof item.label === "string"
  );
  const isArticleRoute = pathname === "/blog-grid" || pathname.startsWith("/blog-details/");
  const isEbookRoute = pathname === "/ebooks" || pathname.startsWith("/ebooks/");
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
    const handleScroll = () => {
      const shouldStick = window.scrollY > 150;
      setScroll((previous) => (previous === shouldStick ? previous : shouldStick));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const mobileMenuListRef = useRef(null);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    if (!mobileMenu || !mobileMenuListRef.current) return;

    const desktopMenu = document.querySelector(".navbar__menu");
    const cleanupFns = [];

    if (desktopMenu && mobileMenuListRef.current) {
      mobileMenuListRef.current.innerHTML = desktopMenu.innerHTML;

      const setupDropdownToggles = (container) => {
        const dropdownLabels = container.querySelectorAll(
          ".navbar__dropdown-label"
        );

        dropdownLabels.forEach((label) => {
          const handleDropdownClick = function (e) {
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
          };

          label.addEventListener("click", handleDropdownClick);
          cleanupFns.push(() => label.removeEventListener("click", handleDropdownClick));
        });
      };

      setupDropdownToggles(mobileMenuListRef.current);
    }

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, [mobileMenu, user, loading, pathname]);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handleClickOutside = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuOpen]);

  const accountAvatarUrl = user?.avatar_url || "";
  const accountInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  const isAdminUser = user?.role === "admin";

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
                        <span className='site-brand site-brand--header'>
                          <Image src={settings.site_logo_url} alt={settings.site_name || 'Site Logo'} className='site-logo site-logo--header' width={150} height={52} style={{ width: "auto", height: "52px" }} priority />
                          <span className='site-brand__wordmark'>IRWAA</span>
                        </span>
                      ) : (
                        <h3 className='m-0 fw-bold' style={{ color: 'var(--primary-color)' }}>IRWAA</h3>
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
                          className={`navbar__item nav-fade ${isEbookRoute ? "active" : ""
                            }`}
                        >
                          <Link href='/ebooks'>{settings.nav_ebooks_label || 'E-Books'}</Link>
                        </li>
                        <li
                          className={`navbar__item nav-fade ${isFatwaRoute ? "active" : ""
                            }`}
                        >
                          <Link href='/fatwa'>{settings.nav_fatwas_label || 'Fatwas'}</Link>
                        </li>
                        {customNavLinks.map((item) => (
                          <li
                            key={`${item.href}-${item.label}`}
                            className={`navbar__item nav-fade ${pathname === item.href ? "active" : ""}`}
                          >
                            <Link href={item.href}>{item.label}</Link>
                          </li>
                        ))}
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
                            "/about-us",
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
                                ["/about-us"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/about-us#contact-us'>
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
                          className={`navbar__item nav-fade ${["/about-us"].includes(pathname) ? "active" : ""
                            } `}
                        >
                          <Link href='/about-us#contact-us'>{t('contactUs', 'Contact Us')}</Link>
                        </li>
                      </ul>
                    </div>
                    <div className='contact-btn'>
                      <div className='contact-icon'>
                        <i className='icon-support' />
                      </div>
                      <div className='contact-content'>
                        <p>{t('callUsNow', 'Call Us Now')}</p>
                        <a href={`tel:${(settings.contact_phone || '(+01)-793-7938').replace(/[^\d+]/g, '')}`}>{settings.contact_phone || '(+01)-793-7938'}</a>
                      </div>
                    </div>
                  </div>
                  <div className='navbar__options'>
                    <div className='navbar__mobile-options '>
                      {/* Auth Buttons */}
                      {!loading && (
                        <>
                          {user ? (
                            <div className='d-none d-md-flex align-items-center gap-3'>
                              <div className='account-menu' ref={accountMenuRef}>
                                <button
                                  type='button'
                                  className='account-menu__trigger'
                                  onClick={() => setAccountMenuOpen((previous) => !previous)}
                                  aria-expanded={accountMenuOpen}
                                  aria-haspopup='menu'
                                >
                                  <span className='account-menu__avatar'>
                                    {accountAvatarUrl ? (
                                      <Image
                                        src={accountAvatarUrl}
                                        alt={user.name || user.email || 'IRWAA member'}
                                        width={36}
                                        height={36}
                                        className='account-menu__avatar-image'
                                      />
                                    ) : (
                                      accountInitial
                                    )}
                                  </span>
                                  {isAdminUser ? (
                                    <span className='account-menu__badge' aria-hidden='true'>
                                      <i className='fa-solid fa-crown'></i>
                                    </span>
                                  ) : null}
                                  <span className='visually-hidden'>{t('myAccount', 'My Account')}</span>
                                </button>

                                {accountMenuOpen ? (
                                  <div className='account-menu__panel' role='menu'>
                                    <div className='account-menu__summary'>
                                      <div className='account-menu__summary-avatar'>
                                        {accountAvatarUrl ? (
                                          <Image
                                            src={accountAvatarUrl}
                                            alt={user.name || user.email || 'IRWAA member'}
                                            width={44}
                                            height={44}
                                            className='account-menu__avatar-image'
                                          />
                                        ) : (
                                          accountInitial
                                        )}
                                      </div>
                                      <div className='account-menu__summary-content'>
                                        <div className='account-menu__summary-name'>{user.name || 'IRWAA Member'}</div>
                                        <div className='account-menu__summary-email'>{user.email}</div>
                                        <div className='account-menu__summary-role'>
                                          {user.role === 'admin' ? t('administrator', 'Administrator') : t('memberPortal', 'Member Portal')}
                                        </div>
                                      </div>
                                    </div>
                                    <Link href='/dashboard' className='account-menu__item account-menu__item--primary' role='menuitem'>
                                      <i className='fa-solid fa-house-user me-2' />
                                      {t('memberDashboard', 'Member Dashboard')}
                                    </Link>
                                    <Link href='/dashboard' className='account-menu__item' role='menuitem'>
                                      <i className='fa-regular fa-user me-2' />
                                      {t('viewProfile', 'View Profile')}
                                    </Link>
                                    <Link href='/dashboard' className='account-menu__item' role='menuitem'>
                                      <i className='fa-solid fa-gear me-2' />
                                      {t('accountSettings', 'Account Settings')}
                                    </Link>
                                    <Link href='/dashboard#donation-history' className='account-menu__item' role='menuitem'>
                                      <i className='fa-solid fa-heart-circle-check me-2' />
                                      {t('donationHistory', 'Donation History')}
                                    </Link>
                                    <Link href='/dashboard#saved-content' className='account-menu__item' role='menuitem'>
                                      <i className='fa-regular fa-bookmark me-2' />
                                      {t('savedContent', 'Saved Content')}
                                    </Link>
                                    {user.role === 'admin' ? (
                                      <Link href='/admin/dashboard' className='account-menu__item' role='menuitem'>
                                        <i className='fa-solid fa-shield-halved me-2' />
                                        {t('adminPanel', 'Admin Panel')}
                                      </Link>
                                    ) : null}
                                    <button type='button' className='account-menu__item' onClick={logout} role='menuitem'>
                                      <i className='fa-solid fa-sign-out-alt me-2' />
                                      {t('logout', 'Logout')}
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <div className='d-none d-md-flex align-items-center gap-2 auth-nav-actions'>
                              <Link
                                href='/login'
                                className='btn btn-light auth-nav-button auth-nav-button--ghost'
                              >
                                {t('login', 'Login')}
                              </Link>
                              <Link
                                href='/register'
                                className='btn btn-primary auth-nav-button'
                              >
                                {t('register', 'Register')} <i className='fa-solid fa-arrow-right' />
                              </Link>
                            </div>
                          )}
                        </>
                      )}

                      <Link
                        href='/donation'
                        className='btn--primary d-none d-xl-inline-block'
                      >
                        {t('donateNow', 'Donate Now')} <i className='fa-solid fa-arrow-right' />
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
                placeholder={t('searchSite', 'Search...')}
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
        className={`mobile-menu mobile-menu--primary d-block d-xl-none ${mobileMenu ? "show-menu" : ""
          }`}
      >
        <nav className='mobile-menu__wrapper'>
          <div className='mobile-menu__header nav-fade'>
            <div className='logo'>
              <Link href='/' className='text-decoration-none'>
                {settings.site_logo_url ? (
                  <span className='site-brand site-brand--mobile'>
                    <Image src={settings.site_logo_url} alt={settings.site_name || 'Site Logo'} className='site-logo site-logo--mobile' width={120} height={44} style={{ width: "auto", height: "44px" }} priority />
                    <span className='site-brand__wordmark'>IRWAA</span>
                  </span>
                ) : (
                  <h4 className='m-0 fw-bold' style={{ color: 'var(--primary-color)' }}>IRWAA</h4>
                )}
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
                  {t('dashboard', 'Dashboard')} <i className='fa-solid fa-chart-line' />
                </Link>
                {user.role === 'admin' && (
                  <Link href='/admin/dashboard' className='btn--primary'>
                    {t('adminPanel', 'Admin Panel')} <i className='fa-solid fa-shield-halved' />
                  </Link>
                )}
              </div>
            ) : !loading ? (
              <div className='d-flex flex-column gap-2 mb-3'>
                <Link href='/login' className='btn--secondary'>
                  {t('login', 'Login')}
                </Link>
                <Link href='/register' className='btn--primary'>
                  {t('register', 'Register')} <i className='fa-solid fa-arrow-right' />
                </Link>
              </div>
            ) : null}
            <Link href='/donation' className='btn--primary '>
              {t('donateNow', 'Donate Now')} <i className='fa-solid fa-arrow-right' />
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
