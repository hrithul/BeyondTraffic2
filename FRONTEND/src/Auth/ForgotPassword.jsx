import React, { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';
import { H4, P, Btn } from '../AbstractElements';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import config from "../config";
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${config.hostname}/auth/reset-password`, {
        username,
        newPassword
      });
      
      toast.success('Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please check your username.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid={true} className="p-0">
      <Row>
        <Col xs="12">
          <div className="login-card">
            <div className="login-main">
              <Form className="theme-form" onSubmit={handleSubmit}>
                <H4>Reset Your Password</H4>
                <P>Enter your username and new password</P>
                
                <FormGroup>
                  <Label className="col-form-label">Username</Label>
                  <Input
                    className="form-control"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label className="col-form-label">New Password</Label>
                  <Input
                    className="form-control"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                </FormGroup>

                <div className="form-group mb-0">
                  <div className="text-end mt-3">
                    <Btn 
                      attrBtn={{ 
                        color: 'primary', 
                        className: 'btn-block',
                        disabled: isLoading 
                      }} 
                      type="submit"
                    >
                      {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </Btn>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <P>
                    Remember your password?{' '}
                    <Link className="ms-2" to="/login">
                      Sign In
                    </Link>
                  </P>
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
