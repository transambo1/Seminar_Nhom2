import React, {useEffect, useState} from 'react';
import { getPendingReportsApi, approveReportApi, rejectReportApi, getAllSupportsApi, updateSupportStatusApi } from '../api/apiServices';

export const AdminReportReview = () => {
  const [reports, setReports] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const load = () => getPendingReportsApi().then(res => setReports(res.data));
  useEffect(() => { load() }, []);

  const action = async(id, isApprove) => {
    if(isApprove) await approveReportApi(id, user.id);
    else await rejectReportApi(id, user.id);
    load();
  }

  return (
    <div className="container">
      <h2>Duyệt báo cáo khu vực nguy hiểm</h2>
      {reports.map(r => (
        <div key={r.id} className="card" style={{marginTop:'20px'}}>
          <strong>{r.reportType}</strong><p>{r.description}</p>
          <div style={{marginTop:'10px'}}>
            <button className="btn" onClick={()=>action(r.id, true)} style={{marginRight:'10px'}}>Duyệt lên bản đồ</button>
            <button className="btn btn-outline" onClick={()=>action(r.id, false)}>Từ chối</button>
          </div>
        </div>
      ))}
    </div>
  );
};

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
