import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn, Mail, User } from "react-feather";
import man from "../../../assets/images/dashboard/profile.png";

import { LI, UL, Image, P } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";
import { Account, Admin, Inbox, LogOut, Taskboard } from "../../../Constant";

const UserHeader = () => {
  const history = useNavigate();
  const [profile, setProfile] = useState(man);
  const [name, setName] = useState("");
  const { layoutURL } = useContext(CustomizerContext);

  useEffect(() => {
    setProfile(localStorage.getItem("profileURL") || man);
    setName(localStorage.getItem("Name") || localStorage.getItem("loginUser") || "User");
  }, []);

  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("islogin");
    localStorage.removeItem("authenticated");
    localStorage.removeItem("loginUser");
    localStorage.removeItem("loginUserId");
    localStorage.removeItem("profileURL");
    localStorage.removeItem("Name");
    history(`${process.env.PUBLIC_URL}/login`);
  };

  const UserMenuRedirect = (redirect) => {
    history(redirect);
  };

  return (
    <li className="profile-nav onhover-dropdown pe-0 py-0">
      <div className="media profile-media">
        <Image
          attrImage={{
            className: "b-r-10 m-0",
            src: profile,
            alt: "",
          }}
        />
        <div className="media-body">
          <span>{name}</span>
          <P attrPara={{ className: "mb-0 font-roboto" }}>
            {Admin} <i className="middle fa fa-angle-down"></i>
          </P>
        </div>
      </div>
      <UL attrUL={{ className: "profile-dropdown onhover-show-div" }}>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`${process.env.PUBLIC_URL}/app/users/profile/${layoutURL}`),
          }}
        >
          <User />
          <span>{Account} </span>
        </LI>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`${process.env.PUBLIC_URL}/app/email-app/${layoutURL}`),
          }}
        >
          <Mail />
          <span>{Inbox}</span>
        </LI>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`${process.env.PUBLIC_URL}/app/todo-app/todo/${layoutURL}`),
          }}
        >
          <FileText />
          <span>{Taskboard}</span>
        </LI>
        <LI attrLI={{ onClick: Logout }}>
          <LogIn />
          <span>{LogOut}</span>
        </LI>
      </UL>
    </li>
  );
};

export default UserHeader;
