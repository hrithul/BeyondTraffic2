import React, { Fragment, useState, useEffect, useCallback } from "react";
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
import { Image, H6, P } from "../../../../../AbstractElements";
import axios from "../../../../../utils/axios";
import config from "../../../../../config";
import Swal from "sweetalert2";

const StoreManager = ({ callback = () => {} }) => {
  const [orgList, setOrgList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [orgactiveTab, setOrgActiveTab] = useState("1");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatedStoreName, setUpdatedStoreName] = useState("");
  const [updatedStoreCode, setUpdatedStoreCode] = useState("");
  const [updatedOrganizationId, setUpdatedOrganizationId] = useState("");
  const [updatedRegionId, setUpdatedRegionId] = useState("");

  const toggleEditModal = () => setEditModal(!editModal);

  // Fetch organization and region data
  const fetchOrgData = async () => {
    try {
      const response = await axios.get(`/store`);
      if (response.data && response.data.success) {
        setOrgList(response.data.data);
      } else {
        throw new Error("Failed to fetch store data");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to fetch store data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch region data from the backend
  const fetchRegionData = async () => {
    try {
      const response = await axios.get(`/region`);
      if (response.data && response.data.success) {
        setRegionList(response.data.data); 
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

  const handleEdit = (item) => {
    setSelectedItem(item);
    setUpdatedStoreName(item.store_name);
    setUpdatedStoreCode(item.store_code);
    setUpdatedOrganizationId(item.organization_id);
    setUpdatedRegionId(item.region_id);
    toggleEditModal();
  };

  const handleUpdate = async () => {
    try {
      const updatedData = {
        store_name: updatedStoreName,
        store_code: updatedStoreCode,
        organization_id: updatedOrganizationId,
        region_id: updatedRegionId,
      };
      const response = await axios.put(
        `/store/${selectedItem._id}`,
        updatedData
      );
      if (response.data.success) {
        fetchOrgData();
        toggleEditModal();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Store updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error("Failed to update store data");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to update store data");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `/store/${id}`
        );
        if (response.data.success) {
          fetchOrgData();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Store has been deleted.',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error("Failed to delete store");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError(error.response?.data?.message || "Failed to delete store");
        }
      }
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchOrgData();
    fetchRegionData();

    // Set up intervals for both region and store data
    const regionInterval = setInterval(() => {
      fetchRegionData();
    }, 2000);

    const storeInterval = setInterval(() => {
      fetchOrgData();
    }, 2000);

    // Cleanup both intervals
    return () => {
      clearInterval(regionInterval);
      clearInterval(storeInterval);
    };
  }, []); // Empty dependency array since we're using intervals

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
          {orgList.map((item, i) => (
            <NavItem id="myTab" role="tablist" key={i}>
              <NavLink
                href="#javaScript"
                className={orgactiveTab === item.store_code ? "active" : ""}
                onClick={() => {
                  setOrgActiveTab(item.store_code);
                  callback(item.store_code);
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
                      <H6>Store Name: {item.store_name}</H6>
                      <P>Store Code: {item.store_code}</P>
                      <P>Organization ID: {item.organization_id || "N/A"}</P>
                      <P>Region ID: {item.region_id || "N/A"}</P>
                    </div>
                    <div>
                      <Button
                        color="primary"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
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
        <ModalHeader toggle={toggleEditModal}>Edit Store</ModalHeader>
        <ModalBody>
          <label htmlFor="storeName">Store Name:</label>
          <Input
            type="text"
            value={updatedStoreName}
            onChange={(e) => setUpdatedStoreName(e.target.value)}
            placeholder="Enter store name"
          />
          <label htmlFor="storeCode">Store Code:</label>
          <Input
            type="text"
            value={updatedStoreCode}
            onChange={(e) => setUpdatedStoreCode(e.target.value)}
            placeholder="Enter store code"
          />
          <label htmlFor="regionId">Region ID:</label>
          <Input
            type="select"
            value={updatedRegionId}
            onChange={(e) => setUpdatedRegionId(e.target.value)}
          >
            <option value="">Select Region</option>
            {regionList.map((region) => (
              <option key={region._id} value={region.code}>
                {region.code} - {region.name}
              </option>
            ))}
          </Input>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdate}>
            Save
          </Button>
          <Button color="secondary" onClick={toggleEditModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default StoreManager;
