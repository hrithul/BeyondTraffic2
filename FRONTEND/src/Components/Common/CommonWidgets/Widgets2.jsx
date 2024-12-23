import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody } from 'reactstrap';
import { H4 } from '../../../AbstractElements';

const Widgets2 = ({ data }) => {
  return (
    <Card className="widget-1 widget-with-chart">
      <CardBody className="d-flex px-5 justify-content-between align-items-center">
        <span
          style={{
            fontSize: "17px",
            color: `${data.color}`,
          }}
        >
          {data.title}:
        </span>
        <H4
          attrH4={{
            className: " justify-self-center align-self-center mb-0",
          }}
        >
          {data.total}
        </H4>
      </CardBody>
    </Card>
  );
};

export default Widgets2;
