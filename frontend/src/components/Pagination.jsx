"use client";

/**
 * Pagination - Previous/Next pagination controls
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} total - Total items count
 */
const Pagination = ({ currentPage, totalPages, onPageChange, total }) => {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5; // Max pages to show at once

        let start = Math.max(1, currentPage - Math.floor(showPages / 2));
        let end = Math.min(totalPages, start + showPages - 1);

        // Adjust start if we're near the end
        if (end - start + 1 < showPages) {
            start = Math.max(1, end - showPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="pagination-wrapper">
            <nav aria-label="Campaign pagination">
                <ul className="pagination justify-content-center align-items-center mb-0">
                    {/* Previous Button */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link page-btn"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                        >
                            <i className="fa-solid fa-chevron-left me-2"></i>
                            Previous
                        </button>
                    </li>

                    {/* Page Numbers */}
                    <li className="page-item d-none d-md-block">
                        <div className="px-3 d-flex align-items-center gap-1">
                            {pageNumbers[0] > 1 && (
                                <>
                                    <button
                                        className="page-link page-num"
                                        onClick={() => onPageChange(1)}
                                    >
                                        1
                                    </button>
                                    {pageNumbers[0] > 2 && (
                                        <span className="text-muted px-1">...</span>
                                    )}
                                </>
                            )}

                            {pageNumbers.map(num => (
                                <button
                                    key={num}
                                    className={`page-link page-num ${currentPage === num ? 'active' : ''}`}
                                    onClick={() => onPageChange(num)}
                                >
                                    {num}
                                </button>
                            ))}

                            {pageNumbers[pageNumbers.length - 1] < totalPages && (
                                <>
                                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                                        <span className="text-muted px-1">...</span>
                                    )}
                                    <button
                                        className="page-link page-num"
                                        onClick={() => onPageChange(totalPages)}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>
                    </li>

                    {/* Mobile Page Info */}
                    <li className="page-item d-md-none">
                        <span className="page-link bg-transparent border-0 text-muted">
                            {currentPage} of {totalPages}
                        </span>
                    </li>

                    {/* Next Button */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link page-btn"
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <i className="fa-solid fa-chevron-right ms-2"></i>
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Total Count */}
            <div className="text-center mt-3">
                <small className="text-muted">
                    Showing page {currentPage} of {totalPages} ({total} campaigns total)
                </small>
            </div>

            <style jsx>{`
                .pagination-wrapper {
                    padding: 20px 0;
                }
                .page-btn {
                    border-radius: 50px !important;
                    padding: 10px 20px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                .page-btn:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .page-num {
                    width: 40px;
                    height: 40px;
                    border-radius: 50% !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    font-weight: 500;
                }
                .page-num.active {
                    background: var(--bs-primary);
                    color: white;
                    border-color: var(--bs-primary);
                }
            `}</style>
        </div>
    );
};

export default Pagination;
