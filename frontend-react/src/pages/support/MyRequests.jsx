import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Activity, Clock, CheckCircle2, ListFilter } from 'lucide-react';
import {
  getSupportFilterApi,
  updateSupportStatusApi
} from '../../api/supportApi';
import SupportCard from '../../components/common/SupportCard';
import SupportDetailModal from '../../components/common/SupportDetailModal';
import MainLayout from '../../components/layout/MainLayout';

const MySupports = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [requestTypeFilter, setRequestTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [searchTerm, setSearchTerm] = useState('');

  const [requests, setRequests] = useState([]);
  const [sourceRequests, setSourceRequests] = useState([]); // Stable source for summary counts
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [userLoc, setUserLoc] = useState({ lat: null, lng: null });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Business Mapping for Summary Cards
  const stats = useMemo(() => {
    const compute = (data) => ({
      total: data.length,
      pending: data.filter(r => r.status === 'PENDING').length,
      inProgress: data.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length,
      resolved: data.filter(r => r.status === 'RESOLVED').length
    });
    return compute(sourceRequests);
  }, [sourceRequests]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }),
        () => setUserLoc({ lat: 16.07, lng: 108.22 })
      );
    } else {
      setUserLoc({ lat: 16.07, lng: 108.22 });
    }
  }, []);

  // Fetch full scope data for statistics whenever tab changes
  useEffect(() => {
    fetchSourceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchSourceData = async () => {
    try {
      const res = await getSupportFilterApi({ scope: activeTab });
      setSourceRequests(res.data || []);
    } catch (err) {
      console.error('Fetch source stats failed:', err);
    }
  };

  // Fetch filtered list for rendering
  useEffect(() => {
    if (sortBy === 'DISTANCE' && (userLoc.lat == null || userLoc.lng == null)) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter, requestTypeFilter, priorityFilter, sortBy, userLoc.lat, userLoc.lng]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { scope: activeTab };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (requestTypeFilter !== 'ALL') params.requestType = requestTypeFilter;
      if (priorityFilter !== 'ALL') params.priorityLevel = priorityFilter;

      if (sortBy === 'NEWEST') { params.sortBy = 'CREATED_AT'; params.direction = 'DESC'; }
      else if (sortBy === 'OLDEST') { params.sortBy = 'CREATED_AT'; params.direction = 'ASC'; }
      else if (sortBy === 'DISTANCE') {
        params.sortBy = 'DISTANCE'; params.direction = 'ASC';
        if (userLoc.lat != null) { params.userLat = userLoc.lat; params.userLng = userLoc.lng; }
      }

      const res = await getSupportFilterApi(params);
      setRequests(res.data || []);
    } catch (err) {
      console.error('Fetch failed:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return requests;
    
    return requests.filter(r => {
      const matchTitle = r.title?.toLowerCase().includes(term);
      const matchDesc = r.description?.toLowerCase().includes(term);
      const matchType = r.requestType?.toLowerCase().includes(term);
      const matchAddress = r.address?.toLowerCase().includes(term);
      
      return matchTitle || matchDesc || matchType || matchAddress;
    });
  }, [requests, searchTerm]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateSupportStatusApi(id, newStatus);
      // Refresh both filtered list and source stats
      await Promise.all([fetchData(), fetchSourceData()]);
      setSelectedReq(null);
    } catch (err) {
      alert('Cập nhật thất bại');
    }
  };

  const isFilterActive = useMemo(() => {
    return searchTerm.trim() !== '' || 
           activeTab !== 'ALL' || 
           statusFilter !== 'ALL' || 
           requestTypeFilter !== 'ALL' || 
           priorityFilter !== 'ALL' || 
           sortBy !== 'NEWEST';
  }, [searchTerm, activeTab, statusFilter, requestTypeFilter, priorityFilter, sortBy]);

  const handleReset = () => {
    setSearchTerm('');
    setActiveTab('ALL');
    setStatusFilter('ALL');
    setRequestTypeFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('NEWEST');
  };

  const isMine = (userId) => userId === currentUser?.id || userId === currentUser?.userId;

  return (
    <MainLayout 
      title="Danh sách yêu cầu" 
      subtitle="Theo dõi và quản lý các yêu cầu cứu trợ từ người dân"
    >
      <div className="support-list-container">
        {/* Summary Row */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#2563EB' }}><Activity size={24} /></div>
            <div className="summary-info"><h4>Tổng yêu cầu</h4><p className="value">{stats.total}</p></div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#EA580C' }}><Clock size={24} /></div>
            <div className="summary-info"><h4>Chờ xử lý</h4><p className="value">{stats.pending}</p></div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#0284C7' }}><RotateCcw size={24} /></div>
            <div className="summary-info"><h4>Đang hỗ trợ</h4><p className="value">{stats.inProgress}</p></div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#16A34A' }}><CheckCircle2 size={24} /></div>
            <div className="summary-info"><h4>Hoàn thành</h4><p className="value">{stats.resolved}</p></div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="tabs-row">
            <button onClick={() => setActiveTab('ALL')} className={`pill-tab ${activeTab === 'ALL' ? 'active' : ''}`}>Tất cả</button>
            <button onClick={() => setActiveTab('MINE')} className={`pill-tab ${activeTab === 'MINE' ? 'active' : ''}`}>Của tôi</button>
            <button onClick={() => setActiveTab('OTHERS')} className={`pill-tab ${activeTab === 'OTHERS' ? 'active' : ''}`}>Người khác</button>
          </div>

          <div className="controls-row">
            <div className="search-box-modern">
              <Search size={18} />
              <input 
                placeholder="Tìm theo tiêu đề, nội dung yêu cầu..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="modern-select" value={requestTypeFilter} onChange={e => setRequestTypeFilter(e.target.value)}>
                <option value="ALL">Tất cả loại</option>
                <option value="RESCUE">Cứu hộ</option>
                <option value="MEDICAL">Y tế</option>
                <option value="FOOD">Lương thực</option>
                <option value="EVACUATION">Sơ tán</option>
              </select>

              <select className="modern-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="ALL">Mọi ưu tiên</option>
                <option value="CRITICAL">Khẩn cấp</option>
                <option value="HIGH">Ưu tiên cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>

              <select className="modern-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">Mọi trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="ASSIGNED">Đã phân công</option>
                <option value="IN_PROGRESS">Đang hỗ trợ</option>
                <option value="RESOLVED">Hoàn thành</option>
              </select>

              <select className="modern-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="NEWEST">Mới nhất</option>
                <option value="OLDEST">Cũ nhất</option>
                <option value="DISTANCE">Gần tôi nhất</option>
              </select>

              <button 
                onClick={handleReset} 
                className={`btn ${isFilterActive ? 'btn-outline' : 'btn-disabled'}`}
                disabled={!isFilterActive}
                style={{ 
                  height: '48px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '0 20px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  cursor: isFilterActive ? 'pointer' : 'not-allowed',
                  opacity: isFilterActive ? 1 : 0.5
                }}
              >
                <RotateCcw size={18} />
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* List Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><p>Đang tải dữ liệu...</p></div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
            <ListFilter size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b' }}>Không tìm thấy yêu cầu nào</h3>
            <p style={{ color: '#94a3b8' }}>Vui lòng thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((r) => (
              <SupportCard
                key={r.id}
                req={r}
                isMine={isMine(r.userId)}
                onClick={(reqData) => setSelectedReq({ ...reqData, isMine: isMine(r.userId) })}
              />
            ))}
          </div>
        )}
      </div>

      {selectedReq && (
        <SupportDetailModal
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
          onUpdateStatus={handleUpdateStatus}
          onOpenMap={(req) => navigate('/dashboard', { state: { targetRequest: req } })}
          currentUser={currentUser}
        />
      )}
    </MainLayout>
  );
};

export default MySupports;