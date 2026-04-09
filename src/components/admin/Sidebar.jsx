"use client";

import Link from 'next/link';

import { getVisibleAdminGroups } from '@/lib/admin-navigation';

export default function Sidebar({ pathname, role, onLogout }) {
  const visibleGroups = getVisibleAdminGroups(role);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className="sidebar-shell p-3 p-lg-4 d-flex flex-column"
    >
      <div className="mb-4">
        <span className="signal-chip mb-3">
          <span className="signal-chip__dot" />
          {role === 'scholar' ? 'Scholar Workspace' : 'Admin Control Center'}
        </span>
        <h4 className="mb-2">IRWA Admin</h4>
        <p className="text-white-50 mb-0 small">
          {role === 'scholar'
            ? 'Write, teach, review submissions, and manage the learning side of the platform.'
            : 'Oversee charity, dawah publishing, learning content, and the wider public platform.'}
        </p>
      </div>

      <div className="d-flex flex-column gap-4 flex-grow-1 overflow-auto pe-1">
        {visibleGroups.map((group) => (
          <div key={group.id}>
            <div className="text-uppercase small fw-bold text-white-50 mb-2">{group.label}</div>
            <div className="d-flex flex-column gap-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link nav-link rounded-3 px-3 py-2 d-flex align-items-center justify-content-between ${
                    isActive(item.href) ? 'is-active fw-bold shadow-sm' : ''
                  }`}
                >
                  <span>
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                  </span>
                  {isActive(item.href) ? (
                    <span className="theme-badge-soft">
                      Open
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-top border-secondary-subtle">
        <button onClick={onLogout} className="btn btn-outline-light w-100 rounded-pill btn-ripple">
          Logout
        </button>
        <Link href="/" className="btn btn-link text-white w-100 mt-2 text-decoration-none">
          ← Back to Site
        </Link>
      </div>
    </aside>
  );
}
