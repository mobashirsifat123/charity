export const ADMIN_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Top-level admin workspace.',
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        icon: 'fa-solid fa-chart-line',
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'charity',
    label: 'Charity',
    description: 'Fundraising, donations, and zakat operations.',
    items: [
      {
        href: '/admin/campaigns',
        label: 'Campaigns',
        icon: 'fa-solid fa-bullhorn',
        roles: ['admin'],
      },
      {
        href: '/admin/donations',
        label: 'Donations',
        icon: 'fa-solid fa-hand-holding-dollar',
        roles: ['admin'],
      },
      {
        href: '/admin/zakat',
        label: 'Zakat',
        icon: 'fa-solid fa-calculator',
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'dawah-library',
    label: 'Dawah Library',
    description: 'Articles, scholars, and media publishing.',
    items: [
      {
        href: '/admin/blogs',
        label: 'Articles',
        icon: 'fa-solid fa-newspaper',
        roles: ['admin', 'scholar'],
      },
      {
        href: '/admin/categories',
        label: 'Categories',
        icon: 'fa-solid fa-tags',
        roles: ['admin', 'scholar'],
      },
      {
        href: '/admin/scholars',
        label: 'Scholars',
        icon: 'fa-solid fa-user-graduate',
        roles: ['admin', 'scholar'],
      },
      {
        href: '/admin/images',
        label: 'Media',
        icon: 'fa-regular fa-images',
        roles: ['admin', 'scholar'],
      },
    ],
  },
  {
    id: 'learning',
    label: 'Learning (LMS)',
    description: 'Courses and structured lesson delivery.',
    items: [
      {
        href: '/admin/courses',
        label: 'Courses',
        icon: 'fa-solid fa-book-open-reader',
        roles: ['admin', 'scholar'],
      },
      {
        href: '/admin/course-modules',
        label: 'Syllabus Modules',
        icon: 'fa-solid fa-list-check',
        roles: ['admin', 'scholar'],
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Fatwa requests and audience touchpoints.',
    items: [
      {
        href: '/admin/inbox',
        label: 'Fatwa Inbox',
        icon: 'fa-regular fa-envelope-open',
        roles: ['admin', 'scholar'],
      },
      {
        href: '/admin/subscribers',
        label: 'Subscribers',
        icon: 'fa-regular fa-paper-plane',
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'site-ops',
    label: 'Site Ops',
    description: 'Brand, content, and public site controls.',
    items: [
      {
        href: '/admin/content',
        label: 'Site Builder',
        icon: 'fa-solid fa-pen-ruler',
        roles: ['admin'],
      },
      {
        href: '/admin/settings',
        label: 'Brand & Contact',
        icon: 'fa-solid fa-gear',
        roles: ['admin'],
      },
      {
        href: '/admin/team',
        label: 'Team',
        icon: 'fa-solid fa-users',
        roles: ['admin'],
      },
    ],
  },
];

export function getVisibleAdminGroups(role) {
  return ADMIN_NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

export function canAccessAdminPath(role, pathname = '') {
  if (role === 'admin') return true;
  if (role !== 'scholar') return false;

  const scholarAllowedPrefixes = [
    '/admin/blogs',
    '/admin/categories',
    '/admin/scholars',
    '/admin/images',
    '/admin/courses',
    '/admin/course-modules',
    '/admin/inbox',
    '/admin/fatwas',
  ];

  return scholarAllowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getDefaultAdminPath(role) {
  if (role === 'scholar') return '/admin/blogs';
  return '/admin/dashboard';
}

export function isAdminRole(role) {
  return role === 'admin' || role === 'scholar';
}
