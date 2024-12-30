import React, { Fragment, useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "reactstrap";
import LeftReport from "./LeftReport";
import RightReport from "./RightReport";
import { Breadcrumbs } from "../../../AbstractElements";
import { getReports, createReport, deleteReport, updateReport } from "./reportService";
import Swal from 'sweetalert2';

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const rightReportRef = useRef();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#3699FF'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (formData, reportId) => {
    try {
      setLoading(true);
      if (reportId) {
        await updateReport(reportId, formData);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Report updated successfully',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      } else {
        await createReport(formData);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Report created successfully',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
      await fetchReports();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#3699FF'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3699FF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await deleteReport(reportId);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Report has been deleted.',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
        await fetchReports();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#3699FF'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditReport = (report) => {
    rightReportRef.current?.handleEdit(report);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <Fragment>
      <Container fluid className="p-0">
        <Breadcrumbs mainTitle="Traffic" parent="App" title="Report" />
        <Row className="g-0" style={{ minHeight: "64vh" }}>
          <Col xs="4" className="border-end">
            <LeftReport 
              reports={reports}
              onRefresh={fetchReports}
              onDelete={handleDeleteReport}
              onEdit={handleEditReport}
              loading={loading}
            />
          </Col>
          <Col xs="8">
            <RightReport 
              ref={rightReportRef}
              onSubmit={handleCreateReport} 
            />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Report;
