import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../api/apiServices';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await loginApi(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      const role = res.data.user.role;
      if (role === 'ADMIN') {
        navigate('/admin/supports');
      } else if (role === 'RESCUE') {
        navigate('/'); // Resize Dashboard (placeholder)
      } else {
        navigate('/'); // Citizen Home
      }
    } catch(err) { 
      setErrorMsg('Email hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left-panel">
        <div 
          className="login-bg-img" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCBP2VfmI7a03Y8ORER8rq_MnlV6dypmHqzGlfaJI_hSeq_d4x_buGTMSNgGPG0DausXEUvCTni8zSF9lw9g1d2tHnPUoAG1uh0IV0NROVj2OD_U0JbMZlVurqwS25rej3KQzMICYk6FwVfsLrK8xDR-E4AbS_47lchZq1O4H5FaLlkAYUd3QEXBwxJ8Upa6LUINVi53yjnb76dlpXePG9w5lyBgTQsGlDDwAIr9FdknT7FqAJ-r0K22rfUCfb9Sh4NcOA4OACgSgg')" }}
        ></div>
        <div className="login-bg-gradient"></div>
        <div className="login-left-content">
          <div className="login-brand-header">
            <div className="login-logo-box">
              <span className="material-symbols-outlined">security</span>
            </div>
            <span className="login-brand-name">StormShield</span>
          </div>
          <h1 className="login-hero-title">StormShield - Hệ thống ứng phó khẩn cấp</h1>
          <div className="login-divider"></div>
          <ul className="login-features">
            <li className="login-feature-item">
              <div className="login-feature-icon">
                <span className="material-symbols-outlined">notifications_active</span>
              </div>
              <span className="login-feature-text">Nhận cảnh báo thiên tai</span>
            </li>
            <li className="login-feature-item">
              <div className="login-feature-icon">
                <span className="material-symbols-outlined">sos</span>
              </div>
              <span className="login-feature-text">Gửi yêu cầu cứu trợ</span>
            </li>
            <li className="login-feature-item">
              <div className="login-feature-icon">
                <span className="material-symbols-outlined">location_city</span>
              </div>
              <span className="login-feature-text">Tìm nơi trú ẩn</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-mobile-header">
            <span className="material-symbols-outlined">security</span>
            <span className="title">StormShield</span>
          </div>

          <h2 className="login-form-title">Đăng nhập vào StormShield</h2>
          <p className="login-form-subtitle">Theo dõi cảnh báo thiên tai và nhận hỗ trợ khi cần thiết</p>

          {errorMsg && (
            <div className="login-error-banner" role="alert">
              <span className="material-symbols-outlined">error</span>
              <div className="login-error-text">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label className="login-label" htmlFor="email">Email</label>
              <div className="login-input-wrapper">
                <div className="login-input-icon">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <input 
                  className={`login-input ${errorMsg ? 'error' : ''}`}
                  id="email" 
                  name="email" 
                  placeholder="Nhập địa chỉ email" 
                  required 
                  type="email" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label" htmlFor="password" style={{ marginBottom: 0 }}>Mật khẩu</label>
                <Link className="login-forgot-link" to="/forgot-password">Quên mật khẩu?</Link>
              </div>
              <div className="login-input-wrapper">
                <div className="login-input-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input 
                  className={`login-input ${errorMsg ? 'error' : ''}`}
                  id="password" 
                  name="password" 
                  placeholder="Nhập mật khẩu" 
                  required 
                  type="password" 
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
              </div>
            </div>

            <div className="login-remember">
              <input 
                className="login-remember-checkbox" 
                id="remember" 
                name="remember" 
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <label className="login-remember-label" htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>

            <button className="login-submit-btn" type="submit">
              Đăng nhập
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Chưa có tài khoản? <Link className="login-footer-link" to="/register">Đăng ký</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
