import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import { FaPlus, FaPen, FaTrash, FaSync } from 'react-icons/fa';

const LeftReport = ({ reports = [], onAdd, onEdit, onDelete, onRefresh }) => {
  return (
    <Row className="h-100 g-0">
      <Col xs="12" className="p-3 d-flex flex-column h-100">
        <Row>
          <Col>
            <h4 className="m-0 text-dark">Reports ({reports.length})</h4>
          </Col>
        </Row>
        
        <Row className="flex-grow-1 mt-4">
          <Col>
            {reports.length === 0 ? (
              <div className="text-muted">
                There are no generated reports to display.
              </div>
            ) : (
              <div>
                {/* Report list items would go here */}
              </div>
            )}
          </Col>
        </Row>

        <Row className="mt-auto">
          <Col className="d-flex gap-2">
            <Button
              color="primary"
              outline
              size="sm"
              className="rounded-1 px-3 align-middle"
              onClick={onRefresh}
            >
              <FaSync className="text-primary align-middle" />
            </Button>
            <Button
              color="primary"
              outline
              size="sm"
              className="rounded-1 px-3 align-middle"
              onClick={onAdd}
            >
              <FaPlus className="text-primary me-1 align-middle" />
              Add
            </Button>
            <Button
              color="primary"
              outline
              size="sm"
              className="rounded-1 px-3 align-middle"
              onClick={onEdit}
            >
              <FaPen className="text-dark me-1 align-middle" />
              Edit
            </Button>
            <Button
              color="danger"
              outline
              size="sm"
              className="rounded-1 px-3 align-middle"
              onClick={onDelete}
            >
              <FaTrash className="text-danger me-1 align-middle" />
              Delete
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default LeftReport;