import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDateFilter } from '../../redux/actions/dateFilterActions';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './DateFilter.css';

const DateFilter = () => {
  const dispatch = useDispatch();
  const selectedFilter = useSelector((state) => state.dateFilter.filter);
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const dropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  const dateFilters = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'month', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'year', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleDateFilterSelect = (filter) => {
    if (filter === 'custom') {
      setShowCustomDates(true);
      setIsOpen(false);
      return;
    }
    
    dispatch(setDateFilter(filter));
    setShowCustomDates(false);
    setIsOpen(false);
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      dispatch(setDateFilter({
        type: 'custom',
        startDate: customStartDate.toISOString().split('T')[0],
        endDate: customEndDate.toISOString().split('T')[0]
      }));
      setShowCustomDates(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!event.target.closest('.react-datepicker')) {
          setShowCustomDates(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedLabel = () => {
    if (selectedFilter?.type === 'custom' && selectedFilter?.startDate && selectedFilter?.endDate) {
      return `${new Date(selectedFilter.startDate).toLocaleDateString()} - ${new Date(selectedFilter.endDate).toLocaleDateString()}`;
    }
    
    const filter = dateFilters.find(f => f.value === selectedFilter);
    return filter ? filter.label : 'Select Period';
  };

  return (
    <div className="date-filter-wrapper">
      <div className="date-filter-container" ref={dropdownRef}>
        <div
          className={`date-filter-button ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{getSelectedLabel()}</span>
          <i className={`fa fa-angle-down ${isOpen ? "rotate" : ""}`}></i>
        </div>

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

      {showCustomDates && (
        <div className="date-filter-custom-popup" ref={datePickerRef}>
          <div className="date-picker-container">
            <label>Start Date: </label>
            <DatePicker
              selected={customStartDate}
              onChange={date => setCustomStartDate(date)}
              selectsStart
              startDate={customStartDate}
              endDate={customEndDate}
              maxDate={new Date()}
              className="date-picker-input"
            />
          </div>
          <div className="date-picker-container">
            <label>End Date: </label>
            <DatePicker
              selected={customEndDate}
              onChange={date => setCustomEndDate(date)}
              selectsEnd
              startDate={customStartDate}
              endDate={customEndDate}
              minDate={customStartDate}
              maxDate={new Date()}
              className="date-picker-input"
            />
          </div>
          <button 
            className="date-filter-apply"
            onClick={handleCustomDateSubmit}
            disabled={!customStartDate || !customEndDate}
          >
            Apply Range
          </button>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
