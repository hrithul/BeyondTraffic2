import React, { Fragment, useCallback, useState } from "react";
import { Row, Col, Card, CardBody, TabContent } from "reactstrap";
import { Orgenization } from "../../../../Constant";
import HeaderCard from "../../../Common/Component/HeaderCard";
import StoreManager from "./StoreTab/StoreManager";
import CreateStore from "./CreateStore";

const StoreTab = () => {
  const [orgactiveTab, setOrgActiveTab] = useState("1");
  const callback = useCallback((tab) => {
    setOrgActiveTab(tab);
  });

  return (
    <Fragment>
      <Card className="mb-0" style={{ maxWidth: "100%" }}>
        <HeaderCard title="New Store" /*span1={"10 Contacts"}*/ />
        <CreateStore>
        </CreateStore>
        <CardBody className="p-0">
          <StoreManager callback={callback} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default StoreTab;
