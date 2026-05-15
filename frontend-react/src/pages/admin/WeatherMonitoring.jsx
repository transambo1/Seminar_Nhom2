import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Search, 
  Filter, 
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  Clock,
  X,
  Map as MapIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { getActiveAlertsApi } from '../../api/alertApi';
import '../../styles/WeatherMonitoring.css';

export default function WeatherMonitoring() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
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
      // Filter only weather source
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
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
    <div className="storm-page">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="storm-main">
        <Topbar 
          title="Theo dõi nguy cơ thiên tai tự động" 
          user={user} 
          onToggleSidebar={() => setCollapsed(!collapsed)} 
        />

        <div className="weather-content p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="stat-icon bg-orange-100 text-orange-600"><CloudRain size={24} /></div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Tổng cảnh báo</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-green-100 text-green-600"><Info size={24} /></div>
              <div className="stat-info">
                <h3>{stats.active}</h3>
                <p>Đang hoạt động</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-red-100 text-red-600"><AlertTriangle size={24} /></div>
              <div className="stat-info">
                <h3>{stats.critical}</h3>
                <p>Mức nguy hiểm (CRITICAL)</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-purple-100 text-purple-600"><MapPin size={24} /></div>
              <div className="stat-info">
                <h3>{stats.provinces}</h3>
                <p>Tỉnh/Thành bị ảnh hưởng</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-panel mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="search-box">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm theo tỉnh, tiêu đề..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <Filter size={16} />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="ALL">Tất cả loại</option>
                  <option value="STORM">Bão</option>
                  <option value="FLOOD">Lũ lụt</option>
                </select>
              </div>

              <div className="filter-group">
                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                  <option value="ALL">Tất cả mức độ</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="filter-group">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <button className="btn-text" onClick={handleResetFilters}>Đặt lại</button>
              <button className="btn-outline ml-auto" onClick={fetchData}>Làm mới</button>
              
              {user.role === 'ADMIN' && (
                <button 
                  className="btn-primary" 
                  onClick={async () => {
                    if(window.confirm('Kích hoạt quét thời tiết toàn quốc ngay bây giờ?')) {
                        try {
                            const res = await fetch('http://localhost:8081/api/v1/weather/test/scan/full', { method: 'POST' });
                            if (res.ok) {
                                alert('Đã kích hoạt quét thời tiết. Đang cập nhật dữ liệu...');
                                setTimeout(fetchData, 2000);
                            }
                        } catch (e) {
                            alert('Lỗi khi kích hoạt quét. Vui lòng kiểm tra backend.');
                        }
                    }
                  }}
                  title="Chạy quét thời tiết ngay lập tức (Demo Mode)"
                >
                  <CloudRain size={16} style={{marginRight: '8px'}} />
                  Kích hoạt quét Demo
                </button>
              )}
            </div>
          </div>

          {/* Alert List */}
          <div className="alert-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => (
                <div key={alert.id} className={`weather-alert-card ${alert.severityLevel}`}>
                  <div className="card-header">
                    <div className="source-tag">NGUY CƠ TỰ ĐỘNG</div>
                    <span className={`status-badge ${alert.status}`}>{alert.status}</span>
                  </div>
                  <h4 className="alert-title">{alert.title}</h4>
                  <div className="alert-location">
                    <MapPin size={14} />
                    <span>{alert.provinceName}</span>
                  </div>
                  <p className="alert-desc">{alert.description.substring(0, 100)}...</p>
                  <div className="alert-meta">
                    <div className="meta-item"><Clock size={14} /> <span>{new Date(alert.createdAt).toLocaleDateString('vi-VN')}</span></div>
                    <div className={`severity-tag ${alert.severityLevel}`}>{alert.severityLevel}</div>
                  </div>
                  <div className="card-actions">
                    <button className="btn-outline btn-sm" onClick={() => setSelectedAlert(alert)}>Chi tiết</button>
                    <button className="btn-primary btn-sm" onClick={() => handleViewOnMap(alert)}>
                      <MapIcon size={14} /> Bản đồ
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center py-12 text-gray-500">Không tìm thấy cảnh báo nào phù hợp.</p>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết cảnh báo hệ thống</h3>
              <button onClick={() => setSelectedAlert(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-info">
                  <div className="info-header mb-4">
                    <span className="source-label">Nguồn: Hệ thống quét thời tiết</span>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedAlert.title}</h2>
                  </div>
                  
                  <div className="info-section mb-6">
                    <label>Nội dung cảnh báo</label>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{selectedAlert.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="info-item">
                      <label><MapPin size={14} /> Địa điểm</label>
                      <span>{selectedAlert.provinceName} ({selectedAlert.latitude}, {selectedAlert.longitude})</span>
                    </div>
                    <div className="info-item">
                      <label><AlertTriangle size={14} /> Mức độ</label>
                      <span className={`severity-text ${selectedAlert.severityLevel}`}>{selectedAlert.severityLevel}</span>
                    </div>
                    <div className="info-item">
                      <label><Calendar size={14} /> Thời điểm phát hiện</label>
                      <span>{new Date(selectedAlert.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="info-item">
                      <label><Clock size={14} /> Dự kiến hết hiệu lực</label>
                      <span>{new Date(selectedAlert.endTime).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setSelectedAlert(null)}>Đóng</button>
              <button className="btn-primary" onClick={() => handleViewOnMap(selectedAlert)}>Xem trên bản đồ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
