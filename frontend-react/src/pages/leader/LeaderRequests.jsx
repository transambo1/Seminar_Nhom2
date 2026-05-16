import React, { useEffect, useState } from 'react';
import { getTeamByLeaderIdApi, getRequestsByTeamIdApi } from '../../api/leaderApi';
import { 
  RefreshCw, AlertTriangle, Eye, X, 
  MapPin, Users, Clock, Info, CheckCircle2
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

const LeaderRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [team, setTeam] = useState(null);

  const getLeaderId = () => {
    const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user.userId;
      } catch (e) { console.error(e); }
    }
    return null;
  };

  const loadData = async () => {
    const leaderId = getLeaderId();
    if (!leaderId) {
        setError("Không xác định được người dùng hiện tại, vui lòng đăng nhập lại.");
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const teamRes = await getTeamByLeaderIdApi(leaderId);
      const teamData = teamRes.data;
      setTeam(teamData);

      if (teamData && teamData.id) {
        const reqRes = await getRequestsByTeamIdApi(teamData.id);
        setRequests(reqRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách yêu cầu. Có thể bạn chưa được gán làm đội trưởng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'URGENT': return { bg: '#FEF2F2', text: '#DC2626', label: 'KHẨN CẤP' };
      case 'HIGH': return { bg: '#FFF7ED', text: '#EA580C', label: 'CAO' };
      case 'MEDIUM': return { bg: '#EFF6FF', text: '#2563EB', label: 'TRUNG BÌNH' };
      default: return { bg: '#F9FAFB', text: '#64748B', label: 'THẤP' };
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'PENDING': '#94a3b8',
      'ASSIGNED': '#2563eb',
      'IN_PROGRESS': '#f59e0b',
      'RESOLVED': '#10b981',
      'CANCELLED': '#ef4444'
    };
    return (
      <span className="admin-badge" style={{background: colors[status] || '#94a3b8', color: 'white'}}>
        {status}
      </span>
    );
  };

  return (
    <MainLayout title="Yêu cầu cứu hộ của đội">
      <div className="admin-page-container">
        <div className="admin-header">
            <div className="admin-header-info">
                <h1>Nhiệm vụ của đội: {team?.name || '...'}</h1>
                <p>Danh sách các yêu cầu cứu hộ đã được hệ thống tự động gán cho đội của bạn.</p>
            </div>
            <button className="btn-admin btn-admin-outline" onClick={loadData}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
        </div>

        {loading ? (
            <div className="admin-table-wrapper" style={{padding: '60px', textAlign: 'center'}}>
                <RefreshCw size={32} className="animate-spin mx-auto text-blue-500 mb-4" />
                <p>Đang tải danh sách nhiệm vụ...</p>
            </div>
        ) : error ? (
            <div className="admin-table-wrapper" style={{padding: '60px', textAlign: 'center', color: '#ef4444'}}>
                <AlertTriangle size={32} className="mx-auto mb-4" />
                <p>{error}</p>
            </div>
        ) : (
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã yêu cầu</th>
                            <th>Loại & Mức độ</th>
                            <th>Số người</th>
                            <th>Trạng thái</th>
                            <th>Người xử lý</th>
                            <th>Phân công</th>
                            <th>Khoảng cách</th>
                            <th>Thời gian</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(req => {
                            const pStyle = getPriorityStyle(req.priorityLevel);
                            return (
                                <tr key={req.id}>
                                    <td><span style={{fontWeight: '700', color: '#64748b'}}>#{req.id}</span></td>
                                    <td>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                            <span style={{fontWeight: '700', fontSize: '0.9rem'}}>{req.requestType}</span>
                                            <span style={{
                                                fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                                                background: pStyle.bg, color: pStyle.text, fontWeight: '800', width: 'fit-content'
                                            }}>{pStyle.label}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600'}}>
                                            <Users size={14} color="#64748b"/> {req.numberOfPeople}
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td>
                                        {req.assignedRescueUserId ? (
                                            <div style={{fontSize: '0.85rem', fontWeight: '600', color: '#1e40af'}}>Rescue #{req.assignedRescueUserId}</div>
                                        ) : (
                                            <span style={{fontSize: '0.85rem', color: '#94a3b8'}}>Chưa có</span>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '0.7rem', color: '#475569', padding: '2px 6px', 
                                            background: '#f1f5f9', borderRadius: '4px', border: '1px solid #e2e8f0'
                                        }}>{req.assignmentStatus}</span>
                                    </td>
                                    <td>
                                        <span style={{fontSize: '0.85rem', fontWeight: '600', color: '#2563eb'}}>
                                            {req.distanceKm ? `${req.distanceKm.toFixed(2)} km` : '--'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b'}}>
                                            <Clock size={12}/> {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-admin btn-admin-outline" style={{padding: '4px 8px'}} onClick={() => setSelectedRequest(req)}>
                                            <Eye size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="9" style={{textAlign: 'center', padding: '60px', color: '#94a3b8'}}>Chưa có nhiệm vụ nào được gán cho đội của bạn.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
            <div className="storm-modal-overlay" onClick={() => setSelectedRequest(null)}>
                <div className="storm-modal" style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{background: '#eff6ff', padding: '10px', borderRadius: '10px'}}><Info size={22} color="#2563eb"/></div>
                            <div>
                                <h3 style={{margin: 0, fontSize: '1.2rem', color: '#1e293b'}}>Chi tiết yêu cầu #{selectedRequest.id}</h3>
                                <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>Tạo lúc: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedRequest(null)} style={{background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex'}}><X size={20}/></button>
                    </div>
                    <div className="modal-body">
                        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1'}}>
                                <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px'}}>Mô tả tình huống</label>
                                <p style={{margin: 0, lineHeight: '1.6', color: '#1e293b'}}>{selectedRequest.description}</p>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px'}}>Vị trí yêu cầu</label>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#475569'}}>
                                        <MapPin size={18} color="#ef4444"/>
                                        <span>{selectedRequest.latitude.toFixed(5)}, {selectedRequest.longitude.toFixed(5)}</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px'}}>Lý do phân công</label>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#475569'}}>
                                        <CheckCircle2 size={18} color="#10b981"/>
                                        <span style={{fontSize: '0.9rem'}}>{selectedRequest.assignmentReason || "Tự động phân công hệ thống"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px'}}>Cập nhật cuối</label>
                                    <span style={{fontSize: '0.9rem'}}>{new Date(selectedRequest.updatedAt).toLocaleString()}</span>
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px'}}>Assigned Rescuer</label>
                                    <span style={{fontSize: '0.9rem', fontWeight: '700'}}>{selectedRequest.assignedRescueUserId ? `User #${selectedRequest.assignedRescueUserId}` : "Chưa có"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderRadius: '0 0 16px 16px'}}>
                        <button className="btn-admin btn-admin-primary" onClick={() => setSelectedRequest(null)}>Đóng chi tiết</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LeaderRequests;
