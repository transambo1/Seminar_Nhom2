import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/apiServices';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginApi(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch(err) { alert('Đăng nhập thất bại'); }
  };

  return (
    <div className="container" style={{maxWidth: '400px', marginTop: '10vh'}}>
      <div className="card">
        <h2 style={{marginBottom: '20px'}}>Đăng nhập StormShield</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn" style={{width: '100%'}}>Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};
export default Login;
