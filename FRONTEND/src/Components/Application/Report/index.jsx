import React, { Fragment } from "react";
import { Container, Row, Col } from "reactstrap";
import LeftReport from "./LeftReport";
import RightReport from "./RightReport";
import {Breadcrumbs} from "../../../AbstractElements";

const Report = () => {
  return (
    <Fragment>
    <Container fluid className="p-0">
      <Breadcrumbs mainTitle="Traffic" parent="App" title="Report" />
      <Row className="g-0" style={{ minHeight: "73vh" }}>
        <Col xs="4" className="border-end">
          <LeftReport />
        </Col>
        <Col xs="8">
          <RightReport />
        </Col>
      </Row>
    </Container>
    </Fragment>
  );
};

export default Report;
