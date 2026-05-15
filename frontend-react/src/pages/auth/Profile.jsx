import React from 'react';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '600px' }}>
      <div className="card" style={{ padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 15px', color: '#64748b' }}>
            <User size={40} />
          </div>
          <h1 style={{ margin: 0 }}>{user.fullName || 'Người dùng'}</h1>
          <p style={{ color: '#64748b', margin: '5px 0' }}>{user.role === 'CITIZEN' ? 'Công dân StormShield' : 'Thành viên hệ thống'}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
            <Mail color="#64748b" />
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Email</label>
              <strong>{user.email || 'N/A'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
            <Shield color="#64748b" />
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Vai trò</label>
              <strong>{user.role || 'CITIZEN'}</strong>
            </div>
          </div>
        </div>

        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          style={{ width: '100%', marginTop: '30px', padding: '12px', background: '#fee2e2', color: '#991b1b', border: '0', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </div>
  );
}
