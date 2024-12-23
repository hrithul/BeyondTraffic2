import React, { Fragment, useCallback, useState } from "react";
import { Row, Col, Card, CardBody, TabContent } from "reactstrap";
import { Orgenization } from "../../../../Constant";
import HeaderCard from "../../../Common/Component/HeaderCard";
import RegionManager from "./OrganiceTab/RegionManager";
import CreateRegion from "./CreateRegion";

const OrgenizationTab = () => {
  const [orgactiveTab, setOrgActiveTab] = useState("1");
  const callback = useCallback((tab) => {
    setOrgActiveTab(tab);
  });

  return (
    <Fragment>
      <Card className="mb-0" style={{ maxWidth: "100%" }}>
        <HeaderCard title="New Region" /*span1={"10 Contacts"}*/ />
        <CreateRegion>
          <b>New Region</b>
        </CreateRegion>
        <CardBody className="p-0">
          <RegionManager callback={callback} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default OrgenizationTab;
