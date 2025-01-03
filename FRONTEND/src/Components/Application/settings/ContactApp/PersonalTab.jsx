import React, { Fragment, useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import HeaderCard from "../../../Common/Component/HeaderCard";
import { Btn } from "../../../../AbstractElements";
import { useForm, Controller } from "react-hook-form";
import config from "../../../../config";
import axios from "../../../../utils/axios";
const PersonalTab = ({ activeTab }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm();

  // Load existing details on component mount
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/organization");

      if (response.data && response.data.success) {
        const { data } = response.data;

        if (data && data.length > 0) {
          const record = data[0]; // Load the first record into the form


          // Populate the form fields with existing record
          Object.keys(record).forEach((key) => {
            if (key !== "_id" && key !== "__v" && key !== "createdAt" && key !== "updatedAt") {
              setValue(key, record[key]);
            }
          });
        } else {
          console.log("No records found.");
        }
      } else {
        console.error("Failed to fetch records.");
      }
    } catch (error) {
      console.error("Error fetching organization details:", error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when activeTab changes
  useEffect(() => {
    if (activeTab === "1") { // Ensure this tab is active
      fetchData();
    }
  }, [activeTab, setValue]);


  const onEditSubmit = async (data) => {
    setIsSubmitting(true);
    try {

      // Check if records exist in the collection
      const checkResponse = await axios.get("/organization");

      if (checkResponse.data && checkResponse.data.success) {
        const { data: records } = checkResponse.data;

        if (records && records.length === 0) {
          // Create a new record if none exist
          const createResponse = await axios.post("/organization/create", data);

          if (createResponse.data && createResponse.data.success) {
            alert("Organization created successfully!");
            reset();
            fetchData();
          } else {
            const createError = createResponse.data;
            alert(`Error creating: ${createError.message}`);
          }
        } else {
          // Update the first record if it exists


          const updateResponse = await axios.put(`/organization/${records[0]._id}`, data);

          if (updateResponse.data && updateResponse.data.success) {
            alert("Organization updated successfully!");
            reset();
            fetchData();
          } else {
            const updateError = updateResponse.data;
            alert(`Error updating: ${updateError.message}`);
          }
        }
      } else {
        console.error("Failed to check records in the collection.");
      }
    } catch (error) {
      console.error("Error in create/update process:", error.response?.data?.message || error.message);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Fragment>
      <Card>
        <HeaderCard mainClasses="d-flex" title="Organization" />
        {isLoading ? (
          <div className="text-center p-3">Loading...</div>
        ) : (
          <Form className="card" onSubmit={handleSubmit(onEditSubmit)}>
            <CardBody>
              <Row>
                <Col md="5">
                  <FormGroup className="mb-3">
                    <Label className="form-label">Company</Label>
                    <Controller
                      name="company"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="text"
                          placeholder="Company"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col sm="6" md="3">
                  <FormGroup>
                    <Label className="form-label">Phone</Label>
                    <Controller
                      name="phone"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="text"
                          placeholder="Phone"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col sm="6" md="4">
                  <FormGroup>
                    <Label className="form-label">Email Address</Label>
                    <Controller
                      name="email"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="email"
                          placeholder="Email"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col sm="6" md="6">
                  <FormGroup>
                    <Label className="form-label">First Name</Label>
                    <Controller
                      name="firstName"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="text"
                          placeholder="First Name"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col sm="6" md="6">
                  <FormGroup>
                    <Label className="form-label">Last Name</Label>
                    <Controller
                      name="lastName"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="text"
                          placeholder="Last Name"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col md="12">
                  <FormGroup>
                    <Label className="form-label">Address</Label>
                    <Controller
                      name="address"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="text"
                          placeholder="Address"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col sm="6" md="4">
                  <FormGroup>
                    <Label className="form-label">City</Label>
                    <Controller
                      name="city"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="text"
                          placeholder="City"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col sm="6" md="3">
                  <FormGroup>
                    <Label className="form-label">Postal Code</Label>
                    <Controller
                      name="postalCode"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="form-control"
                          type="number"
                          placeholder="ZIP Code"
                        />
                      )}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
            <CardFooter className="text-end">
              <Btn
                attrBtn={{
                  color: "primary",
                  type: "submit",
                  disabled: isSubmitting,
                }}
              >
                {isSubmitting ? "Submitting..." : "Update Profile"}
              </Btn>
            </CardFooter>
          </Form>
        )}
      </Card>
    </Fragment>
  );
};

export default PersonalTab;
