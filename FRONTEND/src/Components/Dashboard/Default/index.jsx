import React, { Fragment } from "react";
import { Container, Row } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";

import GenderTraffic from "./GenderTraffic";
import GreetingCard from "./GreetingCard";
import WidgetsWrapper from "./WidgetsWraper";
import TrafficbyMonth from"./HourTraffic";
import DayTraffic from "./DayTraffic";

const Dashboard = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle="Traffic" parent="Dashboard" title="Default" />
      <Container fluid={true}>
        <Row className="widget-grid">
          <GreetingCard />
          <WidgetsWrapper />
          <GenderTraffic />
          <TrafficbyMonth/>
          <DayTraffic/>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
