import React from 'react';
import Select from 'react-select';

const dataOptions = [
  {
    value: "gender",
    label: "Gender Distribution",
    options: [
      {
        value: "entersMale",
        label: "Male Entries",
        field: "@EntersMaleCustomer",
      },
      { value: "exitsMale", label: "Male Exits", field: "@ExitsMaleCustomer" },
      {
        value: "entersFemale",
        label: "Female Entries",
        field: "@EntersFemaleCustomer",
      },
      {
        value: "exitsFemale",
        label: "Female Exits",
        field: "@ExitsFemaleCustomer",
      },
      {
        value: "unknownEnters",
        label: "Unknown Entries",
        field: "@EntersUnknown",
      },
      { value: "unknownExits", label: "Unknown Exits", field: "@ExitsUnknown" },
    ],
  },
  {
    value: "traffic",
    label: "Traffic Flow",
    options: [
      { value: "enters", label: "Total Entries", field: "@Enters" },
      { value: "exits", label: "Total Exits", field: "@Exits" },
    ],
  },
  {
    value: "combined",
    label: "Combined Metrics",
    options: [
      { value: "totalTraffic", label: "Total Traffic", field: "total" },
    ],
  },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minWidth: '200px',
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
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#7366FF20',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#7366FF',
    fontWeight: 500
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#7366FF',
    '&:hover': {
      backgroundColor: '#7366FF',
      color: 'white'
    }
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999
  })
};

const ChartDataSelector = ({ selectedData, onChange }) => (
  <Select
    isMulti
    options={dataOptions}
    value={selectedData}
    onChange={onChange}
    styles={selectStyles}
    placeholder="Select metrics..."
    className="basic-multi-select"
    classNamePrefix="select"
  />
);

export default ChartDataSelector;
