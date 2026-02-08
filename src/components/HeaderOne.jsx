"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const HeaderOne = () => {
  let pathname = usePathname();
  let [search, setSearch] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const [scroll, setScroll] = useState(false);
  const { user, logout, loading } = useAuth();
  const handleSearch = () => {
    setSearch(!search);
  };
  const handleMobileMenu = () => {
    setMobileMenu(!mobileMenu);
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
  }, []);

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
                    <Link href='/'>
                      <img src='/assets/images/logo.png' alt='Image_inner' />
                    </Link>
                  </div>
                  <div className='navbar__menu-wrapper'>
                    <div className='navbar__menu d-none d-xl-block'>
                      <ul className='navbar__list'>
                        <li
                          className={`navbar__item navbar__item--has-children nav-fade ${pathname === "/" ? "active" : ""
                            }`}
                        >
                          <Link
                            href='#'
                            aria-label='dropdown menu'
                            className='navbar__dropdown-label dropdown-label-alter'
                          >
                            Home
                          </Link>
                          <ul className='navbar__sub-menu mega-menu'>
                            <li>
                              <div className='mega-content-wrapper'>
                                <img
                                  src='/assets/images/home-one.png'
                                  alt='Image_inner'
                                />
                                <div className='mega-content'>
                                  <Link href='/' className='btn--primary'>
                                    Demo
                                  </Link>
                                </div>
                              </div>
                              <Link href='/'>Home One</Link>
                            </li>
                            <li>
                              <div className='mega-content-wrapper'>
                                <img
                                  src='/assets/images/home-two.png'
                                  alt='Image_inner'
                                />
                                <div className='mega-content'>
                                  <Link
                                    href='/index-two'
                                    className='btn--secondary'
                                  >
                                    Demo
                                  </Link>
                                </div>
                              </div>
                              <Link href='/index-two'>Home Two</Link>
                            </li>
                            <li>
                              <div className='mega-content-wrapper'>
                                <img
                                  src='/assets/images/home-three.png'
                                  alt='Image_inner'
                                />
                                <div className='mega-content'>
                                  <Link
                                    href='/index-three'
                                    className='btn--primary'
                                  >
                                    Demo
                                  </Link>
                                </div>
                              </div>
                              <Link href='/index-three'>Home Three</Link>
                            </li>
                            <li>
                              <div className='mega-content-wrapper'>
                                <img
                                  src='/assets/images/home-four.png'
                                  alt='Image_inner'
                                />
                                <div className='mega-content'>
                                  <Link
                                    href='/index-four'
                                    className='btn--primary'
                                  >
                                    Demo
                                  </Link>
                                </div>
                                <span className='new'>New</span>
                              </div>
                              <Link href='/index-four'>Home Four</Link>
                            </li>
                            <li>
                              <div className='mega-content-wrapper'>
                                <img
                                  src='/assets/images/home-five.png'
                                  alt='Image_inner'
                                />
                                <div className='mega-content'>
                                  <Link
                                    href='/index-five'
                                    className='btn--primary'
                                  >
                                    Demo
                                  </Link>
                                </div>
                                <span className='new'>New</span>
                              </div>
                              <Link href='/index-five'>Home Five</Link>
                            </li>
                          </ul>
                        </li>
                        <li
                          className={`navbar__item nav-fade ${["/about-us"].includes(pathname) ? "active" : ""
                            }`}
                        >
                          <Link href='/about-us'>About Us</Link>
                        </li>
                        <li
                          className={`navbar__item navbar__item--has-children nav-fade ${["/our-causes", "/cause-details"].includes(pathname)
                            ? "active"
                            : ""
                            }`}
                        >
                          <Link
                            href='#'
                            aria-label='dropdown menu'
                            className='navbar__dropdown-label dropdown-label-alter'
                          >
                            Causes
                          </Link>
                          <ul className='navbar__sub-menu'>
                            <li
                              className={
                                ["/our-causes"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/our-causes'>Our Causes</Link>
                            </li>
                            <li
                              className={
                                ["/cause-details"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/cause-details'>Cause Details</Link>
                            </li>
                          </ul>
                        </li>
                        <li
                          className={`navbar__item navbar__item--has-children nav-fade ${[
                            "/faq",
                            "/donate-us",
                            "/become-volunteer",
                            "/events",
                            "/event-details",
                            "/shop",
                            "/product-details",
                            "/cart",
                            "/checkout",
                          ].includes(pathname)
                            ? "active"
                            : ""
                            }`}
                        >
                          <Link
                            href='#'
                            aria-label='dropdown menu'
                            className='navbar__dropdown-label dropdown-label-alter'
                          >
                            Pages
                          </Link>
                          <ul className='navbar__sub-menu'>
                            <li
                              className={
                                ["/faq"].includes(pathname) ? "active" : ""
                              }
                            >
                              <Link href='/faq'>FAQ</Link>
                            </li>
                            <li
                              className={
                                ["/donate-us"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/donate-us'>Donate Us</Link>
                            </li>
                            <li
                              className={
                                ["/become-volunteer"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/become-volunteer'>
                                Become Volunteer
                              </Link>
                            </li>
                            <li
                              className={`navbar__item navbar__item--has-children ${["/events", "/event-details"].includes(pathname)
                                ? "active"
                                : ""
                                }`}
                            >
                              <Link
                                href='#'
                                aria-label='dropdown menu'
                                className='navbar__dropdown-label navbar__dropdown-label-sub'
                              >
                                Events
                              </Link>
                              <ul className='navbar__sub-menu navbar__sub-menu__nested'>
                                <li
                                  className={
                                    ["/events"].includes(pathname)
                                      ? "active"
                                      : ""
                                  }
                                >
                                  <Link href='/events'>Events</Link>
                                </li>
                                <li
                                  className={
                                    ["/event-details"].includes(pathname)
                                      ? "active"
                                      : ""
                                  }
                                >
                                  <Link href='/event-details'>
                                    Event Details
                                  </Link>
                                </li>
                              </ul>
                            </li>
                            <li
                              className={`navbar__item navbar__item--has-children ${[
                                "/shop",
                                "/product-details",
                                "/cart",
                                "/checkout",
                              ].includes(pathname)
                                ? "active"
                                : ""
                                }`}
                            >
                              <Link
                                href='#'
                                aria-label='dropdown menu'
                                className='navbar__dropdown-label navbar__dropdown-label-sub'
                              >
                                Shop
                              </Link>
                              <ul className='navbar__sub-menu navbar__sub-menu__nested'>
                                <li
                                  className={
                                    ["/shop"].includes(pathname) ? "active" : ""
                                  }
                                >
                                  <Link href='/shop'>Our Shop</Link>
                                </li>
                                <li
                                  className={
                                    ["/product-details"].includes(pathname)
                                      ? "active"
                                      : ""
                                  }
                                >
                                  <Link href='/product-details'>
                                    Product Details
                                  </Link>
                                </li>
                                <li
                                  className={
                                    ["/cart"].includes(pathname) ? "active" : ""
                                  }
                                >
                                  <Link href='/cart'>View Cart</Link>
                                </li>
                                <li
                                  className={
                                    ["/checkout"].includes(pathname)
                                      ? "active"
                                      : ""
                                  }
                                >
                                  <Link href='/checkout'>Cehckout</Link>
                                </li>
                              </ul>
                            </li>
                            <li
                              className={`navbar__item navbar__item--has-children ${["/our-team", "/team-details"].includes(
                                pathname
                              )
                                ? "active"
                                : ""
                                }`}
                            >
                              <Link
                                href='#'
                                aria-label='dropdown menu'
                                className='navbar__dropdown-label navbar__dropdown-label-sub'
                              >
                                Team
                              </Link>
                              <ul className='navbar__sub-menu navbar__sub-menu__nested'>
                                <li
                                  className={
                                    ["/our-team"].includes(pathname)
                                      ? "active"
                                      : ""
                                  }
                                >
                                  <Link href='/our-team'>Our Teams</Link>
                                </li>
                                <li
                                  className={
                                    ["/team-details"].includes(pathname)
                                      ? "active"
                                      : ""
                                  }
                                >
                                  <Link href='/team-details'>Team Details</Link>
                                </li>
                              </ul>
                            </li>
                            <li
                              className={
                                ["/coming-soon"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/coming-soon'>Coming Soon</Link>
                            </li>
                            <li
                              className={
                                ["/404"].includes(pathname) ? "active" : ""
                              }
                            >
                              <Link href='/404'>Error</Link>
                            </li>
                          </ul>
                        </li>
                        <li
                          className={`navbar__item navbar__item--has-children nav-fade ${[
                            "/blog-list",
                            "/blog-grid",
                            "/blog-details",
                          ].includes(pathname)
                            ? "active"
                            : ""
                            } `}
                        >
                          <Link
                            href='/'
                            aria-label='dropdown menu'
                            className='navbar__dropdown-label dropdown-label-alter'
                          >
                            News
                          </Link>
                          <ul className='navbar__sub-menu'>
                            <li
                              className={
                                ["/blog-list"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/blog-list'>News List View</Link>
                            </li>
                            <li
                              className={
                                ["/blog-grid"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/blog-grid'>News Grid View</Link>
                            </li>
                            <li
                              className={
                                ["/blog-details"].includes(pathname)
                                  ? "active"
                                  : ""
                              }
                            >
                              <Link href='/blog-details'>News Details</Link>
                            </li>
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
                        href='/donate-us'
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
          <form action='#' method='post'>
            <div className='search-popup__group'>
              <input
                type='text'
                name='search-field'
                id='searchField'
                placeholder='Search....'
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
              <Link href='/' aria-label='home page' title='logo'>
                <img src='assets/images/logo.png' alt='Image_inner' />
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
            <Link href='/donate-us' className='btn--primary '>
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
      ></div>
    </>
  );
};

export default HeaderOne;
