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
import defaultuser from "../../../../assets/images/user/user.png";
import config from "../../../../config";
const CreateStore = () => {
  const [modal, setModal] = useState(false);
  const [regionData, setRegionData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(""); // State to store selected region
  const [organizationId, setOrganizationId] = useState(""); // State to store organization_id

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  const toggle = () => {
    setModal(!modal);
    setSelectedRegion(""); // Reset selected region when modal is toggled
    clearErrors(); // Clear any existing form errors
  };

  // Fetch region data from the API
  const fetchRegionData = async () => {
    try {
      const response = await fetch(config.hostname+"/region");
      const result = await response.json();
      if (response.ok) {
        setRegionData(result.data);
      } else {
        console.error("Failed to fetch region data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching region data:", error);
    }
  };

  // Fetch organization data
  const fetchOrganizationId = async () => {
    try {
      const response = await fetch(config.hostname+"/organization");
      const result = await response.json();
      if (response.ok && result.data && result.data.length > 0) {
        setOrganizationId(result.data[0]._id);
      } else {
        console.error("Failed to fetch organization data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchOrganizationId();
    fetchRegionData();

    // Set up interval for region data
    const regionInterval = setInterval(() => {
      fetchRegionData();
    }, 2000); // Check every 2 seconds

    // Cleanup
    return () => {
      clearInterval(regionInterval);
    };
  }, []); // Empty dependency array since we're using intervals

  const validateStoreCode = (code) => {
    const codeRegex = /^[A-Z0-9]{3,6}$/;
    return codeRegex.test(code) || "Store code must be 3-6 characters (letters and numbers)";
  };

  // Function to handle API call for creating a store
  const AddContact = async (data) => {
    if (!selectedRegion) {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please select a region before creating the store",
        confirmButtonText: "OK",
      });
      return;
    }

    // Find the region object to get its ID
    const selectedRegionObj = regionData.find((region) => region.code === selectedRegion);
    if (!selectedRegionObj) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Selected region not found",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      // Check if store code already exists
      const checkResponse = await fetch(config.hostname+"/store");
      const existingStores = await checkResponse.json();
      
      if (existingStores.data.some(store => store.store_code === data.store_code.toUpperCase())) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Store code already exists",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6"
        });
        return;
      }

      const response = await fetch(config.hostname+"/store/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_id: organizationId,
          region_id: selectedRegionObj.code,
          store_code: data.store_code.toUpperCase(),
          store_name: data.store_name.trim(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Store created successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        setModal(false);
      } else {
        throw new Error(result.message || "Error creating Store");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to create Store",
        confirmButtonText: "OK",
      });
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
        New Store
      </Btn>

      <Modal
        className="modal-bookmark"
        isOpen={modal}
        toggle={toggle}
        size="lg"
      >
        <ModalHeader toggle={toggle}>Add Store</ModalHeader>
        <ModalBody>
          <Form
            className="form-bookmark needs-validation"
            onSubmit={handleSubmit(AddContact)}
          >
            <div className="form-row">
              <FormGroup className="col-md-12">
                <Label>Region</Label>
                <Input
                  type="select"
                  name="region_code"
                  value={selectedRegion}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedRegion(value);
                    if (!value) {
                      Swal.fire({
                        icon: "warning",
                        title: "Required Field",
                        text: "Please select a region",
                        timer: 2000,
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                      });
                    }
                  }}
                  className={`form-control ${!selectedRegion ? "is-invalid" : ""}`}
                  required
                >
                  <option value="">Select Region</option>
                  {regionData && regionData.length > 0 ? (
                    regionData.map((region) => (
                      <option key={region._id} value={region.code}>
                        {region.name} - {region.code}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading regions...
                    </option>
                  )}
                </Input>
                {!selectedRegion && (
                  <div className="invalid-feedback">Please select a region</div>
                )}
              </FormGroup>
              <FormGroup className="col-md-12">
                <Label>Store Name</Label>
                <input
                  className={`form-control ${errors.store_name ? "is-invalid" : ""}`}
                  name="store_name"
                  type="text"
                  placeholder="e.g., Mall of Travancore"
                  {...register("store_name", {
                    required: "Store name is required",
                    minLength: { 
                      value: 3, 
                      message: "Store name must be at least 3 characters" 
                    },
                    maxLength: { 
                      value: 50, 
                      message: "Store name must not exceed 50 characters" 
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9\s-]+$/,
                      message: "Store name can only contain letters, numbers, spaces and hyphens"
                    }
                  })}
                />
                {errors.store_name && (
                  <div className="invalid-feedback d-block">
                    {errors.store_name.message}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="col-md-12">
                <Label>Store Code</Label>
                <input
                  className={`form-control ${errors.store_code ? "is-invalid" : ""}`}
                  name="store_code"
                  type="text"
                  placeholder="e.g., MOT01"
                  {...register("store_code", {
                    required: "Store code is required",
                    validate: validateStoreCode,
                    setValueAs: (value) => value.toUpperCase()
                  })}
                />
                {errors.store_code && (
                  <div className="invalid-feedback d-block">
                    {errors.store_code.message}
                  </div>
                )}
              </FormGroup>
            </div>

            <Btn attrBtn={{ color: "secondary", className: "me-2" }} type="submit">
              Save
            </Btn>
            <Btn attrBtn={{ color: "primary", onClick: toggle }}>
              Cancel
            </Btn>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default CreateStore;
