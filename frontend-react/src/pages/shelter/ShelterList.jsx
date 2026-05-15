import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, ListFilter } from 'lucide-react';
import { getSheltersApi } from '../../api/shelterApi';
import MainLayout from '../../components/layout/MainLayout';
import ShelterDetailModal from '../../components/common/ShelterDetailModal';
import ShelterCard from '../../components/common/ShelterCard';

export default function ShelterList() {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME_ASC');

  useEffect(() => {
    getSheltersApi()
      .then(res => setShelters(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredShelters = useMemo(() => {
    let result = [...shelters];

    // Search
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(s => 
        s.name?.toLowerCase().includes(term) || 
        s.address?.toLowerCase().includes(term) ||
        s.contactPhone?.toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'CAPACITY_DESC') return (b.capacity || 0) - (a.capacity || 0);
      if (sortBy === 'CAPACITY_ASC') return (a.capacity || 0) - (b.capacity || 0);
      return 0;
    });

    return result;
  }, [shelters, searchTerm, statusFilter, sortBy]);

  const isFilterActive = useMemo(() => {
    return searchTerm.trim() !== '' || statusFilter !== 'ALL' || sortBy !== 'NAME_ASC';
  }, [searchTerm, statusFilter, sortBy]);

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortBy('NAME_ASC');
  };

  return (
    <MainLayout 
      title="Danh sách nơi trú ẩn" 
      subtitle="Tìm kiếm nơi trú ẩn an toàn gần bạn nhất"
    >
      <div className="support-list-container">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="controls-row">
            <div className="search-box-modern">
              <Search size={18} />
              <input 
                placeholder="Tìm tên, địa chỉ, số điện thoại..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="modern-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">Mọi trạng thái</option>
                <option value="AVAILABLE">SẴN SÀNG</option>
                <option value="FULL">HẾT CHỖ</option>
                <option value="CLOSED">ĐÓNG CỬA</option>
              </select>

              <select className="modern-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="NAME_ASC">Tên (A-Z)</option>
                <option value="CAPACITY_DESC">Sức chứa (Cao-Thấp)</option>
                <option value="CAPACITY_ASC">Sức chứa (Thấp-Cao)</option>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><p>Đang tải dữ liệu...</p></div>
        ) : filteredShelters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <ListFilter size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b' }}>Không tìm thấy nơi trú ẩn nào</h3>
            <p style={{ color: '#94a3b8' }}>Vui lòng thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredShelters.map(s => (
              <ShelterCard 
                key={s.id} 
                shelter={s} 
                onClick={setSelectedShelter} 
              />
            ))}
          </div>
        )}
        )}
      </div>

      {selectedShelter && (
        <ShelterDetailModal 
          shelter={selectedShelter} 
          onClose={() => setSelectedShelter(null)}
          onOpenMap={(s) => navigate('/dashboard', { state: { targetRequest: s, targetType: 'SHELTER' } })}
        />
      )}
    </MainLayout>
  );
}

