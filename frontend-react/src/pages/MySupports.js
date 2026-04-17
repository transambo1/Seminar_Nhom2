import React, {useEffect, useState} from 'react';
import { getMySupportsApi } from '../api/apiServices';

const MySupports = () => {
  const [reqs, setReqs] = useState([]);
  useEffect(() => { getMySupportsApi().then(res => setReqs(res.data)).catch(console.error) }, []);

  return (
    <div className="container">
      <h2>Danh sách yêu cầu của tôi</h2>
      {reqs.map(r => (
        <div key={r.id} className="card" style={{marginTop:'20px'}}>
          <div className="card-header"><span>{r.requestType} - {r.numberOfNgười} Người</span><span className={`badge ${r.status}`}>{r.status}</span></div>
          <p>{r.description}</p>
        </div>
      ))}
    </div>
  );
};
export default MySupports;
