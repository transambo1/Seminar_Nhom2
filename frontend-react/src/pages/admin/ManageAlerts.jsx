import React, {useEffect, useState} from 'react';
import { getActiveAlertsApi, createAlertApi } from '../../api/alertApi';
import { AlertTriangle, Plus, Search, Filter, RefreshCw, X, MapPin, Map as MapIcon, Info, Clock } from 'lucide-react';

const ManageAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [formData, setFormData] = useState({
    title: '',
    alertType: 'STORM',
    severityLevel: 'HIGH',
    description: '',
    latitude: '',
    longitude: '',
    provinceName: '',
    source: 'MANUAL'
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getActiveAlertsApi();
      setAlerts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAlertApi({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
      });
      alert("Đã tạo cảnh báo thành công!");
      setIsModalOpen(false);
      setFormData({
        title: '', alertType: 'STORM', severityLevel: 'HIGH',
        description: '', latitude: '', longitude: '', provinceName: '', source: 'MANUAL'
      });
      load();
    } catch (err) {
      alert("Lỗi khi tạo cảnh báo");
    }
  };

  const filteredAlerts = alerts.filter(a => {
      const matchesSearch = (a.title + a.provinceName + a.description).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || a.alertType === typeFilter;
      return matchesSearch && matchesType;
  });

  return (
    <div className="admin-page-container">
      <div className="admin-header">
          <div className="admin-header-info">
              <h1>Quản lý cảnh báo khẩn cấp</h1>
              <p>Quản lý các cảnh báo thiên tai tự động từ hệ thống và tạo cảnh báo thủ công</p>
          </div>
          <button className="btn-admin btn-admin-primary" style={{display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Tạo cảnh báo mới
          </button>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{flex: 1, position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
          <input 
            type="text" 
            className="filter-input"
            style={{paddingLeft: '40px', width: '100%'}}
            placeholder="Tìm theo tiêu đề, địa điểm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-item">
            <Filter size={18} />
            <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="ALL">Tất cả loại</option>
                <option value="STORM">Bão</option>
                <option value="FLOOD">Lũ lụt</option>
                <option value="LANDSLIDE">Sạt lở</option>
            </select>
        </div>
        <button className="btn-admin btn-admin-outline" onClick={load}><RefreshCw size={16}/></button>
      </div>

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <div className="admin-grid">
            {filteredAlerts.length > 0 ? filteredAlerts.map(a => (
                <div key={a.id} className="admin-card">
                    <div className="card-title">
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <AlertTriangle size={18} color={a.severityLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b'}/>
                            <span>{a.title}</span>
                        </div>
                        <span className={`admin-badge badge-${a.severityLevel?.toLowerCase()}`}>{a.severityLevel}</span>
                    </div>
                    <div style={{display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '0.8rem', color: '#64748b'}}>
                        <div className="flex items-center gap-1"><MapPin size={12}/> {a.provinceName}</div>
                        <div className="flex items-center gap-1"><Info size={12}/> {a.source === 'WEATHER' ? 'Hệ thống' : 'Quản trị viên'}</div>
                    </div>
                    <p style={{fontSize: '0.85rem', color: '#475569', marginBottom: '16px', lineHeight: '1.5', minHeight: '3em'}}>{a.description}</p>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.75rem', color: '#94a3b8'}}>
                        <div className="flex items-center gap-1"><Clock size={12}/> {new Date(a.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div className="flex items-center gap-1"><MapIcon size={12}/> {a.latitude?.toFixed(2)}, {a.longitude?.toFixed(2)}</div>
                    </div>
                </div>
            )) : <p className="col-span-full text-center py-12 text-gray-500">Không có cảnh báo nào phù hợp.</p>}
        </div>
      )}

      {/* Modal Tạo Cảnh Báo */}
      {isModalOpen && (
        <div className="storm-modal-overlay" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="storm-modal" style={{background: 'white', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%'}}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: '700'}}>Tạo cảnh báo khẩn cấp mới</h2>
              <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px'}}>Tiêu đề</label>
                <input required className="filter-input" style={{width: '100%'}} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ví dụ: Cảnh báo bão số 5" />
              </div>
              <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px'}}>Loại</label>
                  <select className="filter-select" style={{width: '100%'}} value={formData.alertType} onChange={e => setFormData({...formData, alertType: e.target.value})}>
                    <option value="STORM">Bão</option>
                    <option value="FLOOD">Lũ lụt</option>
                    <option value="LANDSLIDE">Sạt lở</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px'}}>Mức độ</label>
                  <select className="filter-select" style={{width: '100%'}} value={formData.severityLevel} onChange={e => setFormData({...formData, severityLevel: e.target.value})}>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px'}}>Tỉnh/Thành phố</label>
                <input required className="filter-input" style={{width: '100%'}} value={formData.provinceName} onChange={e => setFormData({...formData, provinceName: e.target.value})} placeholder="Ví dụ: Quảng Nam" />
              </div>
              <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px'}}>Vĩ độ (Lat)</label>
                  <input required type="number" step="any" className="filter-input" style={{width: '100%'}} value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="15.8" />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px'}}>Kinh độ (Lng)</label>
                  <input required type="number" step="any" className="filter-input" style={{width: '100%'}} value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="108.3" />
                </div>
              </div>
              <div style={{marginBottom: '24px'}}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px'}}>Nội dung chi tiết</label>
                <textarea required className="filter-input" style={{width: '100%', minHeight: '100px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Mô tả diễn biến và hướng dẫn an toàn..." />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button type="button" className="btn-admin btn-admin-outline" style={{flex: 1}} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-admin btn-admin-primary" style={{flex: 1}}>Tạo cảnh báo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAlerts;
