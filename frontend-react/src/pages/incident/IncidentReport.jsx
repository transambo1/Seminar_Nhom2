import React from 'react';
import { useNavigate } from 'react-router-dom';
import IncidentReportForm from '../../components/incident/IncidentReportForm';

export default function IncidentReport() {
  const nav = useNavigate();

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '40px 20px' }}>
      <div className="card">
        <h1 style={{ color: '#EF4444' }}>Báo cáo sự cố khẩn cấp</h1>
        <div style={{ marginTop: '20px' }}>
          <IncidentReportForm onSuccess={() => nav('/dashboard')} />
        </div>
      </div>
    </div>
  );
}
