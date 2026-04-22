import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSupportFilterApi,
  updateSupportStatusApi
} from '../api/apiServices';
import SupportCard from '../components/SupportCard';
import SupportDetailModal from '../components/SupportDetailModal';

const MySupports = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [requestTypeFilter, setRequestTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [userLoc, setUserLoc] = useState({ lat: null, lng: null });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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

  useEffect(() => {
    if (
      sortBy === 'DISTANCE' &&
      (userLoc.lat == null || userLoc.lng == null)
    ) {
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    statusFilter,
    requestTypeFilter,
    priorityFilter,
    sortBy,
    userLoc.lat,
    userLoc.lng
  ]);

  const buildFilterParams = () => {
    const params = {
      scope: activeTab
    };

    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (requestTypeFilter !== 'ALL') params.requestType = requestTypeFilter;
    if (priorityFilter !== 'ALL') params.priorityLevel = priorityFilter;

    if (sortBy === 'NEWEST') {
      params.sortBy = 'CREATED_AT';
      params.direction = 'DESC';
    } else if (sortBy === 'OLDEST') {
      params.sortBy = 'CREATED_AT';
      params.direction = 'ASC';
    } else if (sortBy === 'DISTANCE') {
      params.sortBy = 'DISTANCE';
      params.direction = 'ASC';

      if (userLoc.lat != null && userLoc.lng != null) {
        params.userLat = userLoc.lat;
        params.userLng = userLoc.lng;
      }
    }

    return params;
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const params = buildFilterParams();
      console.log('Final Query Params:', params);

      const res = await getSupportFilterApi(params);
      setRequests(res.data || []);
    } catch (err) {
      console.error('Fetch support requests failed:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateSupportStatusApi(id, newStatus);
      await fetchData();
      setSelectedReq(null);
    } catch (err) {
      console.error('Update status failed:', err);
      alert('Cập nhật trạng thái thất bại');
    }
  };

  const handleOpenMap = (req) => {
    navigate('/', {
      state: {
        routeToDest: {
          lat: req.latitude,
          lng: req.longitude
        }
      }
    });
  };

  const isMine = (userId) =>
    userId === currentUser?.id || userId === currentUser?.userId;

  return (
    <div
      className="container"
      style={{ paddingTop: '32px', paddingBottom: '40px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px'
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0F172A'
          }}
        >
          Danh sách yêu cầu
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '28px',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => setActiveTab('ALL')}
          className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
        >
          Tất cả
        </button>

        <button
          onClick={() => setActiveTab('MINE')}
          className={`btn ${activeTab === 'MINE' ? 'btn-primary' : 'btn-outline'}`}
        >
          Của tôi
        </button>

        <button
          onClick={() => setActiveTab('OTHERS')}
          className={`btn ${activeTab === 'OTHERS' ? 'btn-primary' : 'btn-outline'}`}
        >
          Người khác
        </button>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginLeft: 'auto',
            flexWrap: 'wrap'
          }}
        >
          <select
            value={requestTypeFilter}
            onChange={(e) => setRequestTypeFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              outline: 'none'
            }}
          >
            <option value="ALL">Loại: Tất cả</option>
            <option value="RESCUE">Cứu hộ</option>
            <option value="MEDICAL">Y tế</option>
            <option value="FOOD">Lương thực</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              outline: 'none'
            }}
          >
            <option value="ALL">Mức độ: Tất cả</option>
            <option value="CRITICAL">Nghiêm trọng</option>
            <option value="HIGH">Cao</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Thấp</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              outline: 'none'
            }}
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="ASSIGNED">Đã phân công</option>
            <option value="IN_PROGRESS">Đang hỗ trợ</option>
            <option value="RESOLVED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              outline: 'none',
              background: '#F8FAFC'
            }}
          >
            <option value="NEWEST">Sắp xếp: Mới nhất</option>
            <option value="OLDEST">Sắp xếp: Cũ hơn</option>
            <option value="DISTANCE">Sắp xếp: Gần tôi nhất</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : requests.length === 0 ? (
        <p>Không có yêu cầu phù hợp.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}
        >
          {requests.map((r) => (
            <SupportCard
              key={r.id}
              req={r}
              isMine={isMine(r.userId)}
              onClick={(reqData) =>
                setSelectedReq({
                  ...reqData,
                  isMine: isMine(r.userId)
                })
              }
            />
          ))}
        </div>
      )}

      {selectedReq && (
        <SupportDetailModal
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
          onUpdateStatus={handleUpdateStatus}
          onOpenMap={handleOpenMap}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default MySupports;