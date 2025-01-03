import { useState, Fragment } from "react";
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
import { Accordion } from 'react-bootstrap';

const CreateUser = ({ onSuccess }) => {
  const [modal, setModal] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [permissions, setPermissions] = useState({
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
    tenantPortal: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const toggle = () => {
    setModal(!modal);
    reset();
    setPermissions({
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
      tenantPortal: false,
    });
    setSelectedItems([]);
  };

  const formatPermissionName = (perm) => {
    return perm.split(/(?=[A-Z])/).join(" ").replace(/^\w/, c => c.toUpperCase());
  };

  const handlePermissionChange = (perm, checked) => {
    setPermissions({
      ...permissions,
      [perm]: checked,
    });
    
    if (checked) {
      setSelectedItems(prev => [...prev, perm]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== perm));
    }
  };

  const onSubmit = async (data) => {
    try {
      // Convert permissions object to array of enabled permissions
      const permissionsArray = Object.entries(permissions)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);

      const userData = {
        first_name: data.first_name,
        username: data.username,
        password: data.password,
        permissions: permissionsArray,
      };

      const response = await axios.post(`/users/createuser`, userData);
      if (response.data && response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User created successfully!",
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
          toast: true,
        });
        toggle();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response.data?.message || "Failed to create user");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create user",
      });
    }
  };

  return (
    <Fragment>
      <Btn
        attrBtn={{
          color: "",
          className:
            "badge-light-primary align-items-center btn-mail d-flex justify-content-start w-100 emptyContact",
          onClick: toggle,
        }}
      >
        <Users className="me-2" />
        Create New User
      </Btn>
      <Modal
        className="modal-bookmark"
        isOpen={modal}
        toggle={toggle}
        size="md"
      >
        <ModalHeader toggle={toggle}>Create New User</ModalHeader>
        <ModalBody>
          <Form
            className="form-bookmark needs-validation d-flex flex-wrap gap-1"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormGroup className="col-md-12">
              <Label>First Name</Label>
              <input
                className={`form-control ${
                  errors.first_name ? "is-invalid" : ""
                }`}
                name="first_name"
                type="text"
                {...register("first_name", {
                  required: "First name is required",
                })}
              />
              {errors.first_name && (
                <div className="invalid-feedback">
                  {errors.first_name.message}
                </div>
              )}
            </FormGroup>
            <FormGroup className="col-md-12">
              <Label>Username</Label>
              <input
                className={`form-control ${
                  errors.username ? "is-invalid" : ""
                }`}
                name="username"
                type="text"
                {...register("username", {
                  required: "Username is required",
                })}
              />
              {errors.username && (
                <div className="invalid-feedback">
                  {errors.username.message}
                </div>
              )}
            </FormGroup>
            <FormGroup className="col-md-12">
              <Label>Password</Label>
              <input
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                name="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
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
                          checked={permissions[perm]}
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
                <Accordion.Header className="w-100">
                  General Settings
                </Accordion.Header>
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
                        checked={permissions[perm]}
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
                <Accordion.Header className="w-100">
                  Administrative Tasks
                </Accordion.Header>
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
                        checked={permissions[perm]}
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
              <div className="mt-3 d-flex gap-2 justify-content-center w-100">
                <Btn
                  attrBtn={{ color: "primary", type: "submit" }}
                  className="me-2"
                >
                  Create User
                </Btn>
                <Btn attrBtn={{ color: "secondary", onClick: toggle }}>
                  Cancel
                </Btn>
              </div>
            </Row>
          </Form>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default CreateUser;
