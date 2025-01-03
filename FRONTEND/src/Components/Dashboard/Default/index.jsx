import React, { Fragment, Suspense, lazy } from "react";
import { Container, Row } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import GreetingCard from "./GreetingCard";
import WidgetsWrapper from "./WidgetsWraper";
import DeviceStatus from "./DeviceStatus";
import ShimmerCard from "../../Common/ShimmerCard";

// Lazy load the traffic components
const GenderTraffic = lazy(() => import("./GenderTraffic"));
const TrafficbyMonth = lazy(() => import("./HourTraffic"));
const DayTraffic = lazy(() => import("./DayTraffic"));
const MonthlyTraffic = lazy(() => import("./MonthlyTraffic"));

// Loading placeholder
const LoadingPlaceholder = () => (
  <ShimmerCard height="300px" />
);

const Dashboard = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle="Traffic" parent="Dashboard" title="Default" />
      <Container fluid={true}>
        <Row className="widget-grid">
          <GreetingCard />
          <WidgetsWrapper />
          <Suspense fallback={<LoadingPlaceholder />}>
            <GenderTraffic />
          </Suspense>
            <Suspense fallback={<LoadingPlaceholder />}>
              <TrafficbyMonth />
            </Suspense>
            <Suspense fallback={<LoadingPlaceholder />}>
              <DayTraffic />
            </Suspense>
            <Suspense fallback={<LoadingPlaceholder />}>
              <MonthlyTraffic />
            </Suspense>
            <DeviceStatus />
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
