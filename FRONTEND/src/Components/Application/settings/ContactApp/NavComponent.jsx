import {
  Views,
  FollowUp,
  Orgenization,
  Favourites,
  Ideas,
  Business,
  Holidays,
  Important,
  Personal,
} from "../../../../Constant";
import CreateContact from "./CreateRegion";
import CategoryCreate from "./CategoryCreate";
import { Nav, NavItem } from "reactstrap";
import React, { Fragment, useState } from "react";

const NavComponent = ({ callbackActive }) => {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <Fragment>
      <Nav className="main-menu contact-options" role="tablist">
        <li>
          <hr />
        </li>
        <NavItem>
          <span className="main-title">Locations</span>
        </NavItem>
        <NavItem>
          <a
            href="#javascript"
            className={activeTab === "1" ? "active" : ""}
            onClick={() => {
              setActiveTab("1");
              callbackActive("1");
            }}
          >
            <span className="title">Organization</span>
          </a>
        </NavItem>
        <NavItem>
          <a
            href="#javascript"
            className={activeTab === "2" ? "active" : ""}
            onClick={() => {
              setActiveTab("2");
              callbackActive("2");
            }}
          >
            <span className="title">Region</span>
          </a>
        </NavItem>
        <NavItem>
          <a
            href="#javascript"
            className={activeTab === "3" ? "active" : ""}
            onClick={() => {
              setActiveTab("3");
              callbackActive("3");
            }}
          >
            <span className="title">Store</span>
          </a>
        </NavItem>

        <li>
          <hr />
        </li>

        <NavItem>
          <span className="main-title">Devices</span>
        </NavItem>
        <NavItem>
          <a
            href="#javascript"
            className={activeTab === "4" ? "active" : ""}
            onClick={() => {
              setActiveTab("4");
              callbackActive("4");
            }}
          >
            <span className="title">Cameras</span>
          </a>
        </NavItem>

        <li>
          <hr />
        </li>

        <NavItem>
          <span className="main-title">Users</span>
        </NavItem>
        <NavItem>
          <a
            href="#javascript"
            className={activeTab === "4" ? "active" : ""}
            onClick={() => {
              setActiveTab("4");
              callbackActive("4");
            }}
          >
            <span className="title">Users Settings</span>
          </a>
        </NavItem>
      </Nav>
    </Fragment>
  );
};

export default NavComponent;
