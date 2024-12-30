import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";

const AddReportForm = ({ onCancel, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "daily",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || "",
        description: editData.description || "",
        type: editData.type || "daily",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="h-100">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{editData ? 'Edit Report' : 'Add New Report'}</h5>
        <Button close onClick={onCancel} />
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="title">Report Title</Label>
            <Input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="type">Report Type</Label>
            <Input
              type="select"
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </FormGroup>
          <Row className="mt-4">
            <Col className="d-flex justify-content-end gap-2">
              <Button type="button" color="light" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {editData ? 'Update Report' : 'Create Report'}
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default AddReportForm;
