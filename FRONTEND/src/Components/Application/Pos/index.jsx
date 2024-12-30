import React from "react";
import { Container, Row, Col } from "reactstrap";
import {Breadcrumbs} from "../../../AbstractElements";

const Pos = () => {
  return (
    <Container fluid className="p-0" style={{ minHeight: "82vh" }}>
      <Breadcrumbs mainTitle="Traffic" parent="App" title="Point of Sale" />
    </Container>
  );
};

export default Pos;
