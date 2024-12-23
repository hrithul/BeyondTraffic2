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
import { Image, H6, P } from "../../../../../AbstractElements";
import axios from "axios";
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
      const response = await axios.get("http://localhost:3002/api/store");
      if (response.data && response.data.success) {
        setOrgList(response.data.data);
      } else {
        throw new Error("Failed to fetch store data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch region data from the backend
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
        `http://localhost:3002/api/store/${selectedItem._id}`,
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
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Failed to update store',
        confirmButtonText: 'OK'
      });
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
          `http://localhost:3002/api/store/${id}`
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
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Failed to delete store',
          confirmButtonText: 'OK'
        });
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
