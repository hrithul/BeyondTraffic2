import { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import {
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  FormGroup,
  Form,
} from "reactstrap";
import { Btn } from "../../../../AbstractElements";
import { Users } from "react-feather";
import Swal from "sweetalert2";
import axios from "../../../../utils/axios";
import config from "../../../../config";

const CreateDevice = () => {
  const [modal, setModal] = useState(false);
  const [regionData, setRegionData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [active, setActive] = useState("true");
  const [filteredStores, setFilteredStores] = useState([]);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm();

  const toggle = () => {
    setModal(!modal);
    clearErrors();
    setSelectedRegion("");
    setSelectedStore("");
    setFilteredStores([]);
  };

  // Fetch region data
  const fetchRegionData = async () => {
    try {
      const response = await axios.get(`/region`);
      if (response.data && response.data.success) {
        setRegionData(response.data.data);
      } else {
        throw new Error("Failed to fetch region data");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to fetch region data");
      }
    }
  };

  // Fetch store data
  const fetchStoreData = async () => {
    try {
      const response = await axios.get(`/store`);
      if (response.data && response.data.success) {
        setStoreData(response.data.data);
      } else {
        throw new Error("Failed to fetch store data");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to fetch store data");
      }
    }
  };

  // Fetch organization data
  const fetchOrganizationId = async () => {
    try {
      const response = await axios.get(`/organization`);
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.length > 0) {
          setOrganizationId(response.data.data[0]._id);
        } else {
          throw new Error("No organization data found");
        }
      } else {
        throw new Error("Failed to fetch organization data");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to fetch organization data");
      }
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchOrganizationId();
    fetchRegionData();
    fetchStoreData();

    // Set up intervals for region and store data
    const regionInterval = setInterval(() => {
      fetchRegionData();
    }, 2000);

    const storeInterval = setInterval(() => {
      fetchStoreData();
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(regionInterval);
      clearInterval(storeInterval);
    };
  }, []); // Empty dependency array since we're using intervals

  // Handle region selection change
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    
    // Find the region object to get its ID
    const selectedRegionObj = regionData.find(region => region.code === regionCode);
    if (!selectedRegionObj) {
      console.error("Region not found:", regionCode);
      return;
    }
    
    setSelectedRegion(regionCode);
    setSelectedStore(""); // Reset store selection when region changes
    
    // Filter stores based on selected region's ID or code (for backward compatibility)
    if (regionCode) {
      const storesInRegion = storeData.filter(store => {
        // Check both region_id formats (MongoDB ID or region code)
        return store.region_id === selectedRegionObj._id || store.region_id === regionCode;
      });
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

  // Function to handle API call for creating a device
  const AddDevice = async (data) => {
    try {
      // Check if device ID already exists
      const checkResponse = await axios.get(`/device`);
      const existingDevices = checkResponse.data.data;
      
      if (existingDevices.some(device => device.device_id === data.device_id)) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Device ID already exists",
          confirmButtonText: "OK",
        });
        return;
      }

      const response = await axios.post(`/device/create`, {
        organization_id: organizationId,
        region_id: selectedRegion,
        store_code: selectedStore,
        device_id: data.device_id,
        device_name: data.device_name,
        mac_address: data.mac_address,
        ip_address: data.ip_address,
        serial_number: data.serial_number,
        active: active,
      });

      if (response.data && response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Device created successfully",
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
          toast: true,
        });
        setModal(false);
        reset();
      } else {
        throw new Error(response.data.message || "Error creating device");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to create device");
      }
    }
  };

  return (
    <Fragment>
      <Btn
        attrBtn={{
          className:
            "badge-light-primary align-items-center btn-mail d-flex justify-content-start w-100 emptyContact",
          color: "",
          onClick: toggle,
        }}
      >
        <Users className="me-2" />
        New Device
      </Btn>

      <Modal
        className="modal-bookmark"
        isOpen={modal}
        toggle={toggle}
        size="lg"
      >
        <ModalHeader toggle={toggle}>Add Device</ModalHeader>
        <ModalBody>
          <Form
            className="form-bookmark needs-validation"
            onSubmit={handleSubmit(AddDevice)}
          >
            <div className="form-row">
              <FormGroup className="col-md-12">
                <Label>Device ID</Label>
                <input
                  className={`form-control ${errors.device_id ? "is-invalid" : ""}`}
                  name="device_id"
                  type="text"
                  placeholder="Enter device ID"
                  {...register("device_id", {
                    required: "Device ID is required",
                  })}
                />
                {errors.device_id && (
                  <div className="invalid-feedback d-block">
                    {errors.device_id.message}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="col-md-12">
                <Label>Device Name</Label>
                <input
                  className={`form-control ${errors.device_name ? "is-invalid" : ""}`}
                  name="device_name"
                  type="text"
                  placeholder="Enter device name"
                  {...register("device_name", {
                    required: "Device name is required",
                  })}
                />
                {errors.device_name && (
                  <div className="invalid-feedback d-block">
                    {errors.device_name.message}
                  </div>
                )}
              </FormGroup>
              
              <FormGroup className="col-md-12">
                <Label>Region</Label>
                <Input
                  type="select"
                  name="region_id"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  className={`form-control ${
                    !selectedRegion ? "is-invalid" : ""
                  }`}
                >
                  <option value="">Select Region</option>
                  {regionData.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name} - {region.code}
                    </option>
                  ))}
                </Input>
                {!selectedRegion && (
                  <div className="invalid-feedback">Please select a region</div>
                )}
              </FormGroup>

              <FormGroup className="col-md-12">
                <Label>Store</Label>
                <Input
                  type="select"
                  name="store_code"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className={`form-control ${
                    !selectedStore ? "is-invalid" : ""
                  }`}
                  disabled={!selectedRegion}
                >
                  <option value="">Select Store</option>
                  {filteredStores.map((store) => (
                    <option key={store._id} value={store.store_code}>
                      {store.store_name} - {store.store_code}
                    </option>
                  ))}
                </Input>
                {!selectedStore && selectedRegion && (
                  <div className="invalid-feedback">Please select a store</div>
                )}
              </FormGroup>

              <FormGroup className="col-md-12">
                <Label>MAC Address</Label>
                <input
                  className={`form-control ${errors.mac_address ? "is-invalid" : ""}`}
                  name="mac_address"
                  type="text"
                  placeholder="Enter MAC address"
                  {...register("mac_address", {
                    required: "MAC address is required",
                  })}
                />
                {errors.mac_address && (
                  <div className="invalid-feedback d-block">
                    {errors.mac_address.message}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="col-md-12">
                <Label>IP Address</Label>
                <input
                  className={`form-control ${errors.ip_address ? "is-invalid" : ""}`}
                  name="ip_address"
                  type="text"
                  placeholder="Enter IP address"
                  {...register("ip_address", {
                    required: "IP address is required",
                  })}
                />
                {errors.ip_address && (
                  <div className="invalid-feedback d-block">
                    {errors.ip_address.message}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="col-md-12">
                <Label>Serial Number</Label>
                <input
                  className={`form-control ${errors.serial_number ? "is-invalid" : ""}`}
                  name="serial_number"
                  type="text"
                  placeholder="Enter serial number"
                  {...register("serial_number", {
                    required: "Serial number is required",
                  })}
                />
                {errors.serial_number && (
                  <div className="invalid-feedback d-block">
                    {errors.serial_number.message}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="col-md-12">
                <Label>Status</Label>
                <Input
                  type="select"
                  name="active"
                  value={active}
                  onChange={(e) => setActive(e.target.value)}
                  className="form-control"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Input>
              </FormGroup>
            </div>

            <Btn
              attrBtn={{
                type: "submit",
                color: "secondary",
                className: "me-2",
              }}
            >
              Save
            </Btn>
            <Btn attrBtn={{ color: "primary", onClick: toggle }}>Cancel</Btn>
          </Form>
          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default CreateDevice;
