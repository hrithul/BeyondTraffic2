import React, { Fragment, useEffect, useState } from "react";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import { H6, P } from "../../../../../AbstractElements";
import axios from "axios";
import Swal from "sweetalert2";

const DeviceManager = ({ callback = () => {} }) => {
  const [deviceList, setDeviceList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [orgList, setOrgList] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editModal, setEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [active, setActive] = useState(false);
  const [filteredStores, setFilteredStores] = useState([]);

  const toggleEditModal = () => {
    setEditModal(!editModal);
    setFilteredStores([]);
  };

  // Handle region selection change
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    console.log("Selected Region Code:", regionCode);
    
    // Find the region object
    const selectedRegionObj = regionList.find(region => region.code === regionCode);
    if (!selectedRegionObj) {
      console.error("Region not found:", regionCode);
      return;
    }
    
    setRegionId(regionCode);
    setStoreCode(""); // Reset store selection when region changes
    
    // Filter stores based on selected region's code
    if (regionCode) {
      console.log("Filtering stores for region:", regionCode);
      const storesInRegion = storeList.filter(store => {
        console.log("Store:", store);
        return store.region_id === regionCode;
      });
      console.log("Filtered Stores:", storesInRegion);
      setFilteredStores(storesInRegion);
      
      if (storesInRegion.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Stores Found",
          text: "No stores available in the selected region",
          timer: 2000,
          toast: true,
          position: "top-end",
          showConfirmButton: false
        });
      }
    } else {
      setFilteredStores([]);
    }
  };

  const fetchDeviceData = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/device");
      if (response.data && response.data.success) {
        setDeviceList(response.data.data);
      } else {
        throw new Error("Failed to fetch device data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreData = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/store");
      if (response.data && response.data.success) {
        setStoreList(response.data.data);
      } else {
        throw new Error("Failed to fetch store data");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRegionData = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/region");
      if (response.data && response.data.success) {
        setRegionList(response.data.data);
      } else {
        throw new Error("Failed to fetch region data");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchOrgData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/organization"
      );
      if (response.data && response.data.success) {
        setOrgList(response.data.data);
      } else {
        throw new Error("Failed to fetch organization data");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchDeviceData();
    fetchStoreData();
    fetchRegionData();
    fetchOrgData();

    // Set up intervals for real-time updates
    const deviceInterval = setInterval(() => {
      fetchDeviceData();
    }, 2000);

    const storeInterval = setInterval(() => {
      fetchStoreData();
    }, 2000);

    const regionInterval = setInterval(() => {
      fetchRegionData();
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(deviceInterval);
      clearInterval(storeInterval);
      clearInterval(regionInterval);
    };
  }, []); // Empty dependency array since we're using intervals

  const handleEdit = (device) => {
    setSelectedDevice(device);
    setDeviceId(device.device_id);
    setDeviceName(device.device_name);
    setMacAddress(device.mac_address);
    setIpAddress(device.ip_address);
    setSerialNumber(device.serial_number);
    setStoreCode(device.store_code);
    setOrganizationId(device.organization_id);
    setRegionId(device.region_id);
    setActive(device.active);
    toggleEditModal();
  };

  const handleUpdate = async () => {
    // Validate required fields
    if (!deviceId || !deviceName || !regionId || !storeCode) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields',
        text: 'Please fill in all required fields',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      // Check if device ID already exists (excluding current device)
      const deviceResponse = await axios.get("http://localhost:3002/api/device");
      const existingDevices = deviceResponse.data.data;
      
      const deviceWithSameId = existingDevices.find(
        device => device.device_id === deviceId && device._id !== selectedDevice._id
      );

      if (deviceWithSameId) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Device ID',
          text: 'This Device ID is already in use. Please choose a different one.',
          confirmButtonText: 'OK'
        });
        return;
      }

      const updatedData = {
        device_id: deviceId,
        device_name: deviceName,
        mac_address: macAddress,
        ip_address: ipAddress,
        serial_number: serialNumber,
        store_code: storeCode,
        organization_id: organizationId,
        region_id: regionId,
        active,
      };
      const response = await axios.put(
        `http://localhost:3002/api/device/${selectedDevice._id}`,
        updatedData
      );
      if (response.data.success) {
        fetchDeviceData();
        toggleEditModal();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Device updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error("Failed to update device data");
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Failed to update device',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! This device will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://localhost:3002/api/device/${id}`
        );
        if (response.data.success) {
          fetchDeviceData();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Device has been deleted successfully.',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error("Failed to delete device");
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Failed to delete device',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleDeviceIdChange = async (e) => {
    const newDeviceId = e.target.value;
    setDeviceId(newDeviceId);

    if (newDeviceId && newDeviceId !== selectedDevice.device_id) {
      try {
        const response = await axios.get("http://localhost:3002/api/device");
        const existingDevices = response.data.data;
        
        const deviceWithSameId = existingDevices.find(
          device => device.device_id === newDeviceId && device._id !== selectedDevice._id
        );

        if (deviceWithSameId) {
          Swal.fire({
            icon: 'warning',
            title: 'Device ID Already Exists',
            text: 'This Device ID is already in use. Please choose a different one.',
            timer: 2000,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error("Error checking device ID:", error);
      }
    }
  };

  if (loading) {
    return <P>Loading...</P>;
  }

  if (error) {
    return <P>Error: {error}</P>;
  }

  return (
    <Fragment>
      <Col xl="12" md="12">
        <Nav
          className="flex-column nav-pills"
          id="v-pills-tab1"
          role="tablist"
          aria-orientation="vertical"
        >
          {deviceList.map((device, i) => (
            <NavItem id="myTab" role="tablist" key={i}>
              <NavLink
                href="#javaScript"
                className={activeTab === device.device_id ? "active" : ""}
                onClick={() => {
                  setActiveTab(device.device_id);
                  callback(device.device_id);
                }}
              >
                <div className="media">
                  <div
                    className="media-body"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <H6>Device Name: {device.device_name}</H6>
                      <P>Device ID: {device.device_id}</P>
                      <P>MAC Address: {device.mac_address}</P>
                      <P>IP Address: {device.ip_address}</P>
                      <P>Store Code: {device.store_code || "N/A"}</P>
                      <P>Organization ID: {device.organization_id || "N/A"}</P>
                      <P>Region ID: {device.region_id || "N/A"}</P>
                      <P>Active: {device.active === "true" ? "Yes" : "No"}</P>
                    </div>
                    <div>
                      <Button
                        color="primary"
                        size="sm"
                        onClick={() => handleEdit(device)}
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(device._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </NavLink>
            </NavItem>
          ))}
        </Nav>
      </Col>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal}>Edit Device</ModalHeader>
        <ModalBody>
          <div className="form-group mb-3">
            <label className="form-label">Device ID</label>
            <Input
              type="text"
              className={`form-control ${!deviceId ? 'is-invalid' : ''}`}
              value={deviceId}
              onChange={handleDeviceIdChange}
              placeholder="Enter device ID"
            />
            {!deviceId && <div className="invalid-feedback">Device ID is required</div>}
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Device Name</label>
            <Input
              type="text"
              className={`form-control ${!deviceName ? 'is-invalid' : ''}`}
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Enter device name"
            />
            {!deviceName && <div className="invalid-feedback">Device name is required</div>}
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Region</label>
            <Input
              type="select"
              className={`form-control ${!regionId ? 'is-invalid' : ''}`}
              value={regionId}
              onChange={handleRegionChange}
            >
              <option value="">Select Region</option>
              {regionList.map((region) => (
                <option key={region._id} value={region.code}>
                  {region.name} - {region.code}
                </option>
              ))}
            </Input>
            {!regionId && <div className="invalid-feedback">Please select a region</div>}
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Store</label>
            <Input
              type="select"
              className={`form-control ${!storeCode && regionId ? 'is-invalid' : ''}`}
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              disabled={!regionId}
            >
              <option value="">Select Store</option>
              {filteredStores.map((store) => (
                <option key={store._id} value={store.store_code}>
                  {store.store_name} - {store.store_code}
                </option>
              ))}
            </Input>
            {!storeCode && regionId && <div className="invalid-feedback">Please select a store</div>}
          </div>

          <div className="form-group mb-3">
            <label className="form-label">MAC Address</label>
            <Input
              type="text"
              className="form-control"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">IP Address</label>
            <Input
              type="text"
              className="form-control"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Serial Number</label>
            <Input
              type="text"
              className="form-control"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Status</label>
            <Input
              type="select"
              className="form-control"
              value={active}
              onChange={(e) => setActive(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Input>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdate}>
            Update
          </Button>
          <Button color="secondary" onClick={toggleEditModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default DeviceManager;
