import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Table, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from "reactstrap";
import { Edit2, Trash2 } from "react-feather";
import axios from "../../../../../utils/axios";
import Swal from "sweetalert2";
import { Accordion } from 'react-bootstrap';
import { Btn } from "../../../../../AbstractElements";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    username: "",
    permissions: {
      dashboard: false,
      analytics: false,
      reports: false,
      dataGrid: false,
      accessGeneralSettings: false,
      manageGeneralSettings: false,
      accessTenants: false,
      manageTenants: false,
      manageUsers: false,
      manageUserProfiles: false,
      manageConfigurations: false,
      accessLogs: false,
      manageScheduleReport: false,
      tenantPortal: false
    }
  });

  const formatPermissionName = (perm) => {
    return perm.split(/(?=[A-Z])/).join(" ").replace(/^\w/, c => c.toUpperCase());
  };

  const permissionCategories = {
    appearance: ["dashboard", "analytics", "reports", "dataGrid"],
    generalSettings: ["accessGeneralSettings", "manageGeneralSettings", "accessTenants", "manageTenants"],
    administrative: ["manageUsers", "manageUserProfiles", "manageConfigurations", "accessLogs", "manageScheduleReport", "tenantPortal"]
  };

  const getPermissionDisplay = (permissions) => {
    if (!permissions || permissions.length === 0) return [];

    // Check if all permissions are selected
    const allPermissions = [
      ...permissionCategories.appearance,
      ...permissionCategories.generalSettings,
      ...permissionCategories.administrative
    ];
    
    if (allPermissions.every(perm => permissions.includes(perm))) {
      return ["All Permissions"];
    }

    const displayPermissions = [];
    
    // Check appearance permissions
    if (permissionCategories.appearance.every(perm => permissions.includes(perm))) {
      displayPermissions.push("Appearance");
    } else {
      displayPermissions.push(...permissions.filter(perm => 
        permissionCategories.appearance.includes(perm)).map(formatPermissionName));
    }

    // Check general settings permissions
    if (permissionCategories.generalSettings.every(perm => permissions.includes(perm))) {
      displayPermissions.push("General Settings");
    } else {
      displayPermissions.push(...permissions.filter(perm => 
        permissionCategories.generalSettings.includes(perm)).map(formatPermissionName));
    }

    // Check administrative permissions
    if (permissionCategories.administrative.every(perm => permissions.includes(perm))) {
      displayPermissions.push("Administrative Tasks");
    } else {
      displayPermissions.push(...permissions.filter(perm => 
        permissionCategories.administrative.includes(perm)).map(formatPermissionName));
    }

    return displayPermissions;
  };

  const [selectedItems, setSelectedItems] = useState([]);

  const handlePermissionChange = (perm, checked) => {
    setEditForm({
      ...editForm,
      permissions: {
        ...editForm.permissions,
        [perm]: checked,
      },
    });
    
    if (checked) {
      setSelectedItems(prev => [...prev, perm]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== perm));
    }
  };

  const toggle = () => {
    setEditModal(!editModal);
    setSelectedItems([]);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    const initialPermissions = {
      dashboard: false,
      analytics: false,
      reports: false,
      dataGrid: false,
      accessGeneralSettings: false,
      manageGeneralSettings: false,
      accessTenants: false,
      manageTenants: false,
      manageUsers: false,
      manageUserProfiles: false,
      manageConfigurations: false,
      accessLogs: false,
      manageScheduleReport: false,
      tenantPortal: false
    };
    
    const updatedPermissions = user.permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, initialPermissions);

    setEditForm({
      first_name: user.first_name,
      username: user.username,
      permissions: updatedPermissions
    });

    // Set initially selected items
    setSelectedItems(user.permissions);
    setEditModal(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching users...');
      const response = await axios.get("/users");
      console.log('Users API response:', response);
      
      if (response.data && response.data.success) {
        setUsers(response.data.data);
        console.log('Users fetched successfully:', response.data.data);
        console.log(users)
      } else {
        throw new Error(response.data?.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error('Error fetching users:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
      });

      if (result.isConfirmed) {
        console.log('Deleting user:', userId);
        const response = await axios.delete(`/users/${userId}`);
        
        if (response.data && response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "User deleted successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchUsers(); // Refresh the list
        } else {
          throw new Error(response.data?.message || "Failed to delete user");
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to delete user",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const permissionsArray = Object.entries(editForm.permissions)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);

      const userData = {
        first_name: editForm.first_name,
        username: editForm.username,
        permissions: permissionsArray
      };

      console.log('Updating user:', selectedUser._id, userData);
      const response = await axios.put(`/users/${selectedUser._id}`, userData);
      
      if (response.data && response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User updated successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        setEditModal(false);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(response.data?.message || "Failed to update user");
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update user",
      });
    }
  };

  if (loading) {
    return (
      <div className="loader-box">
        <div className="loader-3"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  return (
    <Card>
      <CardBody>
        <Table responsive hover borderless className="table m-0">
          <thead className="text-center align-middle">
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="text-center">{user.first_name}</td>
                <td className="text-center">{user.username}</td>
                <td className="text-center">{user.role}</td>
                <td>
                  {user.role !== "admin" ? (
                    <div style={{ maxWidth: "300px" }}>
                      {getPermissionDisplay(user.permissions).map((perm) => (
                        <span
                          key={perm}
                          className="badge bg-primary text-light me-1 mb-1"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">
                      Admin has all permissions
                    </span>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal
          isOpen={editModal}
          toggle={toggle}
          size="md"
          className="modal-bookmark"
        >
          <ModalHeader toggle={toggle}>Edit User</ModalHeader>
          <ModalBody>
            <Form
              className="form-bookmark needs-validation"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
            >
              <FormGroup className="col-md-12">
                <Label>First Name</Label>
                <Input
                  type="text"
                  className="form-control"
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, first_name: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup className="col-md-12">
                <Label>Username</Label>
                <Input
                  type="text"
                  className="form-control"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                />
              </FormGroup>

              <Row className="w-100 m-0 p-0">
                <h5 className="mb-3">Permissions</h5>
                <Accordion defaultActiveKey="0" className="w-100">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Appearance</Accordion.Header>
                    <Accordion.Body>
                      {["dashboard", "analytics", "reports", "dataGrid"].map(
                        (perm) => (
                          <FormGroup
                            check
                            key={perm}
                            className="checkbox checkbox-primary"
                          >
                            <Input
                              id={`checkbox-${perm}`}
                              type="checkbox"
                              checked={editForm.permissions[perm]}
                              onChange={(e) =>
                                handlePermissionChange(perm, e.target.checked)
                              }
                            />
                            <Label for={`checkbox-${perm}`}>
                              {formatPermissionName(perm)}
                            </Label>
                          </FormGroup>
                        )
                      )}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1">
                    <Accordion.Header>General Settings</Accordion.Header>
                    <Accordion.Body>
                      {[
                        "accessGeneralSettings",
                        "manageGeneralSettings",
                        "accessTenants",
                        "manageTenants",
                      ].map((perm) => (
                        <FormGroup
                          check
                          key={perm}
                          className="checkbox checkbox-primary"
                        >
                          <Input
                            id={`checkbox-${perm}`}
                            type="checkbox"
                            checked={editForm.permissions[perm]}
                            onChange={(e) =>
                              handlePermissionChange(perm, e.target.checked)
                            }
                          />
                          <Label for={`checkbox-${perm}`}>
                            {formatPermissionName(perm)}
                          </Label>
                        </FormGroup>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header>Administrative Tasks</Accordion.Header>
                    <Accordion.Body>
                      {[
                        "manageUsers",
                        "manageUserProfiles",
                        "manageConfigurations",
                        "accessLogs",
                        "manageScheduleReport",
                        "tenantPortal",
                      ].map((perm) => (
                        <FormGroup
                          check
                          key={perm}
                          className="checkbox checkbox-primary"
                        >
                          <Input
                            id={`checkbox-${perm}`}
                            type="checkbox"
                            checked={editForm.permissions[perm]}
                            onChange={(e) =>
                              handlePermissionChange(perm, e.target.checked)
                            }
                          />
                          <Label for={`checkbox-${perm}`}>
                            {formatPermissionName(perm)}
                          </Label>
                        </FormGroup>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="3">
                    <Accordion.Header>Locations</Accordion.Header>
                    <Accordion.Body>
                      {[
                        "manageUsers",
                        "manageUserProfiles",
                        "manageConfigurations",
                        "accessLogs",
                        "manageScheduleReport",
                        "tenantPortal",
                      ].map((perm) => (
                        <FormGroup
                          check
                          key={perm}
                          className="checkbox checkbox-primary"
                        >
                          <Input
                            id={`checkbox-${perm}`}
                            type="checkbox"
                            checked={editForm.permissions[perm]}
                            onChange={(e) =>
                              handlePermissionChange(perm, e.target.checked)
                            }
                          />
                          <Label for={`checkbox-${perm}`}>
                            {formatPermissionName(perm)}
                          </Label>
                        </FormGroup>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                {selectedItems.length > 0 && (
                  <div className="mt-4">
                    <h6>Selected Permissions:</h6>
                    <div className="selected-items p-3 border rounded">
                      {selectedItems.map((item) => (
                        <span key={item} className="badge bg-primary me-2 mb-2">
                          {formatPermissionName(item)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Row>

              <Row>
                <div className="mt-3 d-flex gap-2 justify-content-end w-100">
                  <Btn
                    attrBtn={{ color: "primary", type: "submit" }}
                    className=""
                  >
                    Update User
                  </Btn>
                  <Btn attrBtn={{ color: "secondary", onClick: toggle }}>
                    Cancel
                  </Btn>
                </div>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      </CardBody>
    </Card>
  );
};

export { UserManager };
