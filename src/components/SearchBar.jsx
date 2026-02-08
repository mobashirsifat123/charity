"use client";
import { useState, useCallback } from 'react';

/**
 * SearchBar - Search input with icon and debounce
 * @param {string} value - Current search value
 * @param {function} onChange - Callback when search changes
 * @param {string} placeholder - Placeholder text
 */
const SearchBar = ({ value, onChange, placeholder = "Search campaigns..." }) => {
    const [localValue, setLocalValue] = useState(value || '');

    // Debounce search
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onChange(localValue);
    };

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <form onSubmit={handleSubmit} className="search-bar">
            <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder={placeholder}
                    value={localValue}
                    onChange={handleChange}
                    style={{ boxShadow: 'none' }}
                />
                {localValue && (
                    <button
                        type="button"
                        className="btn btn-link text-muted"
                        onClick={handleClear}
                        title="Clear search"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                )}
                <button type="submit" className="btn btn-primary px-4">
                    Search
                </button>
            </div>

            <style jsx>{`
                .search-bar .input-group {
                    border-radius: 50px;
                    overflow: hidden;
                }
                .search-bar .input-group-text {
                    border-radius: 50px 0 0 50px;
                }
                .search-bar .btn-primary {
                    border-radius: 0 50px 50px 0;
                }
                .search-bar .form-control:focus {
                    box-shadow: none;
                }
            `}</style>
        </form>
    );
};

export default SearchBar;
