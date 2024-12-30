import React, { useState } from "react";
import { Row, Col, Button } from "reactstrap";
import { FaPlus } from "react-icons/fa";
import AddReportForm from "./AddReportForm";
import Swal from 'sweetalert2';

const RightReport = ({ onSubmit }, ref) => {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditData(null);
  };

  const handleSubmit = async (formData) => {
    try {
      await onSubmit(formData, editData?._id);
      setShowForm(false);
      setEditData(null);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit report. Please try again.',
        confirmButtonColor: '#3699FF'
      });
    }
  };

  // This method will be called by the parent component
  const handleEdit = (report) => {
    setEditData(report);
    setShowForm(true);
  };

  // Expose the edit handler
  React.useImperativeHandle(
    ref,
    () => ({
      handleEdit
    }),
    []
  );

  if (showForm) {
    return <AddReportForm 
      onCancel={handleCancel} 
      onSubmit={handleSubmit}
      editData={editData}
    />;
  }

  return (
    <Row className="h-100 g-0 align-items-center justify-content-center">
      <Col xs="12" className="d-flex justify-content-center">
        <div>
          <Button 
            color="primary" 
            outline 
            className="rounded-1 px-4 py-2 hover-button mb-1" 
            onClick={handleAdd}
          >
            <FaPlus className="me-2 align-middle mb-1" />
            Add a new report
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default React.forwardRef(RightReport);