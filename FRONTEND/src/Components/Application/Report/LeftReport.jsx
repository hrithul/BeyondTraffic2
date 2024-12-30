import React from 'react';
import { Button, Row, Col, Card, CardBody, Badge } from 'reactstrap';
import { FaSync, FaTrash, FaPen } from 'react-icons/fa';
import { format } from 'date-fns';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

const scrollbarStyles = { borderRadius: 5 };

const LeftReport = ({ reports = [], onRefresh, loading, onDelete, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'daily':
        return '📅';
      case 'weekly':
        return '📊';
      case 'monthly':
        return '📈';
      default:
        return '📄';
    }
  };

  return (
    <Row className="h-100 g-0">
      <Col xs="12" className="p-3 d-flex flex-column h-100">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h4 className="m-0 text-dark">Reports ({reports.length})</h4>
            <Button
              color="primary"
              outline
              className="rounded-1 px-3 align-middle hover-button-outline"
              onClick={onRefresh}
              disabled={loading}
            >
              <FaSync className={`align-middle mb-1 ${loading ? 'fa-spin' : ''}`} />
            </Button>
          </Col>
        </Row>
        
        <div className="card-body" style={{ height: 'calc(100vh - 200px)' }}>
          <PerfectScrollbar 
            className="scroll"
            options={{ suppressScrollX: true }}
            style={scrollbarStyles}
          >
            {reports.length === 0 ? (
              <div className="text-muted text-center mt-4">
                There are no generated reports to display.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 pe-2">
                {reports.map((report) => (
                  <Card key={report._id} className="shadow-sm">
                    <CardBody className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">
                            {getReportTypeIcon(report.type)} {report.title}
                          </h5>
                          <p className="text-muted small mb-2">
                            Created: {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                          {report.description && (
                            <p className="mb-2 text-muted">{report.description}</p>
                          )}
                        </div>
                        <div className="d-flex gap-2 align-items-start">
                          <Badge color={getStatusColor(report.status)} className="text-capitalize">
                            {report.status}
                          </Badge>
                          <Button
                            color="primary"
                            size="sm"
                            outline
                            className="py-1 px-2"
                            onClick={() => onEdit(report)}
                          >
                            <FaPen size={12} className="mt-1" />
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            outline
                            className="py-1 px-2"
                            onClick={() => onDelete(report._id)}
                          >
                            <FaTrash size={12} className="mt-1" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </PerfectScrollbar>
        </div>
      </Col>
    </Row>
  );
};

export default LeftReport;