import React, { useState, useEffect, useMemo } from "react";
import { FormGroup } from "reactstrap";
import axios from "axios";
import config from "../../../config";
import "./LocationSelector.css";

const LocationSelector = ({ onChange, value, excludeArchived = false }) => {
  const [organizations, setOrganizations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stores, setStores] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeRegion, setActiveRegion] = useState(null);
  const [activeStore, setActiveStore] = useState(null);
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [expandedStore, setExpandedStore] = useState(null);

  const [selectedItems, setSelectedItems] = useState({
    organizations: {},
    regions: {},
    stores: {},
    devices: {},
  });

  // Cache for API data
  const [allRegions, setAllRegions] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [allDevices, setAllDevices] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch organizations
        const orgResponse = await axios.get(`${config.hostname}/organization`);
        setOrganizations(orgResponse.data.data);

        // Fetch all regions
        const regionsResponse = await axios.get(`${config.hostname}/region`);
        const regionsData = regionsResponse.data.data.map((region) => ({
          ...region,
          id: region.code,
          name: region.name,
        }));
        setAllRegions(regionsData);

        // Fetch all stores
        const storesResponse = await axios.get(`${config.hostname}/store`);
        const storesData = storesResponse.data.data.map((store) => ({
          ...store,
          id: store.store_code,
          name: store.store_name,
        }));
        setAllStores(storesData);

        // Fetch all devices
        const devicesResponse = await axios.get(`${config.hostname}/device`);
        const devicesData = devicesResponse.data.data.map((device) => ({
          ...device,
          id: device._id,
          name: device.device_name,
        }));
        setAllDevices(devicesData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter data based on selections
  const fetchRegions = () => {
    setRegions(allRegions);
  };

  const fetchStores = (regionId) => {
    const filteredStores = allStores.filter(
      (store) => store.region_id === regionId
    );
    setStores(filteredStores);
  };

  const fetchDevices = (storeCode) => {
    console.log("Fetching devices for store:", storeCode);
    const filteredDevices = allDevices.filter(
      (device) => device.store_code === storeCode
    );
    console.log("Filtered devices:", filteredDevices);
    setDevices(filteredDevices);
  };

  const handleOrganizationClick = (org) => {
    try {
      // Toggle expansion state
      const isExpanding = expandedOrg !== org._id;
      setExpandedOrg(isExpanding ? org._id : null);

      // Clear child expansions when collapsing
      if (!isExpanding) {
        setExpandedRegion(null);
        setExpandedStore(null);
      } else {
        // Show regions if expanding
        fetchRegions();
      }
    } catch (error) {
      console.error("Error loading organization regions:", error);
    }
  };

  const handleRegionClick = (region) => {
    try {
      // Toggle expansion state
      const isExpanding = expandedRegion !== region.id;
      setExpandedRegion(isExpanding ? region.id : null);

      // Clear store expansion when collapsing
      if (!isExpanding) {
        setExpandedStore(null);
      } else {
        // Show stores if expanding
        fetchStores(region.id);
      }
    } catch (error) {
      console.error("Error loading region stores:", error);
    }
  };

  const handleStoreClick = (store) => {
    try {
      const isExpanding = expandedStore !== store.id;
      setExpandedStore(isExpanding ? store.id : null);

      if (isExpanding) {
        fetchDevices(store.id);
      }
    } catch (error) {
      console.error("Error handling store click:", error);
    }
  };

  const handleOrganizationCheckbox = (org, checked) => {
    const id = org._id;

    try {
      if (checked) {
        // Get regions
        fetchRegions();

        // Select all regions
        const newRegions = {};
        const newStores = {};
        const newDevices = {};

        // Select all regions and their children
        allRegions.forEach((region) => {
          newRegions[region.id] = true;

          // Select all stores for this region
          const regionStores = allStores.filter(
            (store) => store.region_id === region.id
          );
          regionStores.forEach((store) => {
            newStores[store.id] = true;

            // Select all devices for this store
            const storeDevices = allDevices.filter(
              (device) => device.store_code === store.id
            );
            storeDevices.forEach((device) => {
              newDevices[device.id] = true;
            });
          });
        });

        setSelectedItems({
          organizations: { [id]: true },
          regions: newRegions,
          stores: newStores,
          devices: newDevices,
        });
      } else {
        // Deselect everything
        setSelectedItems({
          organizations: {},
          regions: {},
          stores: {},
          devices: {},
        });
      }

      onChange(selectedItems);
    } catch (error) {
      console.error("Error handling organization checkbox:", error);
    }
  };

  const handleRegionCheckbox = (region, checked) => {
    const regionId = region.id;

    try {
      if (checked) {
        // Get stores for this region
        const newStores = {};
        const newDevices = {};

        // Select all stores and their devices
        const regionStores = allStores.filter(
          (store) => store.region_id === regionId
        );
        regionStores.forEach((store) => {
          newStores[store.id] = true;

          // Select all devices for this store
          const storeDevices = allDevices.filter(
            (device) => device.store_code === store.id
          );
          storeDevices.forEach((device) => {
            newDevices[device.id] = true;
          });
        });

        setSelectedItems((prev) => ({
          ...prev,
          regions: { ...prev.regions, [regionId]: true },
          stores: { ...prev.stores, ...newStores },
          devices: { ...prev.devices, ...newDevices },
        }));
      } else {
        // Deselect region and all its children
        const newSelectedItems = { ...selectedItems };
        newSelectedItems.regions[regionId] = false;

        // Remove all stores and their devices for this region
        allStores
          .filter((store) => store.region_id === regionId)
          .forEach((store) => {
            delete newSelectedItems.stores[store.id];
            allDevices
              .filter((device) => device.store_code === store.id)
              .forEach((device) => {
                delete newSelectedItems.devices[device.id];
              });
          });

        setSelectedItems(newSelectedItems);
      }

      onChange(selectedItems);
    } catch (error) {
      console.error("Error handling region checkbox:", error);
    }
  };

  const handleStoreCheckbox = (store, checked) => {
    try {
      // Get all devices for this store from allDevices
      const storeDevices = allDevices.filter(
        (device) => device.store_code === store.id
      );
      console.log("Store devices:", storeDevices);

      const newSelectedItems = {
        ...selectedItems,
        stores: {
          ...selectedItems.stores,
          [store.id]: checked,
        },
        devices: {
          ...selectedItems.devices,
          ...storeDevices.reduce(
            (acc, device) => ({
              ...acc,
              [device.id]: checked,
            }),
            {}
          ),
        },
      };

      console.log("New selected items:", newSelectedItems);
      setSelectedItems(newSelectedItems);
      onChange(newSelectedItems);
    } catch (error) {
      console.error("Error handling store checkbox:", error);
    }
  };

  const handleDeviceCheckbox = (device, checked) => {
    try {
      const newSelectedItems = {
        ...selectedItems,
        devices: {
          ...selectedItems.devices,
          [device.id]: checked,
        },
      };

      console.log("Device selection:", { device, checked, newSelectedItems });
      setSelectedItems(newSelectedItems);
      onChange(newSelectedItems);
    } catch (error) {
      console.error("Error handling device checkbox:", error);
    }
  };

  const renderItem = (item, type, level = 0) => {
    const isSelected = selectedItems[type][item.id];
    const getItemName = (item) => {
      switch (type) {
        case "organizations":
          return item.company;
        case "regions":
          return item.name;
        case "stores":
          return item.store_name;
        case "devices":
          return item.device_name;
        default:
          return "";
      }
    };

    const isExpanded =
      type === "organizations"
        ? expandedOrg === item._id
        : type === "regions"
        ? expandedRegion === item.id
        : type === "stores"
        ? expandedStore === item.id
        : false;

    return (
      <div
        key={item.id || item._id}
        className={`location-item ${level > 0 ? "nested" : ""}`}
      >
        <div
          className="location-header"
          onClick={() => {
            if (type === "organizations") handleOrganizationClick(item);
            else if (type === "regions") handleRegionClick(item);
            else if (type === "stores") handleStoreClick(item);
          }}
        >
          <div
            className="checkbox-container"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (type === "organizations")
                  handleOrganizationCheckbox(item, e.target.checked);
                else if (type === "regions")
                  handleRegionCheckbox(item, e.target.checked);
                else if (type === "stores")
                  handleStoreCheckbox(item, e.target.checked);
                else if (type === "devices")
                  handleDeviceCheckbox(item, e.target.checked);
              }}
            />
          </div>
          {type !== "devices" && (
            <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
              ▶
            </span>
          )}
          <span className="item-name">{getItemName(item)}</span>
        </div>

        {type === "organizations" && isExpanded && (
          <div className="location-children">
            {regions.map((region) => renderItem(region, "regions", level + 1))}
          </div>
        )}
        {type === "regions" && isExpanded && (
          <div className="location-children">
            {stores.map((store) => renderItem(store, "stores", level + 1))}
          </div>
        )}
        {type === "stores" && isExpanded && (
          <div className="location-children">
            {devices.map((device) => renderItem(device, "devices", level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="location-selector border">
      <FormGroup>
        {organizations.map((org) => (
          <div key={org._id} className="location-item">
            <div
              className="location-header"
              onClick={() => handleOrganizationClick(org)}
            >
              <div
                className="checkbox-container"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={!!selectedItems.organizations[org._id]}
                  onChange={(e) =>
                    handleOrganizationCheckbox(org, e.target.checked)
                  }
                />
              </div>
              <span
                className={`expand-icon ${
                  expandedOrg === org._id ? "expanded" : ""
                }`}
              >
                ▶
              </span>
              <span className="item-name">{org.company}</span>
            </div>
            {expandedOrg === org._id && (
              <div className="location-children">
                {regions.map((region) => renderItem(region, "regions", 1))}
              </div>
            )}
          </div>
        ))}
      </FormGroup>
      {excludeArchived && (
        <div className="exclude-archived">
          <input
            type="checkbox"
            id="excludeArchived"
            checked={excludeArchived}
            readOnly
          />
          <label htmlFor="excludeArchived">
            Exclude archived locations and analytics from report
          </label>
        </div>
      )}
      {loading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
};

export default LocationSelector;
