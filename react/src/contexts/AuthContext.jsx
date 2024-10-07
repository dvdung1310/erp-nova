import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = ({ element }) => {
  const token = localStorage.getItem('token');
  const location = useLocation(); // Lấy thông tin route hiện tại
console.log(location);
  if (token) {
    try {
      const decodedToken = jwtDecode(token); 
      const currentTime = Date.now() / 1000; 
      
      // Kiểm tra nếu token đã hết hạn
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token đã hết hạn, chuyển hướng đến trang đăng nhập
        return <Navigate to="/login" replace />;
      }

      // Nếu người dùng đang ở trang login và đã có token hợp lệ, chuyển hướng về trang chủ
      if (location.pathname === '/login') {
        return <Navigate to="/" replace />;
      }

      // Token còn hiệu lực, render trang bảo mật
      return element;
    } catch (error) {
      // Trường hợp token không hợp lệ hoặc có lỗi khi giải mã
      console.error("Token không hợp lệ:", error);
      return <Navigate to="/login" replace />;
    }
  } else {
    // Nếu không có token và đang ở trang khác ngoài /login, chuyển hướng đến trang đăng nhập
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
  }

  // Render trang như bình thường nếu không có token và đang ở trang login
  return element;
};

export default AuthContext;
