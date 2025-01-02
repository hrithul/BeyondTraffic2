import React, { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import axios from '../../../utils/axios';
import './LocationSelector.css';

const LocationSelector = ({ onChange, value = [] }) => {
  const [regions, setRegions] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch regions and stores
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [regionsResponse, storesResponse] = await Promise.all([
          axios.get('/region'),
          axios.get('/store')
        ]);

        let regionOptions = [];
        let storeOptions = [];

        if (regionsResponse.data && regionsResponse.data.success) {
          regionOptions = regionsResponse.data.data.map(region => ({
            value: region.code,
            label: `${region.code} - ${region.name}` // Include both code and name
          }));
          setRegions(regionOptions);
        }

        if (storesResponse.data && storesResponse.data.success) {
          storeOptions = storesResponse.data.data.map(store => ({
            value: store.store_code,
            label: `${store.store_code} - ${store.store_name}`, // Include both code and name
            region: store.region_id
          }));
          setStores(storeOptions);
        }

        // Set initial values if provided
        if (value && value.length > 0) {
          const initialRegions = [];
          const initialStores = [];
          
          value.forEach(location => {
            if (location.type === 'region') {
              const region = regionOptions.find(r => r.value === location.code);
              if (region) initialRegions.push(region);
            } else if (location.type === 'store') {
              const store = storeOptions.find(s => s.value === location.code);
              if (store) initialStores.push(store);
            }
          });

          setSelectedRegions(initialRegions);
          setSelectedStores(initialStores);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError(error.response?.data?.message || "Failed to fetch locations");
        }
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [value]);

  // Handle region selection change
  const handleRegionChange = (selectedOptions) => {
    const selected = selectedOptions || [];
    setSelectedRegions(selected);
    
    // Update parent component
    const locations = [
      ...selected.map(region => ({ type: 'region', code: region.value })),
      ...selectedStores.map(store => ({ type: 'store', code: store.value }))
    ];
    onChange(locations);
  };

  // Handle store selection change
  const handleStoreChange = (selectedOptions) => {
    const selected = selectedOptions || [];
    setSelectedStores(selected);
    
    // Update parent component
    const locations = [
      ...selectedRegions.map(region => ({ type: 'region', code: region.value })),
      ...selected.map(store => ({ type: 'store', code: store.value }))
    ];
    onChange(locations);
  };

  // Filter out stores that belong to selected regions
  const availableStores = stores.filter(store => 
    !selectedRegions.some(region => region.value === store.region)
  );

  return (
    <div className="location-selector">
      <FormGroup>
        <Label>Select Regions</Label>
        <Select
          isMulti
          name="regions"
          options={regions}
          className="basic-multi-select"
          classNamePrefix="select"
          value={selectedRegions}
          onChange={handleRegionChange}
          isLoading={loading}
          placeholder="Select regions..."
          noOptionsMessage={() => "No regions available"}
        />
      </FormGroup>

      <FormGroup>
        <Label>Select Stores</Label>
        <Select
          isMulti
          name="stores"
          options={availableStores}
          className="basic-multi-select"
          classNamePrefix="select"
          value={selectedStores}
          onChange={handleStoreChange}
          isLoading={loading}
          placeholder="Select stores..."
          noOptionsMessage={() => "No stores available"}
        />
      </FormGroup>

      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </div>
  );
};

export default LocationSelector;