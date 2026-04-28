import Link from "next/link";

export default function KnowledgePageHeader({
  badge = "Knowledge",
  title,
  description,
  links = [],
  children,
  stats = [],
  actions,
  className = "",
}) {
  return (
    <section className={`knowledge-page-header ${className}`}>
      <div className="knowledge-page-header__mesh" aria-hidden="true" />
      <div className="knowledge-page-header__orb knowledge-page-header__orb--one" />
      <div className="knowledge-page-header__orb knowledge-page-header__orb--two" />

      <div className="container position-relative">
        <div className="knowledge-page-header__panel">
          <div className="knowledge-page-header__copy">
            <span className="knowledge-page-header__badge">{badge}</span>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}

            {links.length ? (
              <nav
                className="knowledge-page-header__crumbs"
                aria-label="breadcrumb"
              >
                {links.map((link, index) => (
                  <span key={`${link.name}-${index}`}>
                    {index > 0 ? (
                      <i className="fa-solid fa-chevron-right" />
                    ) : null}
                    {index === links.length - 1 ? (
                      <strong>{link.name}</strong>
                    ) : (
                      <Link href={link.link}>{link.name}</Link>
                    )}
                  </span>
                ))}
              </nav>
            ) : null}
          </div>

          {stats.length ? (
            <div
              className="knowledge-page-header__stats"
              aria-label="Page stats"
            >
              {stats.map((stat) => (
                <span className="knowledge-page-header__stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </span>
              ))}
            </div>
          ) : null}

          {children ? (
            <div className="knowledge-page-header__search">{children}</div>
          ) : null}

          {actions ? (
            <div className="knowledge-page-header__actions">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
