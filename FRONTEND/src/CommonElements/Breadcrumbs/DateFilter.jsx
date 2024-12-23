import React, { useState, useRef, useEffect } from 'react';
import './DateFilter.css';

const DateFilter = ({ onFilterSelect, initialFilter = 'today' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const dropdownRef = useRef(null);

  useEffect(() => {
    onFilterSelect(initialFilter);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDateFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setIsOpen(false);
    onFilterSelect(filter);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dateFilters = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },

    { label: "Last week", value: "lastWeek" },
    { label: "Last month", value: "lastMonth" },
    { label: "Last year", value: "lastYear" },
  ];

  const getSelectedLabel = () => {
    const filter = dateFilters.find(f => f.value === selectedFilter);
    return filter ? filter.label : 'Select Period';
  };

  return (
    <div className="date-filter-container" ref={dropdownRef}>
      <button
        className={`filter-button ${selectedFilter ? "selected" : ""}`}
        onClick={toggleDropdown}
      >
        {getSelectedLabel()} 🢓
      </button>

      {isOpen && (
        <div className="date-filter-dropdown">
          {dateFilters.map((filter) => (
            <div
              key={filter.value}
              className={`date-filter-item ${
                selectedFilter === filter.value ? "selected" : ""
              }`}
              onClick={() => handleDateFilterSelect(filter.value)}
            >
              <div
                className={`date-filter-checkbox ${
                  selectedFilter === filter.value ? "selected" : ""
                }`}
              >
                {selectedFilter === filter.value && (
                  <span className="date-filter-checkmark">✓</span>
                )}
              </div>
              <span
                className={`date-filter-label ${
                  selectedFilter === filter.value ? "selected" : ""
                }`}
              >
                {filter.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateFilter;
