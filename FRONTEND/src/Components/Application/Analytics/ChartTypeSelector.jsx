import React from 'react';
import Select from 'react-select';

export const chartTypes = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'donut', label: 'Donut Chart' }
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minWidth: '120px',
    border: `1px solid ${state.isFocused ? '#7366FF' : '#ced4da'}`,
    boxShadow: state.isFocused ? '0 0 0 1px #7366FF' : 'none',
    borderRadius: '0.25rem',
    minHeight: '35px',
    '&:hover': {
      borderColor: '#7366FF'
    }
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected 
      ? '#7366FF'
      : isFocused 
        ? '#7366FF20'
        : 'white',
    color: isSelected ? 'white' : '#333',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: isSelected ? '#7366FF' : '#7366FF20'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#333'
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999
  })
};

const ChartTypeSelector = ({ selectedType, onChange }) => (
  <Select
    options={chartTypes}
    value={chartTypes.find(type => type.value === selectedType)}
    onChange={(option) => onChange(option.value)}
    styles={selectStyles}
    placeholder="Select chart type..."
    className="basic-select"
    classNamePrefix="select"
  />
);

export default ChartTypeSelector;
