import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getMyTeamApi, 
  getTeamMembersApi, 
  addTeamMemberApi, 
  getRequestsByTeamIdApi, 
  assignRequestToMemberApi,
  getUserDetailApi,
  createRescueMemberApi
} from '../../api/leaderApi';
import { 
  Shield, Users, Phone, Plus, RefreshCw, X, 
  CheckCircle, AlertTriangle, UserCheck, MapPin, 
  Activity, Eye, Clock, Info, User, ClipboardList
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

const LeaderTeamPage = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);
  const [selectedRequestToAssign, setSelectedRequestToAssign] = useState(null);

  const [addMemberForm, setAddMemberForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'RESCUE'
  });

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const teamRes = await getMyTeamApi();
      const teamData = teamRes.data;
      setTeam(teamData);
      
      if (teamData && teamData.id) {
        const [membersRes, requestsRes] = await Promise.all([
          getTeamMembersApi(teamData.id),
          getRequestsByTeamIdApi(teamData.id)
        ]);
        setMembers(membersRes.data || []);
        setRequests(requestsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin đội của bạn. Vui lòng kiểm tra lại quyền hạn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!team) return;
    try {
      // 1. Create account first using the specific leader-to-member endpoint
      const userRes = await createRescueMemberApi(addMemberForm);
      const newUserId = userRes.data.id;

      // 2. Add to team
      await addTeamMemberApi(team.id, {
        userId: newUserId,
        memberRole: 'MEMBER', // Standardized role name
        status: 'AVAILABLE'
      });

      alert("Thêm thành viên mới thành công!");
      setIsAddMemberOpen(false);
      setAddMemberForm({ fullName: '', email: '', phone: '', password: '', role: 'RESCUE' });
      loadAllData();
    } catch (err) {
      console.error("Add member error:", err);
      const errorData = err.response?.data;
      const message = errorData?.message || errorData?.error || (typeof errorData === 'string' ? errorData : null) || err.message;
      alert("Lỗi: " + message);
    }
  };


  const handleAssign = async (memberId) => {
    if (!selectedRequestToAssign || !team) return;
    
    const member = members.find(m => m.userId === memberId);
    if (member && member.status === 'BUSY') {
        if (!window.confirm("Thành viên này đang xử lý yêu cầu khác. Bạn vẫn muốn phân công?")) return;
    }

    try {
      await assignRequestToMemberApi(selectedRequestToAssign.id, {
        assignedTeamId: team.id,
        assignedRescueUserId: memberId
      });
      alert("Phân công thành viên thành công!");
      setSelectedRequestToAssign(null);
      loadAllData();
    } catch (err) {
      alert("Lỗi phân công: " + (err.response?.data?.message || err.message));
    }
  };

  const showMemberDetail = async (member) => {
    try {
        const res = await getUserDetailApi(member.userId);
        setSelectedMemberDetail({ ...member, userInfo: res.data });
    } catch (err) {
        setSelectedMemberDetail(member);
    }
  };

  if (loading && !team) return (
    <MainLayout title="Đội của tôi">
      <div style={{padding: '100px', textAlign: 'center'}}><RefreshCw className="animate-spin mx-auto mb-4" size={40} color="#2563eb"/><p>Đang tải dữ liệu đội...</p></div>
    </MainLayout>
  );

  if (error) return (
    <MainLayout title="Đội của tôi">
        <div className="admin-table-wrapper" style={{padding: '60px', textAlign: 'center', color: '#ef4444'}}>
            <AlertTriangle size={48} className="mx-auto mb-4" />
            <p style={{fontSize: '1.2rem', fontWeight: '600'}}>{error}</p>
            <button className="btn-admin btn-admin-primary" style={{marginTop: '20px'}} onClick={loadAllData}>Thử lại</button>
        </div>
    </MainLayout>
  );

  return (
    <MainLayout title="Quản lý đội cứu hộ">
      <div className="admin-page-container">
        
        {/* 1. Team Info Card */}
        <div className="admin-table-wrapper" style={{padding: '24px', marginBottom: '30px', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', border: '1px solid #bae6fd'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px'}}>
                <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                    <div style={{background: '#3b82f6', color: 'white', padding: '18px', borderRadius: '18px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'}}>
                        <Shield size={44} />
                    </div>
                    <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px'}}>
                            <h2 style={{margin: 0, fontSize: '1.75rem', color: '#0f172a'}}>{team?.name}</h2>
                            <span className={`admin-badge badge-${team?.status?.toLowerCase()}`}>{team?.status}</span>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                            <span style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#475569'}}><MapPin size={16} color="#ef4444"/> {team?.area}</span>
                            <span style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#475569'}}><Phone size={16} color="#3b82f6"/> Hotline: <strong>{team?.phone}</strong></span>
                            {team?.latitude && team?.longitude && (
                                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px'}}>
                                    <span style={{fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                                        Vị trí: <strong>{team.latitude.toFixed(5)}, {team.longitude.toFixed(5)}</strong>
                                    </span>
                                    <button 
                                        className="btn-admin btn-admin-outline" 
                                        style={{padding: '4px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px'}}
                                        onClick={() => navigate('/dashboard', { 
                                            state: { 
                                                focusLat: team.latitude, 
                                                focusLng: team.longitude,
                                                focusItem: {
                                                    type: 'RESCUE_TEAM',
                                                    name: team.name,
                                                    phone: team.phone,
                                                    area: team.area
                                                }
                                            } 
                                        })}
                                    >
                                        <Activity size={14} /> Xem trên bản đồ
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
                    <div style={{textAlign: 'center', padding: '0 15px', borderRight: '1px solid #f1f5f9'}}>
                        <p style={{margin: '0 0 5px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Sức chứa tối đa</p>
                        <h3 style={{margin: 0, fontSize: '1.5rem', color: '#1e293b'}}>{team?.capacity}</h3>
                    </div>
                    <div style={{textAlign: 'center', padding: '0 15px'}}>
                        <p style={{margin: '0 0 5px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Đang xử lý</p>
                        <h3 style={{margin: 0, fontSize: '1.5rem', color: '#2563eb'}}>{team?.currentLoad}</h3>
                    </div>
                </div>
           </div>
        </div>

        {/* 2. Members Section */}
        <div className="admin-header" style={{marginTop: '40px'}}>
            <div className="admin-header-info">
                <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Users size={24} color="#3b82f6"/> Thành viên trong đội ({members.length})
                </h3>
            </div>
            <button className="btn-admin btn-admin-primary" onClick={() => setIsAddMemberOpen(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Plus size={18}/> Thêm thành viên
            </button>
        </div>

        <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>User ID</th>
                        <th>Vai trò</th>
                        <th>Hoạt động</th>
                        <th>Phân công</th>
                        <th>Yêu cầu đang xử lý</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((m, idx) => (
                        <tr key={m.id}>
                            <td>{idx + 1}</td>
                            <td><strong>#{m.userId}</strong></td>
                            <td>
                                <span style={{
                                    fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                                    background: m.memberRole === 'LEADER' ? '#eff6ff' : '#f1f5f9',
                                    color: m.memberRole === 'LEADER' ? '#1e40af' : '#475569',
                                    fontWeight: '700', border: '1px solid currentColor'
                                }}>{m.memberRole}</span>
                            </td>
                            <td>
                                <span className={`admin-badge badge-${m.status === 'OFFLINE' ? 'inactive' : 'active'}`}>
                                    {m.status === 'AVAILABLE' ? 'KHẢ DỤNG' : m.status === 'BUSY' ? 'ĐANG BẬN' : m.status}
                                </span>
                            </td>
                            <td>
                                {m.status === 'BUSY' ? (
                                    <span style={{color: '#ea580c', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                        <Activity size={14}/> ĐANG HỖ TRỢ
                                    </span>
                                ) : (
                                    <span style={{color: '#10b981', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                        <CheckCircle size={14}/> RẢNH
                                    </span>
                                )}
                            </td>
                            <td style={{textAlign: 'center'}}><strong>{m.currentLoad || 0}</strong></td>
                            <td>
                                <button className="btn-admin btn-admin-outline" style={{padding: '4px 12px'}} onClick={() => showMemberDetail(m)}>
                                    <Eye size={14} style={{marginRight: '6px'}}/> Xem
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* 3. Requests Section */}
        <div className="admin-header" style={{marginTop: '50px'}}>
            <div className="admin-header-info">
                <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <ClipboardList size={24} color="#f59e0b"/> Yêu cầu cứu hộ của đội ({requests.length})
                </h3>
            </div>
            <button className="btn-admin btn-admin-outline" onClick={loadAllData}>
                <RefreshCw size={16}/> Làm mới
            </button>
        </div>

        <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Loại</th>
                        <th>Vị trí</th>
                        <th>Trạng thái</th>
                        <th>Người phụ trách</th>
                        <th>Cập nhật lúc</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length > 0 ? requests.map(req => (
                        <tr key={req.id}>
                            <td><strong>#{req.id}</strong></td>
                            <td>
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <span style={{fontWeight: '700'}}>{req.requestType}</span>
                                    <span style={{fontSize: '0.7rem', color: req.priorityLevel === 'URGENT' ? '#ef4444' : '#64748b'}}>Ưu tiên: {req.priorityLevel}</span>
                                </div>
                            </td>
                            <td><span style={{fontSize: '0.85rem'}}>{req.latitude?.toFixed(4)}, {req.longitude?.toFixed(4)}</span></td>
                            <td><span className={`admin-badge badge-${req.status?.toLowerCase()}`}>{req.status}</span></td>
                            <td>
                                {req.assignedRescueUserId ? (
                                    <span style={{fontWeight: '600', color: '#1e40af'}}>Rescue #{req.assignedRescueUserId}</span>
                                ) : (
                                    <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Chưa có người phụ trách</span>
                                )}
                            </td>
                            <td><span style={{fontSize: '0.8rem', color: '#94a3b8'}}><Clock size={12}/> {new Date(req.updatedAt).toLocaleTimeString()}</span></td>
                            <td>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button className="btn-admin btn-admin-primary" style={{padding: '4px 10px', fontSize: '0.8rem'}} onClick={() => setSelectedRequestToAssign(req)}>
                                        Phân công
                                    </button>
                                    <button className="btn-admin btn-admin-outline" style={{padding: '4px 8px'}}>
                                        <Info size={14}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Hiện không có yêu cầu nào cho đội.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* MODAL: Add Member */}
        {isAddMemberOpen && (
            <div className="storm-modal-overlay" onClick={() => setIsAddMemberOpen(false)}>
                <div className="storm-modal" style={{maxWidth: '550px'}} onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{background: '#eff6ff', padding: '10px', borderRadius: '10px'}}><Plus size={22} color="#2563eb"/></div>
                            <h3 style={{margin: 0}}>Thêm thành viên cứu hộ mới</h3>
                        </div>
                        <button onClick={() => setIsAddMemberOpen(false)} className="btn-close"><X/></button>
                    </div>
                    <form onSubmit={handleAddMember}>
                        <div className="modal-body">
                            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                <div>
                                    <label>Họ và tên</label>
                                    <input required className="filter-input" style={{width: '100%'}} value={addMemberForm.fullName} onChange={e => setAddMemberForm({...addMemberForm, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
                                </div>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                    <div>
                                        <label>Email</label>
                                        <input required type="email" className="filter-input" style={{width: '100%'}} value={addMemberForm.email} onChange={e => setAddMemberForm({...addMemberForm, email: e.target.value})} placeholder="rescue@email.com" />
                                    </div>
                                    <div>
                                        <label>Số điện thoại</label>
                                        <input required className="filter-input" style={{width: '100%'}} value={addMemberForm.phone} onChange={e => setAddMemberForm({...addMemberForm, phone: e.target.value})} placeholder="09xxx" />
                                    </div>
                                </div>
                                <div>
                                    <label>Mật khẩu khởi tạo</label>
                                    <input required type="password" className="filter-input" style={{width: '100%'}} value={addMemberForm.password} onChange={e => setAddMemberForm({...addMemberForm, password: e.target.value})} placeholder="••••••" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px 24px', borderTop: '1px solid #f1f5f9'}}>
                            <button type="button" className="btn-admin btn-admin-outline" onClick={() => setIsAddMemberOpen(false)}>Hủy</button>
                            <button type="submit" className="btn-admin btn-admin-primary">Xác nhận thêm</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL: Member Detail */}
        {selectedMemberDetail && (
            <div className="storm-modal-overlay" onClick={() => setSelectedMemberDetail(null)}>
                <div className="storm-modal" style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{background: '#f5f3ff', padding: '10px', borderRadius: '10px'}}><UserCheck size={22} color="#7c3aed"/></div>
                            <h3 style={{margin: 0}}>Chi tiết thành viên #{selectedMemberDetail.userId}</h3>
                        </div>
                        <button onClick={() => setSelectedMemberDetail(null)} className="btn-close"><X/></button>
                    </div>
                    <div className="modal-body">
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                            <div>
                                <label style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Họ tên</label>
                                <p style={{margin: '4px 0 16px 0', fontWeight: '600', fontSize: '1.1rem'}}>{selectedMemberDetail.userInfo?.fullName || '...'}</p>
                                
                                <label style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Email</label>
                                <p style={{margin: '4px 0 16px 0', color: '#475569'}}>{selectedMemberDetail.userInfo?.email || '...'}</p>

                                <label style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Số điện thoại</label>
                                <p style={{margin: '4px 0 16px 0', color: '#475569'}}>{selectedMemberDetail.userInfo?.phone || '...'}</p>
                            </div>
                            <div>
                                <label style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Trạng thái</label>
                                <p style={{margin: '4px 0 16px 0'}}><span className="admin-badge badge-active">{selectedMemberDetail.status}</span></p>

                                <label style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Vai trò</label>
                                <p style={{margin: '4px 0 16px 0', fontWeight: '700', color: '#2563eb'}}>{selectedMemberDetail.memberRole}</p>

                                <label style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase'}}>Tải hiện tại</label>
                                <p style={{margin: '4px 0 16px 0', fontWeight: '700'}}>{selectedMemberDetail.currentLoad} yêu cầu</p>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer" style={{padding: '20px 24px', borderTop: '1px solid #f1f5f9', textAlign: 'right'}}>
                        <button className="btn-admin btn-admin-primary" onClick={() => setSelectedMemberDetail(null)}>Đóng</button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL: Assign Request */}
        {selectedRequestToAssign && (
            <div className="storm-modal-overlay" onClick={() => setSelectedRequestToAssign(null)}>
                <div className="storm-modal" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{background: '#fef3c7', padding: '10px', borderRadius: '10px'}}><Activity size={22} color="#d97706"/></div>
                            <h3 style={{margin: 0}}>Phân công yêu cầu #{selectedRequestToAssign.id}</h3>
                        </div>
                        <button onClick={() => setSelectedRequestToAssign(null)} className="btn-close"><X/></button>
                    </div>
                    <div className="modal-body">
                        <p style={{color: '#64748b', marginBottom: '20px'}}>Chọn một thành viên trong đội để phụ trách yêu cầu này:</p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto'}}>
                            {members.map(m => (
                                <div 
                                    key={m.userId} 
                                    onClick={() => handleAssign(m.userId)}
                                    style={{
                                        padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: m.status === 'AVAILABLE' ? 'white' : '#f8fafc',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                >
                                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                        <div style={{background: '#f1f5f9', padding: '8px', borderRadius: '8px'}}><User size={18} color="#64748b"/></div>
                                        <div>
                                            <p style={{margin: 0, fontWeight: '700', color: '#1e293b'}}>User #{m.userId}</p>
                                            <span style={{fontSize: '0.75rem', color: m.status === 'AVAILABLE' ? '#10b981' : '#f59e0b'}}>{m.status}</span>
                                        </div>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p style={{margin: 0, fontSize: '0.7rem', color: '#94a3b8'}}>Tải: {m.currentLoad}</p>
                                        <Plus size={16} color="#3b82f6"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </MainLayout>
  );
};

export default LeaderTeamPage;
