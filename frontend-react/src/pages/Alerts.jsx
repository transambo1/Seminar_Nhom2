import React, {useEffect, useState} from 'react';
import { getActiveAlertsApi } from '../api/apiServices';
import { AlertCard } from '../components/Cards';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { getActiveAlertsApi().then(res => setAlerts(res.data)) }, []);
  
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Danh sách cảnh báo khẩn cấp</h2>
        {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
          <button className="btn btn-danger">Tạo Cảnh báo</button>
        )}
      </div>
      <div style={{marginTop:'20px'}}>
        {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
      </div>
    </div>
  );
};
export default Alerts;
