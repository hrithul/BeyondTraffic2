import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import DateFilter from "../../../CommonElements/Breadcrumbs/DateFilter";
import LocationSelector from "./LocationSelector";

const AddReportForm = ({ onCancel, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState({
    reportTitle: "",
    format: "PDF",
    templateType: "Daily",
    dateRange: "",
    emailTo: "",
    emailSubject: "",
    emailBody: "",
    locations: [],
  });

  useEffect(() => {
    if (editData) {
      setFormData(prev => ({ ...prev, ...editData }));
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationChange = (locations) => {
    setFormData(prev => ({
      ...prev,
      locations
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="h-100">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{editData ? "Edit Report" : "Add New Report"}</h5>
        <Button close onClick={onCancel} />
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="reportTitle">Report Title</Label>
            <Input
              type="text"
              name="reportTitle"
              id="reportTitle"
              placeholder="Enter a title"
              value={formData.reportTitle}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="format">Format</Label>
                <Input
                  type="select"
                  name="format"
                  id="format"
                  value={formData.format}
                  onChange={handleChange}
                >
                  <option value="PDF">PDF</option>
                  <option value="XML">XML</option>
                  <option value="HTML">HTML</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mt-4">
                <Label for="dateRange">Date Range: &nbsp;</Label>
                <DateFilter name="dateRange" />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="emailTo">Email To</Label>
            <Input
              type="email"
              name="emailTo"
              id="emailTo"
              placeholder="Email Recipients"
              value={formData.emailTo}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="emailSubject">Email Subject</Label>
            <Input
              type="text"
              name="emailSubject"
              id="emailSubject"
              placeholder="Enter a subject"
              value={formData.emailSubject}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="emailBody">Email Body</Label>
            <Input
              type="textarea"
              name="emailBody"
              id="emailBody"
              placeholder="Enter email body"
              value={formData.emailBody}
              onChange={handleChange}
              rows="3"
            />
          </FormGroup>

          <FormGroup>
            <Label for="locations">Locations</Label>
            <LocationSelector
              value={formData.locations}
              onChange={handleLocationChange}
            />
          </FormGroup>

          <Row className="mt-4">
            <Col className="d-flex justify-content-end gap-2">
              <Button type="button" color="light" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {editData ? "Update Report" : "Create Report"}
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default AddReportForm;
