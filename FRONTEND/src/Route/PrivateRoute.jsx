import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const [login, setLogin] = useState(JSON.parse(localStorage.getItem("islogin")));
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(JSON.parse(localStorage.getItem("authenticated")));
    localStorage.setItem("authenticated", authenticated);
    localStorage.setItem("login", login);
    console.log("login", login);
    console.log("authenticated", authenticated);
  }, []);
  return login || authenticated ? <Outlet /> : <Navigate exact to={`${process.env.PUBLIC_URL}/login`} />;
};

export default PrivateRoute;
