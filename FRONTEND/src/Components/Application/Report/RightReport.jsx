import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import { FaPlus } from 'react-icons/fa';

const RightReport = ({ onAdd }) => {
  return (
    <Row className="h-100 g-0 align-items-center justify-content-center">
      <Col xs="12" className="d-flex justify-content-center">
        <div>
          <Button color="primary" outline className="rounded-1 px-4" onClick={onAdd}>
            <FaPlus className="text-primary me-2 align-middle" />
            Add a new report
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default RightReport;