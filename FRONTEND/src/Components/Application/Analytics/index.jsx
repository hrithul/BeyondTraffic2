import React, { Fragment, useState } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { Breadcrumbs } from '../../../AbstractElements';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Chartpage from './Chartpage';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {

    return (
      <Fragment>
        <Breadcrumbs mainTitle="Traffic" parent="Dashboard" title="Default" />
        <Container fluid={true}>
          <Row className="widget-grid">
            <Chartpage />
          </Row>
        </Container>
      </Fragment>
    );
}

export default Analytics;
