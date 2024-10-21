import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = ({ element }) => {
  const token = localStorage.getItem('token');
  const location = useLocation(); // Lấy thông tin route hiện tại
  const navigate = useNavigate(); // Điều hướng

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token); 
        const currentTime = Date.now() / 1000; // Thời gian hiện tại

        // Kiểm tra nếu token đã hết hạn
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          // Token hết hạn, điều hướng đến trang đăng nhập
          navigate('/login');
        } else if (location.pathname === '/login') {
          // Nếu đang ở trang login và có token hợp lệ, chuyển hướng về trang chủ
          navigate('/');
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        navigate('/login');
      }
    } else if (location.pathname !== '/login') {
      // Nếu không có token và đang ở trang khác ngoài /login, chuyển hướng đến trang login
      navigate('/login');
    }
  }, [token, location.pathname, navigate]); // useEffect sẽ theo dõi các giá trị này

  return element; // Render trang bảo mật
};

export default AuthContext;
