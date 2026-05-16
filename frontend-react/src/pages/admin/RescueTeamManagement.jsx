import React, { useEffect, useState } from 'react';
import { getRescueTeamsApi, createRescueTeamApi, getRescueTeamMembersApi } from '../../api/rescueTeamApi';
import { createRescueAccountApi } from '../../api/authApi';
import { 
  Shield, Users, Phone, Plus, RefreshCw, X, 
  CheckCircle, AlertTriangle, UserCheck, Mail, Lock, User
} from 'lucide-react';

const RescueTeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    phone: '',
    latitude: '',
    longitude: '',
    capacity: 10,
    // Leader info
    leaderFullName: '',
    leaderEmail: '',
    leaderPhone: '',
    leaderPassword: ''
  });

  const loadTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRescueTeamsApi();
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đội cứu hộ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const leaderPayload = {
      fullName: formData.leaderFullName,
      email: formData.leaderEmail,
      phone: formData.leaderPhone,
      password: formData.leaderPassword,
      role: "RESCUE_LEADER"
    };

    console.log("Submitting leader account payload:", leaderPayload);

    try {
      // 1. Create Leader Account first
      const leaderRes = await createRescueAccountApi(leaderPayload);

      console.log("Leader account created successfully:", leaderRes.data);
      const leaderId = leaderRes.data.id;

      // 2. Create Rescue Team with the new leaderId
      try {
        await createRescueTeamApi({
          name: formData.name,
          area: formData.area,
          phone: formData.phone,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          capacity: parseInt(formData.capacity),
          leaderId: leaderId
        });
        
        setIsModalOpen(false);
        setFormData({ 
            name: '', area: '', phone: '', latitude: '', longitude: '', capacity: 10,
            leaderFullName: '', leaderEmail: '', leaderPhone: '', leaderPassword: ''
        });
        loadTeams();
        alert("Đã tạo đội cứu hộ và tài khoản đội trưởng thành công!");
      } catch (teamErr) {
        console.error("Team creation error:", teamErr);
        const errorMsg = teamErr.response?.data?.message || teamErr.response?.data?.error || "Tạo đội thất bại";
        alert(`Đã tạo tài khoản đội trưởng (ID: ${leaderId}) nhưng tạo đội thất bại: ${errorMsg}`);
      }
    } catch (authErr) {
      console.error("Auth creation error:", authErr);
      const serverError = authErr.response?.data;
      const errorMsg = serverError?.message || serverError?.error || (typeof serverError === 'object' ? JSON.stringify(serverError) : null) || "Lỗi khi tạo tài khoản đội trưởng";
      alert(`Lỗi 400: ${errorMsg}`);
    }
  };

  const viewMembers = async (team) => {
    try {
      const res = await getRescueTeamMembersApi(team.id);
      setSelectedTeamMembers({ team, members: res.data || [] });
    } catch (err) {
      alert("Không thể tải danh sách thành viên");
    }
  };

  const stats = {
    total: teams.length,
    active: teams.filter(t => t.status === 'ACTIVE').length,
    busy: teams.filter(t => t.status === 'BUSY').length,
    totalLoad: teams.reduce((acc, curr) => acc + (curr.currentLoad || 0), 0)
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <div className="admin-header-info">
          <h1>Quản lý đội cứu hộ</h1>
          <p>Tạo và theo dõi các đội cứu hộ tham gia xử lý yêu cầu khẩn cấp trên toàn hệ thống.</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
            <button className="btn-admin btn-admin-outline" onClick={loadTeams}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <button className="btn-admin btn-admin-primary" onClick={() => setIsModalOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Plus size={18} /> Tạo đội mới
            </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#eff6ff', color: '#2563eb'}}><Shield size={24} /></div>
          <div className="stat-val"><h4>{stats.total}</h4><p>Tổng số đội</p></div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#f0fdf4', color: '#16a34a'}}><CheckCircle size={24} /></div>
          <div className="stat-val"><h4>{stats.active}</h4><p>Đang hoạt động</p></div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#fff7ed', color: '#ea580c'}}><AlertTriangle size={24} /></div>
          <div className="stat-val"><h4>{stats.busy}</h4><p>Đội đang bận</p></div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#f5f3ff', color: '#7c3aed'}}><Users size={24} /></div>
          <div className="stat-val"><h4>{stats.totalLoad}</h4><p>Tổng tải hiện tại</p></div>
        </div>
      </div>

      {loading && teams.length === 0 ? (
        <div className="admin-table-wrapper" style={{padding: '60px', textAlign: 'center'}}>
          <RefreshCw size={32} className="animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-500">Đang tải danh sách đội cứu hộ...</p>
        </div>
      ) : error ? (
        <div className="admin-table-wrapper" style={{padding: '60px', textAlign: 'center', color: '#ef4444'}}>
          <AlertTriangle size={32} className="mx-auto mb-4" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <div style={{overflowX: 'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên đội</th>
                  <th>Khu vực</th>
                  <th>Hotline</th>
                  <th>Trạng thái</th>
                  <th>Leader ID</th>
                  <th>Sức chứa</th>
                  <th>Tải hiện tại</th>
                  <th>Tọa độ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {teams.length > 0 ? teams.map(team => (
                  <tr key={team.id}>
                    <td><span style={{fontWeight: '600', color: '#64748b'}}>#{team.id}</span></td>
                    <td><strong>{team.name}</strong></td>
                    <td><span style={{fontSize: '0.85rem'}}>{team.area}</span></td>
                    <td><div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb'}}><Phone size={14}/> {team.phone}</div></td>
                    <td>
                      <span className={`admin-badge badge-${team.status?.toLowerCase() || 'inactive'}`}>
                        {team.status || 'INACTIVE'}
                      </span>
                    </td>
                    <td><span style={{fontWeight: '600'}}>User {team.leaderId}</span></td>
                    <td>{team.capacity}</td>
                    <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={{flexGrow: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', width: '60px'}}>
                                <div style={{
                                    height: '100%', 
                                    width: `${Math.min(100, ((team.currentLoad || 0) / (team.capacity || 10)) * 100)}%`, 
                                    background: (team.currentLoad || 0) >= (team.capacity || 10) ? '#ef4444' : '#3b82f6',
                                    borderRadius: '3px'
                                }}></div>
                            </div>
                            <span style={{fontSize: '0.8rem', fontWeight: '700'}}>{team.currentLoad || 0}</span>
                        </div>
                    </td>
                    <td><span style={{fontSize: '0.8rem', color: '#64748b'}}>{team.latitude?.toFixed(4)}, {team.longitude?.toFixed(4)}</span></td>
                    <td>
                      <button className="btn-admin btn-admin-outline" style={{padding: '4px 10px', fontSize: '0.8rem'}} onClick={() => viewMembers(team)}>
                        <Users size={14} style={{marginRight: '6px'}}/> Thành viên
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="10" style={{textAlign: 'center', padding: '60px', color: '#94a3b8'}}>Chưa có đội cứu hộ nào được tạo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Create Team */}
      {isModalOpen && (
        <div className="storm-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="storm-modal" style={{maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{background: '#eff6ff', padding: '10px', borderRadius: '10px'}}><Shield size={22} color="#2563eb"/></div>
                    <h3 style={{margin: 0, fontSize: '1.2rem', color: '#1e293b'}}>Thiết lập đội cứu hộ mới</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex'}}><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateTeam}>
                <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto', padding: '24px'}}>
                    
                    {/* Section A: Team Info */}
                    <div style={{marginBottom: '32px'}}>
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', marginBottom: '16px', fontSize: '1rem'}}>
                            <Shield size={18}/> 1. Thông tin đội cứu hộ
                        </h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '26px'}}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Tên đội</label>
                                    <input required className="filter-input" style={{width: '100%'}} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ví dụ: Đội cứu hộ Quận 1" />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Khu vực quản lý</label>
                                    <input required className="filter-input" style={{width: '100%'}} value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="Ví dụ: Quận 1, TP.HCM" />
                                </div>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Hotline đội</label>
                                    <input required className="filter-input" style={{width: '100%'}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="090..." />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Sức chứa tối đa (Case)</label>
                                    <input required type="number" className="filter-input" style={{width: '100%'}} value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="10" />
                                </div>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Vĩ độ (Latitude)</label>
                                    <input required type="number" step="any" className="filter-input" style={{width: '100%'}} value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="10.77..." />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Kinh độ (Longitude)</label>
                                    <input required type="number" step="any" className="filter-input" style={{width: '100%'}} value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="106.7..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section B: Leader Account */}
                    <div>
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', marginBottom: '16px', fontSize: '1rem'}}>
                            <UserCheck size={18}/> 2. Tài khoản Đội trưởng (Leader)
                        </h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '26px'}}>
                            <div>
                                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Họ và tên</label>
                                <div style={{position: 'relative'}}>
                                    <User size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}/>
                                    <input required className="filter-input" style={{width: '100%', paddingLeft: '38px'}} value={formData.leaderFullName} onChange={e => setFormData({...formData, leaderFullName: e.target.value})} placeholder="Nguyễn Văn A" />
                                </div>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Email tài khoản</label>
                                    <div style={{position: 'relative'}}>
                                        <Mail size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}/>
                                        <input required type="email" className="filter-input" style={{width: '100%', paddingLeft: '38px'}} value={formData.leaderEmail} onChange={e => setFormData({...formData, leaderEmail: e.target.value})} placeholder="leader@stormshield.vn" />
                                    </div>
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Số điện thoại cá nhân</label>
                                    <div style={{position: 'relative'}}>
                                        <Phone size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}/>
                                        <input required className="filter-input" style={{width: '100%', paddingLeft: '38px'}} value={formData.leaderPhone} onChange={e => setFormData({...formData, leaderPhone: e.target.value})} placeholder="09xxx" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Mật khẩu khởi tạo</label>
                                <div style={{position: 'relative'}}>
                                    <Lock size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}/>
                                    <input required type="password" className="filter-input" style={{width: '100%', paddingLeft: '38px'}} value={formData.leaderPassword} onChange={e => setFormData({...formData, leaderPassword: e.target.value})} placeholder="••••••••" />
                                </div>
                                <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px'}}>Mật khẩu phải có ít nhất 6 ký tự.</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div style={{padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc', borderRadius: '0 0 16px 16px'}}>
                    <button type="button" className="btn-admin btn-admin-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                    <button type="submit" className="btn-admin btn-admin-primary" style={{padding: '10px 32px'}}>Kích hoạt Đội & Leader</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Members */}
      {selectedTeamMembers && (
        <div className="storm-modal-overlay" onClick={() => setSelectedTeamMembers(null)}>
          <div className="storm-modal" style={{maxWidth: '750px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{background: '#f5f3ff', padding: '10px', borderRadius: '10px'}}><Users size={22} color="#7c3aed"/></div>
                    <div>
                        <h3 style={{margin: 0, fontSize: '1.2rem', color: '#1e293b'}}>Thành viên đội: {selectedTeamMembers.team.name}</h3>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>Tổng cộng: {selectedTeamMembers.members.length} thành viên</p>
                    </div>
                </div>
                <button onClick={() => setSelectedTeamMembers(null)} style={{background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex'}}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{padding: '0'}}>
                <table className="admin-table" style={{border: 'none'}}>
                    <thead style={{background: '#f8fafc'}}>
                        <tr>
                            <th style={{paddingLeft: '24px'}}>User ID</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Tải (Current Load)</th>
                            <th>Vị trí cuối</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedTeamMembers.members.length > 0 ? selectedTeamMembers.members.map(m => (
                            <tr key={m.id}>
                                <td style={{paddingLeft: '24px'}}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><UserCheck size={16} color="#64748b"/> <strong>ID {m.userId}</strong></div></td>
                                <td>
                                    <span style={{
                                        fontSize: '0.7rem', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px',
                                        background: m.memberRole === 'LEADER' ? '#eff6ff' : '#f1f5f9',
                                        color: m.memberRole === 'LEADER' ? '#1e40af' : '#475569',
                                        fontWeight: '700',
                                        border: '1px solid currentColor'
                                    }}>{m.memberRole}</span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                        <div style={{width: '8px', height: '8px', borderRadius: '50%', background: m.status === 'AVAILABLE' ? '#10b981' : m.status === 'BUSY' ? '#f59e0b' : '#94a3b8'}}></div>
                                        <span style={{fontSize: '0.85rem'}}>{m.status}</span>
                                    </div>
                                </td>
                                <td><strong>{m.currentLoad || 0}</strong></td>
                                <td><span style={{fontSize: '0.8rem', color: '#64748b'}}>{m.latitude ? `${m.latitude.toFixed(4)}, ${m.longitude.toFixed(4)}` : '--'}</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Đội chưa có thành viên nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#fcfdfe', borderRadius: '0 0 16px 16px'}}>
                <button className="btn-admin btn-admin-primary" onClick={() => setSelectedTeamMembers(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueTeamManagement;
