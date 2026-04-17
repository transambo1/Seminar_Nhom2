import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">StormShield</Link>
      <div className="nav-links">
        {token ? (
          <>
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Bảng điều khiển</NavLink>
            <NavLink to="/alerts" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Cảnh báo</NavLink>
            <NavLink to="/my-supports" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Yêu cầu của tôi</NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Thông báo</NavLink>
            {(user.role === 'ADMIN' || user.role === 'RESCUER') && (
              <>
                <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "nav-item admin-link active" : "nav-item admin-link"}>Duyệt báo cáo</NavLink>
                <NavLink to="/admin/supports" className={({ isActive }) => isActive ? "nav-item admin-link active" : "nav-item admin-link"}>Quản lý cứu hộ</NavLink>
              </>
            )}
            <button onClick={logout} className="btn btn-outline" style={{marginLeft: '15px'}}>Đăng xuất</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Đăng nhập</NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Đăng ký</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
