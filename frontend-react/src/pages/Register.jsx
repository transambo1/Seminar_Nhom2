import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../api/apiServices';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName:'', phoneNumber:'', email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await registerApi(form);
      alert('Thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch(err) { alert('Đăng ký thất bại'); }
  };

  return (
    <div className="container" style={{maxWidth: '400px', marginTop: '10vh'}}>
      <div className="card">
        <h2>Đăng ký</h2>
        <form onSubmit={submit} style={{marginTop: '20px'}}>
          <div className="form-group"><label>Họ và Tên</label><input onChange={e=>setForm({...form, fullName:e.target.value})}/></div>
          <div className="form-group"><label>Số điện thoại</label><input onChange={e=>setForm({...form, phoneNumber:e.target.value})}/></div>
          <div className="form-group"><label>Email</label><input type="email" onChange={e=>setForm({...form, email:e.target.value})}/></div>
          <div className="form-group"><label>Mật khẩu</label><input type="password" onChange={e=>setForm({...form, password:e.target.value})}/></div>
          <button className="btn" style={{width:'100%'}}>Đăng ký</button>
        </form>
      </div>
    </div>
  );
};
export default Register;
