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

const RegionManager = ({ callback = () => {} }) => {
  const [orgList, setOrgList] = useState([]);
  const [orgactiveTab, setOrgActiveTab] = useState("1");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatedRegionName, setUpdatedRegionName] = useState("");
  const [updatedRegionCode, setUpdatedRegionCode] = useState("");

  const toggleEditModal = () => setEditModal(!editModal);

  const fetchOrgData = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/region/");
      if (response.data && response.data.success) {
        setOrgList(response.data.data);
        console.log("Org List:", orgList);
      } else {
        throw new Error("Failed to fetch store data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setUpdatedRegionName(item.name);
    setUpdatedRegionCode(item.code);
    toggleEditModal();
  };

  const handleUpdate = async () => {
    try {
      const updatedData = {
        name: updatedRegionName,
        code: updatedRegionCode
      };
      const response = await axios.put(
        `http://localhost:3002/api/region/${selectedItem._id}`,
        updatedData
      );
      if (response.data.success) {
        fetchOrgData();
        toggleEditModal();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Region updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error("Failed to update region data");
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Failed to update region',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! This may affect stores associated with this region.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://localhost:3002/api/region/${id}`
        );
        if (response.data.success) {
          fetchOrgData();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Region has been deleted successfully.',
            timer: 1200,
            showConfirmButton: false
          });
        } else {
          throw new Error("Failed to delete region");
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.message || 'Failed to delete region',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  useEffect(() => {
    fetchOrgData();

  }, [orgList]);

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
                className={orgactiveTab === item.code ? "active" : ""}
                onClick={() => {
                  setOrgActiveTab(item.code);
                  callback(item.code);
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
                      <H6>Region Name: {item.name}</H6>
                      <P>Region Code: {item.code}</P>
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
        <ModalHeader toggle={toggleEditModal}>Edit Region</ModalHeader>
        <ModalBody>
          <label htmlFor="storeName">Region Name:</label>
          <Input
            type="text"
            value={updatedRegionName}
            onChange={(e) => setUpdatedRegionName(e.target.value)}
            placeholder="Enter region name"
          />
          <label htmlFor="regionCode">Region Code:</label>
          <Input
            type="text"
            value={updatedRegionCode}
            onChange={(e) => setUpdatedRegionCode(e.target.value)}
            placeholder="Enter region code"
          />
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

export default RegionManager;
