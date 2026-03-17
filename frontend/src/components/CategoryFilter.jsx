"use client";

// Default categories if none exist in database
const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'All Campaigns', icon: 'fa-layer-group' },
    { id: 'education', label: 'Education', icon: 'fa-graduation-cap' },
    { id: 'medical', label: 'Medical', icon: 'fa-heart-pulse' },
    { id: 'crisis', label: 'Crisis Relief', icon: 'fa-hand-holding-heart' },
    { id: 'environment', label: 'Environment', icon: 'fa-leaf' },
    { id: 'community', label: 'Community', icon: 'fa-people-group' },
];

/**
 * CategoryFilter - Pill buttons for category filtering
 * @param {string} value - Current selected category
 * @param {function} onChange - Callback when category changes
 * @param {Array} categories - Optional custom categories from API
 */
const CategoryFilter = ({ value, onChange, categories = null }) => {
    const displayCategories = categories && categories.length > 0
        ? [{ id: 'all', label: 'All', icon: 'fa-layer-group' }, ...categories.map(cat => ({
            id: cat.toLowerCase(),
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: getIconForCategory(cat),
        }))]
        : DEFAULT_CATEGORIES;

    return (
        <div className="category-filter">
            <div className="d-flex flex-wrap gap-2 justify-content-center">
                {displayCategories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        className={`btn category-pill ${(value === cat.id) || (!value && cat.id === 'all')
                                ? 'btn-primary active'
                                : 'btn-outline-secondary'
                            }`}
                        onClick={() => onChange(cat.id)}
                    >
                        <i className={`fa-solid ${cat.icon} me-2`}></i>
                        {cat.label}
                    </button>
                ))}
            </div>

            <style jsx>{`
                .category-pill {
                    border-radius: 50px;
                    padding: 10px 20px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                .category-pill:hover {
                    transform: translateY(-2px);
                }
                .category-pill.active {
                    box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.4);
                }
            `}</style>
        </div>
    );
};

// Helper to get icon based on category name
function getIconForCategory(category) {
    const icons = {
        education: 'fa-graduation-cap',
        medical: 'fa-heart-pulse',
        crisis: 'fa-hand-holding-heart',
        environment: 'fa-leaf',
        community: 'fa-people-group',
        animals: 'fa-paw',
        children: 'fa-children',
        elderly: 'fa-person-cane',
        hunger: 'fa-utensils',
        shelter: 'fa-house',
    };
    return icons[category.toLowerCase()] || 'fa-circle';
}

export default CategoryFilter;
