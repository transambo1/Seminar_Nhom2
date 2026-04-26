import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { getUnreadCountApi } from '../api/apiServices';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token && user.id) {
      // Initial fetch
      getUnreadCountApi(user.id).then(res => setUnreadCount(res.data.unreadCount));

      // SSE Connection
      const eventSource = new EventSource(`http://localhost:8080/api/v1/notifications/stream?userId=${user.id}`);
      
      eventSource.addEventListener('notification', (event) => {
        setUnreadCount(prev => prev + 1);
      });

      return () => eventSource.close();
    }
  }, [token, user.id]);

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
            <NavLink to="/request-list" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Danh sách yêu cầu</NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} style={{position: 'relative'}}>
              <span role="img" aria-label="notifications" style={{fontSize: '1.2rem'}}>🔔</span>
              {unreadCount > 0 && (
                <span className="badge" style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-10px',
                  background: '#ff4d4f',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
            {(user.role === 'ADMIN' || user.role === 'RESCUER') && (
              <>
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
