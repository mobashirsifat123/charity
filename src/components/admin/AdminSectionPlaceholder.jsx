import Link from 'next/link';

export default function AdminSectionPlaceholder({
  eyebrow = 'Admin Section',
  title,
  description,
  primaryHref = '/admin/dashboard',
  primaryLabel = 'Back to dashboard',
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 p-lg-5">
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mb-3">
          {eyebrow}
        </span>
        <h1 className="fw-bold mb-3">{title}</h1>
        <p className="text-muted mb-4">{description}</p>
        <div className="alert alert-light border rounded-4 mb-4">
          This workspace has been added to the admin navigation and RBAC structure so the team can plug the full feature set in here next.
        </div>
        <Link href={primaryHref} className="btn btn-primary rounded-pill px-4">
          {primaryLabel}
        </Link>
      </div>
    </div>
  );
}
