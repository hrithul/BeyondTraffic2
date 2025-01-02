import React, { Fragment, useState, useEffect, useContext } from "react";
import { Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { Btn, H4, P } from "../AbstractElements";
import { EmailAddress, ForgotPassword, Password, RememberPassword, SignIn } from "../Constant";

import { useNavigate } from "react-router-dom";
import man from "../assets/images/dashboard/profile.png";

import CustomizerContext from "../_helper/Customizer";
import { ToastContainer, toast } from "react-toastify";
import axios from '../utils/axios';
import config from "../config";

const Signin = ({ selected }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);

  const [value, setValue] = useState(localStorage.getItem("profileURL" || man));
  const [name, setName] = useState(localStorage.getItem("Name"));

  useEffect(() => {
    localStorage.setItem("profileURL", man);
    localStorage.setItem("Name", "Emay Walter");
  }, [value, name]);

  const loginAuth = async (e) => {
    e.preventDefault();

    const data = {
      username: userName,
      password: password,
    };

    try {
      console.log('Attempting login with:', { username: userName });
      const response = await axios.post(`${config.hostname}/auth/login`, data);
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('loginUser', response.data.first_name);
      localStorage.setItem('loginUserId', response.data.user_id);
      localStorage.setItem('islogin', 'true');
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('profileURL', man);
      localStorage.setItem('Name', response.data.first_name);

      navigate(`${process.env.PUBLIC_URL}/dashboard/default/${layoutURL}`);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response && error.response.data
        ? error.response.data
        : 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Fragment>
      <Container fluid={true} className="p-0 login-page">
        <Row>
          <Col xs="12">
            <div className="login-card">
              <div className="login-main login-tab">
                <Form className="theme-form">
                  <H4>{selected === "simpleLogin" ? "" : "BeyondTraffic"}</H4>
                  <P>{"Enter your email & password to login"}</P>
                  <FormGroup>
                    <Label className="col-form-label">{EmailAddress}</Label>
                    <Input className="form-control" type="email" onChange={(e) => setUserName(e.target.value)} value={userName} />
                  </FormGroup>
                  <FormGroup className="position-relative">
                    <Label className="col-form-label">{Password}</Label>
                    <div className="position-relative">
                      <Input className="form-control" type={togglePassword ? "text" : "password"} onChange={(e) => setPassword(e.target.value)} value={password} />
                      <div className="show-hide" onClick={() => setTogglePassword(!togglePassword)}>
                        <span className={togglePassword ? "" : "show"}></span>
                      </div>
                    </div>
                  </FormGroup>
                  <div className="position-relative form-group mb-0">
                    <div className="checkbox">
                      <Input id="checkbox1" type="checkbox" />
                      <Label className="text-muted" for="checkbox1">
                        {RememberPassword}
                      </Label>
                    </div>
                    <a className="link" href="#javascript">
                      {ForgotPassword}
                    </a>
                    <Btn attrBtn={{ color: "primary", className: "d-block w-100 mt-2", onClick: (e) => loginAuth(e) }}>{SignIn}</Btn>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <ToastContainer />
    </Fragment>
  );
};

export default Signin;
