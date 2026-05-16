import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Search, 
  AlertTriangle,
  Info,
  MapPin,
  Clock,
  X,
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
  const [statusFilter] = useState('ALL');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity) => {
    const configs = {
      'CRITICAL': { bg: '#fee2e2', text: '#991b1b', label: 'CỰC NGUY HIỂM' },
      'HIGH': { bg: '#ffedd5', text: '#9a3412', label: 'NGUY HIỂM' },
      'MEDIUM': { bg: '#fef9c3', text: '#854d0e', label: 'TRUNG BÌNH' },
      'LOW': { bg: '#f0fdf4', text: '#166534', label: 'THẤP' }
    };
    const config = configs[severity] || configs['LOW'];
    return (
      <span style={{
        background: config.bg,
        color: config.text,
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="weather-monitor">
      <div className="weather-header">
        <div className="header-title">
          <CloudRain size={28} color="#2563eb" />
          <div>
            <h1>Giám sát thời tiết thời gian thực</h1>
            <p>Dữ liệu cảnh báo tự động từ các trạm khí tượng thủy văn</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="weather-filters">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm cảnh báo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-item">
            <label>Loại hình</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">Tất cả</option>
              <option value="FLOOD">Lũ lụt</option>
              <option value="STORM">Bão</option>
              <option value="LANDSLIDE">Sạt lở</option>
              <option value="HEAVY_RAIN">Mưa lớn</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label>Mức độ</label>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="ALL">Tất cả</option>
              <option value="CRITICAL">Cực nguy hiểm</option>
              <option value="HIGH">Nguy hiểm</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="weather-loading">
          <RefreshCw size={40} className="spin" />
          <p>Đang quét dữ liệu thời tiết...</p>
        </div>
      ) : (
        <div className="alert-grid">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <div key={alert.id} className={`alert-card severity-${alert.severity.toLowerCase()}`}>
                <div className="card-header">
                  {getSeverityBadge(alert.severity)}
                  <span className="alert-time">
                    <Clock size={12} />
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <h3>{alert.title}</h3>
                <p className="alert-desc">{alert.message}</p>
                
                <div className="card-footer">
                  <div className="location">
                    <MapPin size={14} />
                    <span>Tọa độ: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                  </div>
                  <button className="detail-btn" onClick={() => setSelectedAlert(alert)}>
                    Chi tiết
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-alerts">
              <Info size={48} />
              <p>Không có cảnh báo thời tiết nào phù hợp</p>
            </div>
          )}
        </div>
      )}

      {selectedAlert && (
        <div className="weather-modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="weather-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <AlertTriangle size={24} color="#ea580c" />
                <h2>Thông tin chi tiết cảnh báo</h2>
              </div>
              <button className="close-btn" onClick={() => setSelectedAlert(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <label>Tiêu đề</label>
                <p className="detail-title">{selectedAlert.title}</p>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <label>Loại hình</label>
                  <p>{selectedAlert.type}</p>
                </div>
                <div className="detail-section">
                  <label>Mức độ</label>
                  <p>{selectedAlert.severity}</p>
                </div>
              </div>
              
              <div className="detail-section">
                <label>Nội dung chi tiết</label>
                <div className="detail-content">
                  {selectedAlert.message}
                </div>
              </div>
              
              <div className="detail-section">
                <label>Vị trí ảnh hưởng</label>
                <div className="location-box">
                  <MapPin size={18} color="#ef4444" />
                  <span>Vĩ độ: {selectedAlert.latitude}, Kinh độ: {selectedAlert.longitude}</span>
                  <button className="view-map-btn" onClick={() => {
                      // Logic to view on dashboard map
                      navigate('/dashboard', { state: { focusLat: selectedAlert.latitude, focusLng: selectedAlert.longitude, focusItem: { ...selectedAlert, type: 'ALERT' } } });
                  }}>
                    Xem trên bản đồ chính
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="close-action-btn" onClick={() => setSelectedAlert(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
