import React, { Fragment, useCallback, useState } from "react";
import { Row, Col, Card, CardBody, TabContent } from "reactstrap";
import { Orgenization } from "../../../../Constant";
import HeaderCard from "../../../Common/Component/HeaderCard";
import { UserManager } from "./UsersTab/UserManager";
import CreateUser from "./CreateUser";

const UsersTab = () => {
  const [orgactiveTab, setOrgActiveTab] = useState("1");
  const callback = useCallback((tab) => {
    setOrgActiveTab(tab);
  });

  return (
    <Fragment>
      <Card className="mb-0" style={{ maxWidth: "100%" }}>
        <HeaderCard title="New User" />
        <CreateUser />
        <CardBody className="p-0">
          <UserManager callback={callback} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default UsersTab;
