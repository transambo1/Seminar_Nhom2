import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Search, 
  Filter, 
  AlertTriangle,
  Info,
  MapPin,
  Clock,
  X,
  Map as MapIcon,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActiveAlertsApi } from '../../api/alertApi';
import '../../styles/WeatherMonitoring.css';

export default function WeatherMonitoring() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getActiveAlertsApi();
      const weatherAlerts = (res.data || []).filter(a => a.source === 'WEATHER');
      setAlerts(weatherAlerts);
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = (a.title + a.provinceName + a.description).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || a.alertType === typeFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severityLevel === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'ACTIVE').length,
    critical: alerts.filter(a => a.severityLevel === 'CRITICAL').length,
    provinces: new Set(alerts.map(a => a.provinceCode)).size
  };

  const handleViewOnMap = (alert) => {
    navigate('/dashboard', { 
      state: { 
        targetRequest: alert, 
        targetType: 'ALERT' 
      } 
    });
  };

  return (
    <div className="admin-page-container">
      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#fff7ed', color: '#ea580c'}}><CloudRain size={24} /></div>
          <div className="stat-val"><h3>{stats.total}</h3><p>Tổng cảnh báo</p></div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#f0fdf4', color: '#16a34a'}}><Info size={24} /></div>
          <div className="stat-val"><h3>{stats.active}</h3><p>Đang hoạt động</p></div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#fef2f2', color: '#dc2626'}}><AlertTriangle size={24} /></div>
          <div className="stat-val"><h3>{stats.critical}</h3><p>Mức nguy hiểm</p></div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrap" style={{background: '#f5f3ff', color: '#7c3aed'}}><MapPin size={24} /></div>
          <div className="stat-val"><h3>{stats.provinces}</h3><p>Tỉnh bị ảnh hưởng</p></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box" style={{flex: 1, position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
          <input 
            type="text" 
            className="filter-input"
            style={{paddingLeft: '40px', width: '100%'}}
            placeholder="Tìm theo tỉnh, tiêu đề..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <Filter size={16} color="#64748b" />
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">Tất cả loại</option>
            <option value="STORM">Bão</option>
            <option value="FLOOD">Lũ lụt</option>
          </select>
        </div>
        <div className="filter-item">
          <select className="filter-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="ALL">Tất cả mức độ</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
        <button className="btn-admin btn-admin-outline" onClick={fetchData}><RefreshCw size={16}/></button>
        
        {user.role === 'ADMIN' && (
          <button 
            className="btn-admin btn-admin-primary" 
            onClick={async () => {
              if(window.confirm('Kích hoạt quét thời tiết toàn quốc ngay bây giờ (Demo Mode)?')) {
                  try {
                      const res = await fetch('http://localhost:8081/api/v1/weather/test/scan/full', { method: 'POST' });
                      if (res.ok) {
                          alert('Đã kích hoạt quét thời tiết. Hệ thống đang thu thập dữ liệu...');
                          setTimeout(fetchData, 2000);
                      }
                  } catch (e) {
                      alert('Lỗi khi kích hoạt quét. Vui lòng kiểm tra backend service.');
                  }
              }
            }}
          >
            Kích hoạt quét Demo
          </button>
        )}
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="text-center py-12">Đang tải dữ liệu thời tiết...</div>
      ) : (
        <div className="admin-grid">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <div key={alert.id} className="admin-card">
                <div className="card-title">
                   <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <CloudRain size={18} color="#ea580c"/>
                      <span style={{fontSize: '1rem'}}>{alert.title}</span>
                  </div>
                  <span className={`admin-badge badge-${alert.status?.toLowerCase()}`}>{alert.status}</span>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', marginBottom: '12px'}}>
                    <MapPin size={14} color="#64748b"/>
                    <strong>{alert.provinceName}</strong>
                </div>

                <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', lineHeight: '1.5', minHeight: '4.5em'}}>
                    {alert.description.substring(0, 150)}...
                </p>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <span className={`admin-badge badge-${alert.severityLevel?.toLowerCase()}`}>{alert.severityLevel}</span>
                    <div style={{fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <Clock size={12}/> {new Date(alert.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                </div>

                <div style={{display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px'}}>
                    <button className="btn-admin btn-admin-outline" style={{flex: 1}} onClick={() => setSelectedAlert(alert)}>Chi tiết</button>
                    <button className="btn-admin btn-admin-primary" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}} onClick={() => handleViewOnMap(alert)}>
                        <MapIcon size={14} /> Bản đồ
                    </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                Không tìm thấy dữ liệu thời tiết phù hợp.
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAlert && (
        <div className="storm-modal-overlay" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="storm-modal" style={{background: 'white', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h3 style={{fontSize: '1.25rem', fontWeight: '700'}}>Chi tiết cảnh báo hệ thống</h3>
              <button onClick={() => setSelectedAlert(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px'}}>
                <span style={{fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '600'}}>Nội dung cảnh báo</span>
                <p style={{marginTop: '8px', lineHeight: '1.6', color: '#1e293b'}}>{selectedAlert.description}</p>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                  <div className="detail-item">
                      <label style={{display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px'}}>Địa điểm</label>
                      <span style={{fontWeight: '600'}}>{selectedAlert.provinceName}</span>
                  </div>
                  <div className="detail-item">
                      <label style={{display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px'}}>Mức độ</label>
                      <span className={`admin-badge badge-${selectedAlert.severityLevel?.toLowerCase()}`}>{selectedAlert.severityLevel}</span>
                  </div>
                  <div className="detail-item">
                      <label style={{display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px'}}>Thời điểm ghi nhận</label>
                      <span style={{fontSize: '0.9rem'}}>{new Date(selectedAlert.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-item">
                      <label style={{display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px'}}>Tọa độ tâm điểm</label>
                      <span style={{fontSize: '0.9rem'}}>{selectedAlert.latitude}, {selectedAlert.longitude}</span>
                  </div>
              </div>
            </div>
            <div style={{marginTop: '30px', display: 'flex', gap: '12px'}}>
              <button className="btn-admin btn-admin-outline" style={{flex: 1}} onClick={() => setSelectedAlert(null)}>Đóng</button>
              <button className="btn-admin btn-admin-primary" style={{flex: 1}} onClick={() => handleViewOnMap(selectedAlert)}>Xem trên bản đồ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
