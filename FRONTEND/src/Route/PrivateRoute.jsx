import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const isLogin = localStorage.getItem('islogin') === 'true';
      const authenticated = localStorage.getItem('authenticated') === 'true';
      
      const isAuth = Boolean(token && (isLogin || authenticated));
      console.log('Auth Check:', {
        hasToken: !!token,
        isLogin,
        authenticated,
        isAuthenticated: isAuth
      });
      
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };

    checkAuth();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={`${process.env.PUBLIC_URL}/login`} />;
};

export default PrivateRoute;
