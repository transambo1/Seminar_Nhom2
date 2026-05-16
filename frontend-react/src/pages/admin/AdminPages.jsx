import React, {useEffect, useState} from 'react';
import { getAllSupportsApi } from '../../api/supportApi';
import { 
  Shield, Users, MapPin, Clock, Filter, RefreshCw, 
  AlertCircle, CheckCircle, Info, X, Eye, Map as MapIcon, Calendar 
} from 'lucide-react';

export const AdminSupportManagement = () => {
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReq, setSelectedReq] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllSupportsApi();
      setReqs(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu yêu cầu cứu hộ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load() }, []);

  const filteredReqs = reqs.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

  const stats = {
    total: reqs.length,
    pending: reqs.filter(r => r.status === 'PENDING').length,
    assigned: reqs.filter(r => r.status === 'ASSIGNED').length,
    in_progress: reqs.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: reqs.filter(r => r.status === 'RESOLVED').length
  };

  const getPriorityBadge = (p) => {
    const level = p?.toUpperCase() || 'MEDIUM';
    return <span className={`admin-badge badge-${level.toLowerCase()}`}>{level}</span>;
  };

  const getStatusBadge = (s) => {
    return <span className={`admin-badge badge-${s?.toLowerCase()}`}>{s}</span>;
  };

  const getAssignmentBadge = (s) => {
    if (!s) return null;
    let text = s;
    if (s === 'AUTO_ASSIGNED') text = 'TỰ ĐỘNG';
    if (s === 'NO_AVAILABLE_TEAM') text = 'KHÔNG CÓ ĐỘI';
    if (s === 'TEAM_ASSIGNED_NO_MEMBER') text = 'ĐỘI CHỜ TV';
    if (s === 'UNASSIGNED') text = 'CHƯA GÁN';
    
    return <span style={{
        fontSize: '0.65rem', 
        padding: '2px 6px', 
        borderRadius: '4px',
        fontWeight: '700',
        background: s === 'AUTO_ASSIGNED' ? '#dcfce7' : s === 'NO_AVAILABLE_TEAM' ? '#fee2e2' : '#fef9c3',
        color: s === 'AUTO_ASSIGNED' ? '#15803d' : s === 'NO_AVAILABLE_TEAM' ? '#991b1b' : '#854d0e',
        border: '1px solid currentColor',
        whiteSpace: 'nowrap'
    }}>{text}</span>;
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
          <div className="admin-header-info">
              <h1>Giám sát yêu cầu cứu hộ</h1>
              <p>Theo dõi trạng thái tiếp nhận, mức độ ưu tiên và kết quả phân công tự động của các yêu cầu cứu hộ.</p>
          </div>
          <button className="btn-admin btn-admin-outline" onClick={load} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
            <div className="stat-icon-wrap" style={{background: '#e0e7ff', color: '#4338ca'}}><Shield size={24}/></div>
            <div className="stat-val"><h4>{stats.total}</h4><p>Tổng yêu cầu</p></div>
        </div>
        <div className="stat-item">
            <div className="stat-icon-wrap" style={{background: '#fef3c7', color: '#b45309'}}><Clock size={24}/></div>
            <div className="stat-val"><h4>{stats.pending}</h4><p>Đang chờ</p></div>
        </div>
        <div className="stat-item">
            <div className="stat-icon-wrap" style={{background: '#e0f2fe', color: '#0369a1'}}><Info size={24}/></div>
            <div className="stat-val"><h4>{stats.assigned}</h4><p>Đã gán</p></div>
        </div>
        <div className="stat-item">
            <div className="stat-icon-wrap" style={{background: '#fefce8', color: '#a16207'}}><Users size={24}/></div>
            <div className="stat-val"><h4>{stats.in_progress}</h4><p>Đang xử lý</p></div>
        </div>
        <div className="stat-item">
            <div className="stat-icon-wrap" style={{background: '#dcfce7', color: '#15803d'}}><CheckCircle size={24}/></div>
            <div className="stat-val"><h4>{stats.resolved}</h4><p>Hoàn tất</p></div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-item">
            <Filter size={18} />
            <label>Bộ lọc trạng thái:</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ (PENDING)</option>
                <option value="ASSIGNED">Đã gán đội (ASSIGNED)</option>
                <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                <option value="RESOLVED">Hoàn tất (RESOLVED)</option>
            </select>
        </div>
      </div>

      {loading && reqs.length === 0 ? (
          <div className="admin-table-wrapper" style={{padding: '60px', textAlign: 'center'}}>
              <RefreshCw size={32} className="animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-gray-500">Đang tải dữ liệu giám sát...</p>
          </div>
      ) : error ? (
          <div className="admin-table-wrapper" style={{padding: '60px', textAlign: 'center', color: '#ef4444'}}>
              <AlertCircle size={32} className="mx-auto mb-4" />
              <p>{error}</p>
          </div>
      ) : (
        <div className="admin-table-wrapper">
          <div style={{overflowX: 'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Số người</th>
                  <th>Ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>Phân công</th>
                  <th>Đội gán</th>
                  <th>Người xử lý</th>
                  <th>Cự ly</th>
                  <th>Thời gian</th>
                  <th style={{textAlign: 'center'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReqs.length > 0 ? filteredReqs.map(r => (
                  <tr key={r.id}>
                    <td><span style={{fontWeight: '600', color: '#64748b'}}>#{r.id}</span></td>
                    <td><span style={{fontSize: '0.85rem'}}>{r.requestType}</span></td>
                    <td><Users size={14} style={{verticalAlign: 'middle', marginRight: '4px', color: '#64748b'}}/> {r.numberOfPeople}</td>
                    <td>{getPriorityBadge(r.priorityLevel)}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>{getAssignmentBadge(r.assignmentStatus)}</td>
                    <td>{r.assignedTeamId ? <strong>Đội {r.assignedTeamId}</strong> : <span style={{color: '#cbd5e1'}}>--</span>}</td>
                    <td>{r.assignedRescueUserId ? <strong>TV {r.assignedRescueUserId}</strong> : <span style={{color: '#cbd5e1'}}>--</span>}</td>
                    <td>{r.distanceKm ? `${r.distanceKm.toFixed(1)}km` : <span style={{color: '#cbd5e1'}}>--</span>}</td>
                    <td><span style={{fontSize: '0.8rem', color: '#64748b'}}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span></td>
                    <td style={{textAlign: 'center'}}>
                      <button className="btn-admin btn-admin-outline" style={{padding: '4px 12px', fontSize: '0.8rem'}} onClick={() => setSelectedReq(r)}>
                        <Eye size={14} style={{marginRight: '6px'}}/> Chi tiết
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="11" style={{textAlign: 'center', padding: '60px', color: '#94a3b8'}}>Không tìm thấy yêu cầu nào phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selectedReq && (
        <div className="storm-modal-overlay" onClick={() => setSelectedReq(null)}>
          <div className="storm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{background: '#eff6ff', padding: '10px', borderRadius: '10px'}}><Shield size={22} color="#2563eb"/></div>
                    <div>
                        <h3 style={{margin: 0, fontSize: '1.2rem', color: '#1e293b'}}>Chi tiết yêu cầu #{selectedReq.id}</h3>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>Gửi bởi User ID: {selectedReq.userId}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedReq(null)} style={{background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex'}}><X size={20}/></button>
            </div>
            <div className="modal-body">
                <div className="modal-grid">
                    <div className="modal-item">
                        <label>Loại yêu cầu</label>
                        <span style={{fontWeight: '600'}}>{selectedReq.requestType}</span>
                    </div>
                    <div className="modal-item">
                        <label>Số lượng người</label>
                        <span style={{fontWeight: '600'}}>{selectedReq.numberOfPeople} người</span>
                    </div>
                    <div className="modal-item">
                        <label>Mức độ ưu tiên</label>
                        <div>{getPriorityBadge(selectedReq.priorityLevel)}</div>
                    </div>
                    <div className="modal-item">
                        <label>Trạng thái yêu cầu</label>
                        <div>{getStatusBadge(selectedReq.status)}</div>
                    </div>
                </div>

                <div className="modal-item" style={{marginTop: '24px'}}>
                    <label>Nội dung mô tả</label>
                    <p style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', marginTop: '6px', border: '1px solid #f1f5f9', lineHeight: '1.6', color: '#334155'}}>
                        {selectedReq.description}
                    </p>
                </div>

                <div className="modal-grid" style={{marginTop: '24px', background: '#f1f5f9', padding: '16px', borderRadius: '12px'}}>
                    <div className="modal-item">
                        <label style={{display: 'flex', alignItems: 'center', gap: '4px'}}><MapIcon size={14}/> Vị trí tọa độ</label>
                        <span style={{fontSize: '0.9rem', color: '#1e293b'}}>{selectedReq.latitude?.toFixed(6)}, {selectedReq.longitude?.toFixed(6)}</span>
                    </div>
                    <div className="modal-item">
                        <label style={{display: 'flex', alignItems: 'center', gap: '4px'}}><MapPin size={14}/> Địa danh ghi nhận</label>
                        <span style={{fontSize: '0.9rem', color: '#1e293b'}}>{selectedReq.locationName || 'Chưa có thông tin địa danh'}</span>
                    </div>
                </div>

                <div style={{marginTop: '32px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
                        <h4 style={{margin: 0, fontSize: '0.95rem', color: '#1e293b', letterSpacing: '0.05em'}}>DỮ LIỆU PHÂN CÔNG HỆ THỐNG</h4>
                        {getAssignmentBadge(selectedReq.assignmentStatus)}
                    </div>
                    
                    <div className="modal-grid" style={{gap: '24px'}}>
                        <div className="modal-item">
                            <label>Đội cứu hộ tiếp nhận</label>
                            <strong style={{fontSize: '1rem'}}>{selectedReq.assignedTeamId ? `Đội số ${selectedReq.assignedTeamId}` : 'Chưa có đội phù hợp'}</strong>
                        </div>
                        <div className="modal-item">
                            <label>Nhân viên xử lý</label>
                            <strong style={{fontSize: '1rem'}}>{selectedReq.assignedRescueUserId ? `User ID ${selectedReq.assignedRescueUserId}` : 'Chưa có thành viên khả dụng'}</strong>
                        </div>
                        <div className="modal-item">
                            <label>Cự ly di chuyển</label>
                            <span style={{fontSize: '1rem', color: '#2563eb', fontWeight: '600'}}>{selectedReq.distanceKm ? `${selectedReq.distanceKm.toFixed(2)} km` : '--'}</span>
                        </div>
                        <div className="modal-item">
                            <label>Lý do / Ghi chú phân công</label>
                            <span style={{fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic'}}>{selectedReq.assignmentReason || 'Chưa có thông tin phân công'}</span>
                        </div>
                    </div>
                </div>

                <div style={{marginTop: '32px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Calendar size={14}/> Ngày tạo: {new Date(selectedReq.createdAt).toLocaleString('vi-VN')}</div>
                    {selectedReq.updatedAt && <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><RefreshCw size={14}/> Cập nhật cuối: {new Date(selectedReq.updatedAt).toLocaleString('vi-VN')}</div>}
                </div>
            </div>
            <div style={{padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderRadius: '0 0 16px 16px'}}>
                <button className="btn-admin btn-admin-primary" style={{padding: '10px 24px'}} onClick={() => setSelectedReq(null)}>Đóng chi tiết</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
