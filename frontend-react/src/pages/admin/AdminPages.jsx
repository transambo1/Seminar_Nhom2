import React, {useEffect, useState} from 'react';
import { getAllSupportsApi, updateSupportStatusApi } from '../../api/supportApi';
import { Shield, Users, MapPin, Clock, Filter, RefreshCw } from 'lucide-react';

export const AdminSupportManagement = () => {
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllSupportsApi();
      setReqs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load() }, []);

  const update = async(id, status) => {
    if(!window.confirm(`Xác nhận chuyển trạng thái yêu cầu sang ${status}?`)) return;
    try {
        await updateSupportStatusApi(id, status);
        load();
    } catch (err) {
        alert("Lỗi khi cập nhật trạng thái");
    }
  }

  const filteredReqs = reqs.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

  const stats = {
    total: reqs.length,
    pending: reqs.filter(r => r.status === 'PENDING').length,
    in_progress: reqs.filter(r => r.status === 'IN_PROGRESS').length
  };

  return (
    <div className="admin-page-container">
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
            <div className="stat-icon-wrap" style={{background: '#dcfce7', color: '#15803d'}}><Users size={24}/></div>
            <div className="stat-val"><h4>{stats.in_progress}</h4><p>Đang xử lý</p></div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-item">
            <Filter size={18} />
            <label>Trạng thái:</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">Tất cả</option>
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
            </select>
        </div>
        <button className="btn-admin btn-admin-outline" onClick={load} style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <div className="admin-grid">
            {filteredReqs.length > 0 ? filteredReqs.map(r => (
                <div key={r.id} className="admin-card">
                    <div className="card-title">
                        <span>{r.requestType || "Yêu cầu cứu hộ"}</span>
                        <span className={`admin-badge badge-${r.status?.toLowerCase()}`}>{r.status}</span>
                    </div>
                    <div style={{display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '0.85rem', color: '#64748b'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Users size={14}/> {r.numberOfPeople} người</div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Clock size={14}/> {new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <p style={{fontSize: '0.9rem', color: '#475569', marginBottom: '16px', lineHeight: '1.5'}}>{r.description}</p>
                    
                    {r.locationName && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', marginBottom: '20px'}}>
                            <MapPin size={14}/> {r.locationName}
                        </div>
                    )}

                    <div style={{display: 'flex', gap: '10px'}}>
                        {r.status === 'PENDING' && <button className="btn-admin btn-admin-primary" style={{flex: 1}} onClick={()=>update(r.id, 'ASSIGNED')}>Phân công đội</button>}
                        {r.status === 'ASSIGNED' && <button className="btn-admin btn-admin-primary" style={{flex: 1}} onClick={()=>update(r.id, 'IN_PROGRESS')}>Bắt đầu xử lý</button>}
                        {r.status === 'IN_PROGRESS' && <button className="btn-admin btn-admin-success" style={{flex: 1, background: '#10b981', color: 'white'}} onClick={()=>update(r.id, 'RESOLVED')}>Đã giải quyết</button>}
                    </div>
                </div>
            )) : <p className="col-span-full text-center py-12 text-gray-500">Không có yêu cầu nào phù hợp.</p>}
        </div>
      )}
    </div>
  );
};
