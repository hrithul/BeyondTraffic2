import React from "react";
import { Card, CardBody } from "reactstrap";
import { H4 } from "../../../AbstractElements";
import SvgIcon from "../Component/SvgIcon";

const Widgets1 = ({ data }) => {
  return (
    <Card className="widget-1">
      <CardBody>
        <div className="widget-content">
          <div className={`widget-round ${data.color}`}>
            <div className="bg-round">
              <SvgIcon className="svg-fill" iconId={`${data.icon}`} />
              <SvgIcon className="half-circle svg-fill" iconId="halfcircle" />
            </div>
          </div>
          <div>
            <H4>{data.total}</H4>
            <span className="f-light">{data.title}</span>
          </div>
        </div>
        <div
          className={`font-${data.growth < 0 ? "danger" : "success"} `}
        >
          <i
            className={`icon-arrow-${
              data.growth < 0 ? "down" : "up"
            } icon-rotate me-1`}
          />
          <span>{`${data.growth < 0 ? "" : "+"}${data.growth}%`}</span>
        </div>
      </CardBody>
    </Card>
  );
};

export default Widgets1;
