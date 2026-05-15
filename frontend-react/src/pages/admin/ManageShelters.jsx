import React, {useEffect, useState} from 'react';
import { getSheltersApi } from '../../api/shelterApi';
import { House, Search, MapPin, Users, RefreshCw, Plus } from 'lucide-react';

const ManageShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSheltersApi();
      setShelters(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load() }, []);

  const filteredShelters = shelters.filter(s => 
    (s.name + s.address).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <div className="admin-header">
          <div className="admin-header-info">
              <h1>Quản lý điểm trú ẩn an toàn</h1>
              <p>Danh sách các địa điểm tiếp nhận người dân tránh trú thiên tai trên toàn quốc</p>
          </div>
          <button className="btn-admin btn-admin-primary" style={{display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, cursor: 'not-allowed'}} disabled title="Chức năng đang phát triển">
              <Plus size={18} /> Thêm điểm trú ẩn
          </button>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{flex: 1, position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
          <input 
            type="text" 
            className="filter-input"
            style={{paddingLeft: '40px', width: '100%'}}
            placeholder="Tìm theo tên điểm trú ẩn, địa chỉ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-admin btn-admin-outline" onClick={load}><RefreshCw size={16}/></button>
      </div>

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <div className="admin-grid">
            {filteredShelters.length > 0 ? filteredShelters.map(s => (
                <div key={s.id} className="admin-card">
                    <div className="card-title">
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <House size={18} color="#10b981"/>
                            <span>{s.name}</span>
                        </div>
                        <span className="admin-badge badge-resolved">HOẠT ĐỘNG</span>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', marginBottom: '12px'}}>
                        <MapPin size={14} color="#64748b"/>
                        <span>{s.address}</span>
                    </div>

                    <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Users size={16} color="#64748b"/>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <span style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase'}}>Sức chứa</span>
                                <span style={{fontSize: '1rem', fontWeight: '700'}}>{s.capacity} người</span>
                            </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7}}>
                             <div style={{textAlign: 'right'}}>
                                <span style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase'}}>Hiện có</span>
                                <span style={{fontSize: '1rem', fontWeight: '700'}}>{s.occupancy || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8'}}>
                        <span>Tọa độ: {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}</span>
                        <button className="btn-admin-outline" style={{fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0'}}>Sửa</button>
                    </div>
                </div>
            )) : <p className="col-span-full text-center py-12 text-gray-500">Không tìm thấy điểm trú ẩn nào.</p>}
        </div>
      )}
    </div>
  );
};

export default ManageShelters;
