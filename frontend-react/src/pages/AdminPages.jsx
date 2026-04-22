import React, {useEffect, useState} from 'react';
import { getAllSupportsApi, updateSupportStatusApi } from '../api/apiServices';


export const AdminSupportManagement = () => {
  const [reqs, setReqs] = useState([]);
  const load = () => getAllSupportsApi().then(res => setReqs(res.data));
  useEffect(() => { load() }, []);

  const update = async(id, status) => {
    await updateSupportStatusApi(id, status);
    load();
  }

  return (
    <div className="container">
      <h2>Quản lý yêu cầu cứu hộ</h2>
      {reqs.map(r => (
        <div key={r.id} className="card" style={{marginTop:'20px'}}>
          <div className="card-header"><span>{r.requestType} - {r.numberOfNgười} Người</span><span className={`badge ${r.status}`}>{r.status}</span></div>
          <p>{r.description}</p>
          {r.status === 'PENDING' && <button className="btn" onClick={()=>update(r.id, 'ASSIGNED')}>Phân công đội</button>}
          {r.status === 'ASSIGNED' && <button className="btn" onClick={()=>update(r.id, 'IN_PROGRESS')}>Đang xử lý</button>}
          {r.status === 'IN_PROGRESS' && <button className="btn" onClick={()=>update(r.id, 'RESOLVED')}>Đã giải quyết</button>}
        </div>
      ))}
    </div>
  );
};
