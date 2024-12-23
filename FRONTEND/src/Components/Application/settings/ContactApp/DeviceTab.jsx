import React, { Fragment, useCallback, useState } from "react";
import { Row, Col, Card, CardBody, TabContent } from "reactstrap";
import { Orgenization } from "../../../../Constant";
import HeaderCard from "../../../Common/Component/HeaderCard";
import DeviceManager from "./DeviceTab/DeviceManager";
import CreateDevice from "./CreateDevice";

const DeviceTab = () => {
  const [orgactiveTab, setOrgActiveTab] = useState("1");
  const callback = useCallback((tab) => {
    setOrgActiveTab(tab);
  });

  return (
    <Fragment>
      <Card className="mb-0" style={{ maxWidth: "100%" }}>
        <HeaderCard title="New Device" /*span1={"10 Contacts"}*/ />
        <CreateDevice/>
        <CardBody className="p-0">
          <DeviceManager callback={callback} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default DeviceTab;