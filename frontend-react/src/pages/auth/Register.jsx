import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../../api/authApi';
import '../../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    terms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!form.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    
    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!form.terms) newErrors.terms = 'Bạn phải đồng ý với điều khoản';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password
      };
      
      await registerApi(payload);
      setApiSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* Left Panel: Branding & Emergency Info */}
      <div className="register-left-panel">
        <div className="register-bg-img">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD09kYlUY59-BfeXZ0Bi_KajxWm6FwoKc6v9JJG6-W8VZQEdw8BUx6tMInQROYKypYQlyGR_A8_Yc-7m6dlXSlOwPLaCdmog1XVUgaWQwgniWIv9r437J7V0iZjh8F2hLt7A9fyxtBUW6W_y63bTs1JEf_oldQ6CeXQ_yHUU7pLzEyRqSvNLpVQbtmDCVjThEFG94vxQ7uUYsegqzxZyONqx0vnwMwPS3wzFjxh5rIkZZH07PXtoSfBSgRdz6ToOt-aULmRMws1RWc" 
            alt="StormShield map view" 
          />
          <div className="register-bg-overlay"></div>
        </div>

        <div className="register-left-content-top">
          <div className="register-logo-box">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          </div>
          <span className="register-brand-name">StormShield</span>
        </div>

        <div className="register-left-content-middle">
          <h1 className="register-hero-title">
            An toàn của bạn là <br /><span>ưu tiên hàng đầu</span>
          </h1>
          <p className="register-hero-desc">
            Tham gia mạng lưới StormShield để nhận cảnh báo sớm, báo cáo tình trạng khẩn cấp và kết nối trực tiếp với lực lượng cứu hộ trong khu vực của bạn.
          </p>
          
          <div className="register-features">
            <div className="register-feature-item">
              <span className="material-symbols-outlined register-feature-icon">campaign</span>
              <div className="register-feature-text">
                <h4>Cảnh báo theo thời gian thực</h4>
                <p>Nhận thông báo ngay lập tức về các rủi ro gần vị trí của bạn.</p>
              </div>
            </div>
            <div className="register-feature-item">
              <span className="material-symbols-outlined register-feature-icon">sos</span>
              <div className="register-feature-text">
                <h4>Yêu cầu cứu trợ khẩn cấp</h4>
                <p>Gửi vị trí chính xác để đội phản ứng nhanh hỗ trợ kịp thời.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-left-content-bottom">
          <p>© 2024 StormShield System. Cấp độ bảo mật mức 1.</p>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="register-right-panel">
        <div className="register-mobile-header">
          <div className="register-mobile-logo-box">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          </div>
          <span className="register-mobile-brand-name">StormShield</span>
        </div>

        <div className="register-form-container">
          <div className="register-form-header">
            <h2>Đăng ký tài khoản Người dân</h2>
            <p>Tài khoản người dân dùng để gửi yêu cầu cứu trợ, báo cáo sự cố và nhận cảnh báo gần vị trí.</p>
          </div>

          {apiError && (
            <div className="register-alert-box" role="alert">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="register-success-box" role="alert">
              {apiSuccess}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="register-form-group">
              <label className="register-label" htmlFor="fullName">Họ và tên</label>
              <div className="register-input-wrapper">
                <div className="register-input-icon">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <input 
                  className={`register-input ${errors.fullName ? 'error' : ''}`}
                  id="fullName" 
                  name="fullName" 
                  placeholder="Nguyễn Văn A" 
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              {errors.fullName && <span className="register-error-msg">{errors.fullName}</span>}
            </div>

            {/* Grid for Email & Phone */}
            <div className="register-grid-2">
              {/* Email */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="email">Email</label>
                <div className="register-input-wrapper">
                  <div className="register-input-icon">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input 
                    className={`register-input ${errors.email ? 'error' : ''}`}
                    id="email" 
                    name="email" 
                    placeholder="email@ví_dụ.com" 
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="register-error-msg">{errors.email}</span>}
              </div>
              
              {/* Phone */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="phone">Số điện thoại</label>
                <div className="register-input-wrapper">
                  <div className="register-input-icon">
                    <span className="material-symbols-outlined">phone</span>
                  </div>
                  <input 
                    className={`register-input ${errors.phone ? 'error' : ''}`}
                    id="phone" 
                    name="phone" 
                    placeholder="090 123 4567" 
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                {errors.phone && <span className="register-error-msg">{errors.phone}</span>}
              </div>
            </div>

            {/* Password */}
            <div className="register-form-group">
              <label className="register-label" htmlFor="password">Mật khẩu</label>
              <div className="register-input-wrapper">
                <div className="register-input-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input 
                  className={`register-input ${errors.password ? 'error' : ''}`}
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <span className="register-error-msg">{errors.password}</span>}
            </div>

            {/* Terms Checkbox */}
            <div className="register-terms">
              <input 
                className="register-checkbox" 
                id="terms" 
                name="terms" 
                type="checkbox"
                checked={form.terms}
                onChange={handleChange}
              />
              <div className="register-terms-text">
                <label className="register-terms-label" htmlFor="terms">
                  Tôi đồng ý với các <Link to="#">điều khoản</Link> và <Link to="#">chính sách bảo mật</Link> của StormShield
                </label>
                {errors.terms && <div className="register-error-msg" style={{marginTop: '4px'}}>{errors.terms}</div>}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="register-submit-btn" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          {/* Login Link */}
          <div className="register-footer">
            <p>
              Đã có tài khoản?{' '}
              <Link to="/login">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
