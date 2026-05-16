import React, { useEffect, useState } from 'react';
import { getTeamByLeaderIdApi, getTeamMembersApi, addTeamMemberApi } from '../../api/leaderApi';
import { 
  Shield, Users, Phone, Plus, RefreshCw, X, 
  AlertTriangle, UserCheck, MapPin, Activity
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

const LeaderTeam = () => {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Leader identity logic
  const getLeaderId = () => {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user.userId;
      } catch (e) {
        console.error("Parse user error", e);
      }
    }
    return null; 
  };


  const [memberForm, setMemberForm] = useState({
    userId: '',
    memberRole: 'MEMBER',
    status: 'AVAILABLE',
    latitude: '',
    longitude: ''
  });

  const loadData = async () => {
    const leaderId = getLeaderId();
    if (!leaderId) {
        setError("Không xác định được người dùng hiện tại, vui lòng đăng nhập lại.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const teamRes = await getTeamByLeaderIdApi(leaderId);
      const teamData = teamRes.data;
      setTeam(teamData);
      
      if (teamData && teamData.id) {
        const membersRes = await getTeamMembersApi(teamData.id);
        setMembers(membersRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin đội. Có thể bạn chưa được gán làm đội trưởng của đội nào.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!team) return;
    try {
      await addTeamMemberApi(team.id, {
        ...memberForm,
        userId: parseInt(memberForm.userId),
        latitude: memberForm.latitude ? parseFloat(memberForm.latitude) : null,
        longitude: memberForm.longitude ? parseFloat(memberForm.longitude) : null
      });
      setIsModalOpen(false);
      setMemberForm({ userId: '', memberRole: 'MEMBER', status: 'AVAILABLE', latitude: '', longitude: '' });
      
      // Reload members
      const res = await getTeamMembersApi(team.id);
      setMembers(res.data || []);
      alert("Thêm thành viên thành công!");
    } catch (err) {
      alert("Lỗi khi thêm thành viên: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <MainLayout title="Đội của tôi">
      <div style={{padding: '60px', textAlign: 'center'}}>
        <RefreshCw size={32} className="animate-spin mx-auto text-blue-500 mb-4" />
        <p>Đang tải dữ liệu đội...</p>
      </div>
    </MainLayout>
  );

  if (error || !team) return (
    <MainLayout title="Đội của tôi">
      <div style={{padding: '60px', textAlign: 'center', color: '#ef4444'}}>
        <AlertTriangle size={32} className="mx-auto mb-4" />
        <p>{error || "Bạn không thuộc đội cứu hộ nào."}</p>
        <button onClick={loadData} className="btn-admin btn-admin-primary" style={{marginTop: '20px'}}>Thử lại</button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout title="Quản lý đội cứu hộ">
      <div className="admin-page-container">
        {/* Team Overview Card */}
        <div className="admin-table-wrapper" style={{padding: '24px', marginBottom: '24px', border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px'}}>
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                <div style={{background: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px'}}>
                    <Shield size={40} />
                </div>
                <div>
                    <h2 style={{margin: '0 0 4px 0', fontSize: '1.5rem', color: '#1e293b'}}>{team.name}</h2>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.95rem'}}>
                        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><MapPin size={16}/> {team.area}</span>
                        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Phone size={16}/> {team.phone}</span>
                    </div>
                </div>
            </div>
            
            <div style={{display: 'flex', gap: '24px'}}>
                <div style={{textAlign: 'center'}}>
                    <p style={{margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600'}}>SỨC CHỨA</p>
                    <h3 style={{margin: 0, color: '#1e293b'}}>{team.capacity}</h3>
                </div>
                <div style={{textAlign: 'center'}}>
                    <p style={{margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600'}}>TẢI HIỆN TẠI</p>
                    <h3 style={{margin: 0, color: (team.currentLoad || 0) >= team.capacity ? '#ef4444' : '#2563eb'}}>{team.currentLoad || 0}</h3>
                </div>
                <div style={{textAlign: 'center'}}>
                    <p style={{margin: '0 0 4px 0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600'}}>TRẠNG THÁI</p>
                    <span className={`admin-badge badge-${team.status?.toLowerCase()}`}>{team.status}</span>
                </div>
            </div>
          </div>
          
          <div style={{marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px'}}>
             <div style={{flexGrow: 1, height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden'}}>
                <div style={{
                    height: '100%', 
                    width: `${Math.min(100, ((team.currentLoad || 0) / (team.capacity || 10)) * 100)}%`, 
                    background: (team.currentLoad || 0) >= team.capacity ? '#ef4444' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                    borderRadius: '5px'
                }}></div>
             </div>
             <span style={{fontSize: '0.9rem', fontWeight: '700', color: '#475569'}}>{Math.round(((team.currentLoad || 0) / (team.capacity || 10)) * 100)}% tải</span>
          </div>
        </div>

        {/* Members Section */}
        <div className="admin-header" style={{marginTop: '40px'}}>
            <div className="admin-header-info">
                <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', margin: 0}}>
                    <Users size={22} color="#2563eb"/> Danh sách thành viên ({members.length})
                </h3>
            </div>
            <button className="btn-admin btn-admin-primary" onClick={() => setIsModalOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Plus size={18} /> Thêm thành viên
            </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Công việc hiện tại</th>
                <th>Vị trí</th>
                <th>Cập nhật cuối</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? members.map(m => (
                <tr key={m.id}>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><UserCheck size={16} color="#64748b"/> <strong>#{m.userId}</strong></div></td>
                  <td>
                    <span style={{
                        fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px',
                        background: m.memberRole === 'LEADER' ? '#eff6ff' : '#f8fafc',
                        color: m.memberRole === 'LEADER' ? '#1e40af' : '#64748b',
                        fontWeight: '700', border: '1px solid currentColor'
                    }}>{m.memberRole}</span>
                  </td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <div style={{width: '10px', height: '10px', borderRadius: '50%', background: m.status === 'AVAILABLE' ? '#10b981' : m.status === 'BUSY' ? '#f59e0b' : '#94a3b8'}}></div>
                        <span>{m.status}</span>
                    </div>
                  </td>
                  <td><div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Activity size={14} color="#64748b"/> <strong>{m.currentLoad || 0}</strong></div></td>
                  <td><span style={{fontSize: '0.85rem', color: '#64748b'}}>{m.latitude ? `${m.latitude.toFixed(4)}, ${m.longitude.toFixed(4)}` : '--'}</span></td>
                  <td><span style={{fontSize: '0.85rem', color: '#94a3b8'}}>{new Date(m.updatedAt).toLocaleString()}</span></td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Đội chưa có thành viên. Hãy thêm thành viên đầu tiên.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Add Member */}
        {isModalOpen && (
          <div className="storm-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="storm-modal" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{background: '#f0fdf4', padding: '10px', borderRadius: '10px'}}><Plus size={22} color="#16a34a"/></div>
                      <h3 style={{margin: 0, fontSize: '1.2rem', color: '#1e293b'}}>Thêm thành viên vào đội</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} style={{background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex'}}><X size={20}/></button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="modal-body">
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <div>
                      <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>User ID (Mã định danh hệ thống)</label>
                      <input required type="number" className="filter-input" style={{width: '100%'}} value={memberForm.userId} onChange={e => setMemberForm({...memberForm, userId: e.target.value})} placeholder="Nhập ID tài khoản cứu hộ..." />
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Vai trò trong đội</label>
                      <select className="filter-input" style={{width: '100%'}} value={memberForm.memberRole} onChange={e => setMemberForm({...memberForm, memberRole: e.target.value})}>
                        <option value="MEMBER">Thành viên (Member)</option>
                        <option value="LEADER">Đội trưởng (Leader)</option>
                      </select>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                        <div>
                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Vĩ độ (Latitude)</label>
                            <input type="number" step="any" className="filter-input" style={{width: '100%'}} value={memberForm.latitude} onChange={e => setMemberForm({...memberForm, latitude: e.target.value})} placeholder="10.7..." />
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px'}}>Kinh độ (Longitude)</label>
                            <input type="number" step="any" className="filter-input" style={{width: '100%'}} value={memberForm.longitude} onChange={e => setMemberForm({...memberForm, longitude: e.target.value})} placeholder="106.7..." />
                        </div>
                    </div>
                    <p style={{fontSize: '0.75rem', color: '#94a3b8', margin: 0}}>Lưu ý: Hệ thống chỉ chấp nhận User ID đã tồn tại và có vai trò phù hợp.</p>
                  </div>
                </div>
                <div style={{padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc', borderRadius: '0 0 16px 16px'}}>
                  <button type="button" className="btn-admin btn-admin-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-admin btn-admin-primary" style={{padding: '10px 32px'}}>Thêm vào đội</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LeaderTeam;
