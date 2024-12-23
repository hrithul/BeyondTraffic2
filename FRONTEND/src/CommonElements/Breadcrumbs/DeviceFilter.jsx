import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import axios from "axios";
import "./DeviceFilter.css";
import { useDispatch, useSelector } from 'react-redux';
import { setDeviceFilter, clearDeviceFilter } from '../../redux/actions/deviceFilterActions';

// Reusable CheckboxList component
const CheckboxList = ({ items, selectedItems, onItemSelect, getLabel, onItemClick, activeItem, className }) => (
  <div className="filter-items-container">
    {items.map((item) => {
      const isSelected = selectedItems.some((i) => i.id === item.id);
      return (
        <div
          key={item.id}
          className={`filter-item ${isSelected ? "selected" : ""} ${activeItem?.id === item.id ? "active" : ""} ${className || ""}`}
          onClick={() => onItemClick?.(item)}
          role="checkbox"
          aria-checked={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onItemSelect(item, !isSelected);
            }
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onItemSelect(item, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={getLabel(item)}
          />
          <span className="item-label">
            &nbsp;{getLabel(item)}
          </span>
        </div>
      );
    })}
  </div>
);

const DeviceFilter = ({ onFilterSelect, initialFilter = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stores, setStores] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const filterRef = useRef(null);

  // Redux
  const dispatch = useDispatch();
  const { selectedOrg, selectedRegions, selectedStores, selectedDevices } = useSelector(state => state.deviceFilter);

  useEffect(() => {
    // Trigger initial filter selection
    onFilterSelect(initialFilter);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedOrg) {
      fetchRegions(selectedOrg._id);
    } else {
      setRegions([]);
      setStores([]);
      setDevices([]);
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (!activeStore) {
      setDevices([]);
    }
  }, [activeStore]);

  // Memoized API calls
  const fetchOrganizations = useMemo(() => async () => {
    try {
      setLoading(true);
      const [orgResponse, regionsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:3002/api/organization"),
        axios.get("http://127.0.0.1:3002/api/region")
      ]);

      const organizations = orgResponse.data.data;
      const regions = regionsResponse.data.data;

      const orgsWithCounts = organizations.map((org) => ({
        name: org.company,
        id: org._id,
        count: regions.length,
      }));

      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cache regions and stores data
  const [regionCache, setRegionCache] = useState({});
  const [storeCache, setStoreCache] = useState({});

  const fetchRegions = async (organizationId) => {
    try {
      setLoading(true);
      if (regionCache[organizationId]) {
        setRegions(regionCache[organizationId]);
        return;
      }

      const [regionResponse, storeResponse] = await Promise.all([
        axios.get("http://127.0.0.1:3002/api/region"),
        axios.get("http://127.0.0.1:3002/api/store")
      ]);

      const regions = regionResponse.data.data;
      const stores = storeResponse.data.data;

      const regionsWithCounts = regions.map((region) => {
        const matchingStores = stores.filter((store) => store.region_id === region.code);
        return {
          name: region.name,
          id: region.code,
          count: matchingStores.length,
        };
      });

      setRegionCache(prev => ({ ...prev, [organizationId]: regionsWithCounts }));
      setRegions(regionsWithCounts);
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async (regionId) => {
    try {
      setLoading(true);
      if (storeCache[regionId]) {
        setStores(storeCache[regionId]);
        return;
      }

      const storeResponse = await axios.get(
        `http://127.0.0.1:3002/api/store?region_id=${regionId}`
      );
      const stores = storeResponse.data.data;

      const deviceResponse = await axios.get(
        "http://127.0.0.1:3002/api/device"
      );
      const devices = deviceResponse.data.data;

      const storesWithCounts = stores.map((store) => {
        const matchingDevices = devices.filter((device) => {
          return device.store_code === store.store_code;
        });
        return {
          name: store.store_name,
          id: store.store_code,
          count: matchingDevices.length,
          region_id: store.region_id,
        };
      });

      setStoreCache(prev => ({ ...prev, [regionId]: storesWithCounts }));
      setStores(storesWithCounts);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async (storeCode) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:3002/api/device?store_code=${storeCode}`
      );
      return response.data.data.map((device) => ({
        name: device.device_name,
        id: device._id,
        device_id: device.device_id,
        store_code: device.store_code,
      }));
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

const handleOrganizationSelect = (org) => {
  const newOrg = org === selectedOrg ? null : org;
  dispatch(clearDeviceFilter());
  dispatch(setDeviceFilter({ selectedOrg: newOrg }));
  if (newOrg) {
    fetchRegions(newOrg.id); // Fetch regions for the selected organization
  } else {
    setRegions([]);
    setStores([]);
    setDevices([]);
  }
};
  const handleRegionClick = async (region) => {
    try {
      // If clicking a different region, clear active store and devices
      if (activeRegion?.id !== region.id) {
        setActiveStore(null);
        setDevices([]);
      }
      
      setActiveRegion(region);
      await fetchStores(region.id);
    } catch (error) {
      console.error("Error loading region stores:", error);
    }
  };

  const handleStoreClick = async (store) => {
    try {
      setActiveStore(store);
      const storeDevices = await fetchDevices(store.id);
      setDevices(storeDevices);
    } catch (error) {
      console.error("Error loading store devices:", error);
    }
  };

  const handleRegionCheckbox = async (region, checked) => {
    try {
      if (checked) {
        // Fetch stores if not already fetched
        if (!stores.length) {
          await fetchStores(region.id);
        }
        
        // Select the region
        dispatch(setDeviceFilter({ selectedRegions: [...selectedRegions, region] }));
        
        // Select all stores in this region
        const regionStores = stores.filter(store => store.region_id === region.id);
        dispatch(setDeviceFilter({ selectedStores: [...selectedStores, ...regionStores] }));
        
        // Fetch and select all devices from these stores
        for (const store of regionStores) {
          const storeDevices = await fetchDevices(store.id);
          dispatch(setDeviceFilter({ selectedDevices: { ...selectedDevices, [store.id]: storeDevices } }));
        }
      } else {
        // Deselect region
        dispatch(setDeviceFilter({ selectedRegions: selectedRegions.filter(r => r.id !== region.id) }));
        
        // Deselect all stores in this region
        dispatch(setDeviceFilter({ selectedStores: selectedStores.filter(s => s.region_id !== region.id) }));
        
        // Remove all devices from these stores
        dispatch(setDeviceFilter({ selectedDevices: Object.fromEntries(Object.entries(selectedDevices).filter(([storeId, devices]) => !stores.find(store => store.id === storeId && store.region_id === region.id)) ) }));
      }
    } catch (error) {
      console.error("Error handling region checkbox:", error);
    }
  };

  const handleStoreCheckbox = async (store, checked) => {
    try {
      if (checked) {
        // Select the store
        dispatch(setDeviceFilter({ selectedStores: [...selectedStores, store] }));
        
        // Fetch and select all devices from this store
        const storeDevices = await fetchDevices(store.id);
        dispatch(setDeviceFilter({ selectedDevices: { ...selectedDevices, [store.id]: storeDevices } }));
      } else {
        // Deselect store
        dispatch(setDeviceFilter({ selectedStores: selectedStores.filter(s => s.id !== store.id) }));
        
        // Remove all devices from this store
        dispatch(setDeviceFilter({ selectedDevices: Object.fromEntries(Object.entries(selectedDevices).filter(([storeId, devices]) => storeId !== store.id)) }));
      }
    } catch (error) {
      console.error("Error handling store checkbox:", error);
    }
  };

  const handleDeviceCheckbox = (device, storeId, checked) => {
    if (checked) {
      dispatch(setDeviceFilter({ 
        selectedDevices: { 
          ...selectedDevices, 
          [storeId]: [...(selectedDevices[storeId] || []), {
            id: device.id,
            device_id: device.device_id,
            name: device.name,
            store_code: device.store_code
          }] 
        } 
      }));
    } else {
      const updatedDevices = { ...selectedDevices };
      updatedDevices[storeId] = selectedDevices[storeId].filter(d => d.id !== device.id);
      if (updatedDevices[storeId].length === 0) {
        delete updatedDevices[storeId];
      }
      dispatch(setDeviceFilter({ selectedDevices: updatedDevices }));
    }
  };

  const handleClearFilter = () => {
    dispatch(clearDeviceFilter());
    onFilterSelect({
      selectedDevices: {},
      selectedOrg: null,
      selectedRegions: [],
      selectedStores: []
    });
    setIsOpen(false);
  };

  const handleApplyFilter = () => {
    // If no devices are selected, this will show data from all devices
    const filterData = {
      selectedDevices: Object.keys(selectedDevices).length === 0 ? {} : selectedDevices,
      selectedOrg,
      selectedRegions,
      selectedStores
    };
    dispatch(setDeviceFilter(filterData));
    onFilterSelect(filterData);
    setIsOpen(false);
  };

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };
  // Count total selected devices
  const totalSelectedDevices = Object.values(selectedDevices).reduce(
    (total, storeDevices) => total + storeDevices.length,
    0
  );

  return (
    <div
      className="filter-container"
      ref={filterRef}
      role="dialog"
      aria-label="Device Filter"
    >
      <button
        className={`filter-button ${totalSelectedDevices > 0 ? "active" : ""}`}
        onClick={toggleFilter}
        aria-expanded={isOpen}
        aria-controls="filter-dropdown"
      >
        {totalSelectedDevices > 0 && `✓ `}Filter 🢓
      </button>

      {isOpen && (
        <div id="filter-dropdown" className="filter-dropdown">
          <div className="mobile-header">
            <h5>Filter Devices</h5>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close filter"
            >
              ×
            </button>
          </div>

          <div className="filter-sections-container">
            <CardBody className="p-0">
              <Row className="g-0 flex-column flex-md-row">
                {/* Organizations Column */}
                <Col xs="12" md="3" className="filter-section">
                  <h6 className="section-title">Organization</h6>
                  <CheckboxList
                    items={organizations}
                    selectedItems={selectedOrg ? [selectedOrg] : []}
                    onItemSelect={(org) => handleOrganizationSelect(org)}
                    getLabel={(org) => `${org.name} (${org.count})`}
                  />
                </Col>

                {/* Regions Column */}
                <Col xs="12" md="3" className="filter-section">
                  <h6 className="section-title">Region</h6>
                  <CheckboxList
                    items={regions}
                    selectedItems={selectedRegions}
                    onItemSelect={(region, checked) =>handleRegionCheckbox(region, checked)}
                    getLabel={(region) => `${region.name} (${region.count})`}
                    onItemClick={handleRegionClick}
                    activeItem={activeRegion}
                  />
                </Col>

                {/* Stores Column */}
                <Col xs="12" md="3" className="filter-section">
                  <h6 className="section-title">Store</h6>
                  <CheckboxList
                    items={stores}
                    selectedItems={selectedStores}
                    onItemSelect={(store, checked) =>
                      handleStoreCheckbox(store, checked)
                    }
                    getLabel={(store) => `${store.name} (${store.count})`}
                    onItemClick={handleStoreClick}
                    activeItem={activeStore}
                  />
                </Col>

                {/* Devices Column */}
                <Col xs="12" md="3" className="filter-section">
                  <h6 className="section-title">Device</h6>
                  <CheckboxList
                    items={devices}
                    selectedItems={selectedDevices[activeStore?.id] || []}
                    onItemSelect={(device, checked) =>
                      handleDeviceCheckbox(device, activeStore?.id, checked)
                    }
                    getLabel={(device) => device.name}
                  />
                </Col>
              </Row>
            </CardBody>
          </div>

          {/* Apply Filter Button */}
          <div className="filter-apply-section text-center">
            <button
              className="btn btn-primary m-r-15"
              onClick={handleApplyFilter}
              aria-label={`Apply filter with ${totalSelectedDevices} devices selected`}
            >
              Apply Filter ({totalSelectedDevices} Devices)
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClearFilter}
              aria-label="Clear filter"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceFilter;