import os
import json

base_dir = r"d:\Seminar_Nhom2\frontend-react"

package_json = {
  "name": "stormshield-frontend",
  "version": "1.0.0",
  "private": True,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "react-scripts": "5.0.1",
    "axios": "^1.6.8",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app", "react-app/jest"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}

files = {}

# 1. package.json
files["package.json"] = json.dumps(package_json, indent=2)

# 2. Public
files["public/index.html"] = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StormShield | Emergency Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>"""

# 3. src/index.css (Premium Styling as per persona)
files["src/index.css"] = """
:root {
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --secondary: #1E293B;
  --bg-color: #F8FAFC;
  --surface: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
  
  --danger: #EF4444;
  --warning: #F59E0B;
  --success: #10B981;
  --info: #3B82F6;

  --radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* NAVBAR */
.navbar {
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
}
.nav-brand { font-size: 1.5rem; font-weight: 700; color: var(--primary); text-decoration: none; }
.nav-links a { margin-left: 20px; text-decoration: none; color: var(--text-muted); font-weight: 500; transition: 0.2s; }
.nav-links a:hover { color: var(--primary); }

/* CARDS */
.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 16px;
}
.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.card-title { font-weight: 600; font-size: 1.1rem; }

/* BUTTONS */
.btn {
  background: var(--primary); color: white; border: none; padding: 10px 18px;
  border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s; font-size: 0.95rem; display: inline-block;
}
.btn:hover { background: var(--primary-hover); }
.btn-danger { background: var(--danger); }
.btn-danger:hover { background: #DC2626; }
.btn-outline { background: transparent; color: var(--primary); border: 1px solid var(--primary); }

/* LAYOUT FORMS */
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-muted); font-size: 0.9rem;}
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-family: inherit; transition: 0.2s;
}
.form-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

/* MAP */
.map-container { height: 500px; width: 100%; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-md); }

/* BADGES */
.badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.badge.ACTIVE, .badge.AVAILABLE, .badge.RESOLVED, .badge.APPROVED { background: #D1FAE5; color: #065F46; }
.badge.PENDING, .badge.IN_PROGRESS, .badge.NEAR_FULL { background: #FEF3C7; color: #92400E; }
.badge.CRITICAL, .badge.HIGH, .badge.FULL, .badge.CLOSED, .badge.REJECTED { background: #FEE2E2; color: #991B1B; }
"""

# 4. src/api/axiosClient.js
files["src/api/axiosClient.js"] = """import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  // Temporary fix for MVP decoupled microservices
  const userStr = localStorage.getItem('user');
  if (userStr) {
      const user = JSON.parse(userStr);
      config.headers['X-User-Id'] = user.id;
  }
  return config;
});

export default axiosClient;
"""

# 5. src/api/apiServices.js
files["src/api/apiServices.js"] = """import axiosClient from './axiosClient';

// Auth
export const loginApi = (data) => axiosClient.post('/auth/login', data);
export const registerApi = (data) => axiosClient.post('/auth/register', data);
export const getMeApi = () => axiosClient.get('/auth/me');

// Shelters
export const getSheltersApi = () => axiosClient.get('/shelters');
export const getShelterByIdApi = (id) => axiosClient.get(`/shelters/${id}`);

// Alerts
export const getActiveAlertsApi = () => axiosClient.get('/alerts/active');

// Reports
export const submitReportApi = (data) => axiosClient.post('/reports', data);
export const getApprovedReportsApi = () => axiosClient.get('/reports/approved');
export const getPendingReportsApi = () => axiosClient.get('/reports/pending');
export const approveReportApi = (id, adminId) => axiosClient.patch(`/reports/${id}/approve`, { adminId });
export const rejectReportApi = (id, adminId) => axiosClient.patch(`/reports/${id}/reject`, { adminId });

// Support Requests
export const createSupportApi = (data) => axiosClient.post('/support-requests', data);
export const getMySupportsApi = () => axiosClient.get('/support-requests/my');
export const getAllSupportsApi = () => axiosClient.get('/support-requests');
export const updateSupportStatusApi = (id, status) => axiosClient.patch(`/support-requests/${id}/status`, { status });

// Notifications
export const getMyNotificationsApi = () => axiosClient.get('/notifications/my');
export const markNotificationReadApi = (id) => axiosClient.patch(`/notifications/${id}/read`);
"""

# Reusable Components
files["src/components/Navbar.js"] = """import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">StormShield</Link>
      <div className="nav-links">
        {token ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/shelters">Shelters</Link>
            <Link to="/alerts">Alerts</Link>
            <Link to="/my-supports">My Requests</Link>
            <Link to="/notifications">Notifications</Link>
            {(user.role === 'ADMIN' || user.role === 'RESCUER') && (
              <>
                <Link to="/admin/reports" style={{color: 'var(--danger)'}}>Review Reports</Link>
                <Link to="/admin/supports" style={{color: 'var(--danger)'}}>Manage Rescues</Link>
              </>
            )}
            <button onClick={logout} className="btn btn-outline" style={{marginLeft: '15px'}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
"""

files["src/components/ProtectedRoute.js"] = """import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN' && user.role !== 'RESCUER') {
      return <Navigate to="/" replace />;
  }
  return children;
};
export default ProtectedRoute;
"""

files["src/components/MapView.js"] = """import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet icon issue in react
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25,41], iconAnchor: [12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ shelters = [], reports = [] }) => {
  const center = [16.047079, 108.206230]; // Da Nang roughly

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {shelters.map(s => (
          <Marker key={`s-${s.id}`} position={[s.latitude, s.longitude]}>
            <Popup>
              <strong>{s.name}</strong><br/>
              Status: {s.status}<br/>
              Capacity: {s.currentOccupancy}/{s.capacity}
            </Popup>
          </Marker>
        ))}
        {reports.map(r => (
          <Marker key={`r-${r.id}`} position={[r.latitude, r.longitude]}>
            <Popup>
              <strong>HAZARD: {r.reportType}</strong><br/>
              Danger: {r.dangerLevel}<br/>
              {r.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
export default MapView;
"""

files["src/components/Cards.js"] = """import React from 'react';

export const ShelterCard = ({ shelter }) => (
  <div className="card">
    <div className="card-header">
      <span className="card-title">{shelter.name}</span>
      <span className={`badge ${shelter.status}`}>{shelter.status}</span>
    </div>
    <p>Capacity: {shelter.currentOccupancy} / {shelter.capacity}</p>
    <p>Address: {shelter.address}</p>
  </div>
);

export const AlertCard = ({ alert }) => (
  <div className="card" style={{borderLeft: `4px solid ${alert.severityLevel === 'CRITICAL' ? 'red' : 'orange'}`}}>
    <div className="card-header">
      <span className="card-title">{alert.title}</span>
      <span className={`badge ${alert.severityLevel}`}>{alert.severityLevel}</span>
    </div>
    <p>{alert.description}</p>
    <small>Area: {alert.affectedArea}</small>
  </div>
);

export const NotificationItem = ({ notif, onRead }) => (
  <div className="card" style={{opacity: notif.isRead ? 0.6 : 1}}>
    <strong>{notif.title}</strong>
    <p>{notif.message}</p>
    {!notif.isRead && <button className="btn" onClick={() => onRead(notif.id)} style={{marginTop:'10px', padding:'5px 10px'}}>Mark Read</button>}
  </div>
);
"""

# Pages
files["src/pages/Login.js"] = """import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/apiServices';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginApi(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch(err) { alert('Login Failed'); }
  };

  return (
    <div className="container" style={{maxWidth: '400px', marginTop: '10vh'}}>
      <div className="card">
        <h2 style={{marginBottom: '20px'}}>Login to StormShield</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn" style={{width: '100%'}}>Login</button>
        </form>
      </div>
    </div>
  );
};
export default Login;
"""

files["src/pages/Register.js"] = """import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../api/apiServices';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName:'', phoneNumber:'', email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await registerApi(form);
      alert('Success! Please login.');
      navigate('/login');
    } catch(err) { alert('Register Failed'); }
  };

  return (
    <div className="container" style={{maxWidth: '400px', marginTop: '10vh'}}>
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={submit} style={{marginTop: '20px'}}>
          <div className="form-group"><label>Full Name</label><input onChange={e=>setForm({...form, fullName:e.target.value})}/></div>
          <div className="form-group"><label>Phone</label><input onChange={e=>setForm({...form, phoneNumber:e.target.value})}/></div>
          <div className="form-group"><label>Email</label><input type="email" onChange={e=>setForm({...form, email:e.target.value})}/></div>
          <div className="form-group"><label>Password</label><input type="password" onChange={e=>setForm({...form, password:e.target.value})}/></div>
          <button className="btn" style={{width:'100%'}}>Sign Up</button>
        </form>
      </div>
    </div>
  );
};
export default Register;
"""

files["src/pages/Dashboard.js"] = """import React, {useEffect, useState} from 'react';
import MapView from '../components/MapView';
import { getSheltersApi, getApprovedReportsApi, getActiveAlertsApi } from '../api/apiServices';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [shelters, setShelters] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getSheltersApi().then(res => setShelters(res.data)).catch(console.error);
    getApprovedReportsApi().then(res => setReports(res.data)).catch(console.error);
    getActiveAlertsApi().then(res => setAlerts(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container">
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
        <h2>StormShield Dashboard</h2>
        <div>
          <Link to="/shelters" className="btn btn-outline" style={{marginRight:'10px'}}>Find Shelter</Link>
          <Link to="/report-hazard" className="btn btn-danger" style={{marginRight:'10px'}}>Report Hazard</Link>
          <Link to="/request-support" className="btn">Request Rescue</Link>
        </div>
      </div>
      
      {alerts.length > 0 && (
        <div style={{background: 'var(--danger)', color: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px'}}>
          <strong>ACTIVE ALERT:</strong> {alerts[0].title}
        </div>
      )}

      <MapView shelters={shelters} reports={reports} />
    </div>
  );
};
export default Dashboard;
"""

files["src/pages/Shelters.js"] = """import React, {useEffect, useState} from 'react';
import { getSheltersApi } from '../api/apiServices';
import { ShelterCard } from '../components/Cards';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  useEffect(() => { getSheltersApi().then(res => setShelters(res.data)) }, []);

  return (
    <div className="container">
      <h2>Emergency Shelters</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px', marginTop:'20px'}}>
        {shelters.map(s => <ShelterCard key={s.id} shelter={s} />)}
      </div>
    </div>
  );
};
export default Shelters;
"""

files["src/pages/Alerts.js"] = """import React, {useEffect, useState} from 'react';
import { getActiveAlertsApi } from '../api/apiServices';
import { AlertCard } from '../components/Cards';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { getActiveAlertsApi().then(res => setAlerts(res.data)) }, []);
  return (
    <div className="container">
      <h2>Active Emergency Alerts</h2>
      <div style={{marginTop:'20px'}}>
        {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
      </div>
    </div>
  );
};
export default Alerts;
"""

files["src/pages/Forms.js"] = """import React, {useState} from 'react';
import { submitReportApi, createSupportApi } from '../api/apiServices';
import { useNavigate } from 'react-router-dom';

export const ReportHazard = () => {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({ userId: user.id, reportType: 'FLOOD', description: '', latitude: 16.05, longitude: 108.2, dangerLevel: 'HIGH'});

  const submit = async(e) => {
    e.preventDefault();
    await submitReportApi(form);
    alert('Report submitted for review!');
    nav('/');
  }

  return (
    <div className="container" style={{maxWidth:'600px'}}>
      <div className="card">
        <h2>Report a Hazard</h2>
        <form onSubmit={submit} style={{marginTop:'20px'}}>
          <div className="form-group"><label>Type</label><select onChange={e=>setForm({...form, reportType:e.target.value})}><option>FLOOD</option><option>BLOCKED_ROAD</option><option>LANDSLIDE</option></select></div>
          <div className="form-group"><label>Danger Level</label><select onChange={e=>setForm({...form, dangerLevel:e.target.value})}><option>HIGH</option><option>CRITICAL</option><option>MEDIUM</option></select></div>
          <div className="form-group"><label>Description</label><textarea onChange={e=>setForm({...form, description:e.target.value})}/></div>
          <button className="btn btn-danger">Submit Report</button>
        </form>
      </div>
    </div>
  );
};

export const RequestSupport = () => {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({ userId: user.id, requestType: 'RESCUE', description: '', numberOfPeople: 1, latitude: 16.05, longitude: 108.2, priorityLevel: 'URGENT'});

  const submit = async(e) => {
    e.preventDefault();
    await createSupportApi(form);
    alert('Rescue request dispatched!');
    nav('/my-supports');
  }

  return (
    <div className="container" style={{maxWidth:'600px'}}>
      <div className="card">
        <h2>Request Emergency Support / Rescue</h2>
        <form onSubmit={submit} style={{marginTop:'20px'}}>
          <div className="form-group"><label>Type</label><select onChange={e=>setForm({...form, requestType:e.target.value})}><option>RESCUE</option><option>MEDICAL</option><option>EVACUATION</option></select></div>
          <div className="form-group"><label>People Needing Help</label><input type="number" value={form.numberOfPeople} onChange={e=>setForm({...form, numberOfPeople:e.target.value})}/></div>
          <div className="form-group"><label>Description / Details</label><textarea onChange={e=>setForm({...form, description:e.target.value})}/></div>
          <button className="btn">Request Support Now</button>
        </form>
      </div>
    </div>
  );
};
"""

files["src/pages/MySupports.js"] = """import React, {useEffect, useState} from 'react';
import { getMySupportsApi } from '../api/apiServices';

const MySupports = () => {
  const [reqs, setReqs] = useState([]);
  useEffect(() => { getMySupportsApi().then(res => setReqs(res.data)).catch(console.error) }, []);

  return (
    <div className="container">
      <h2>My Rescue Requests</h2>
      {reqs.map(r => (
        <div key={r.id} className="card" style={{marginTop:'20px'}}>
          <div className="card-header"><span>{r.requestType} - {r.numberOfPeople} People</span><span className={`badge ${r.status}`}>{r.status}</span></div>
          <p>{r.description}</p>
        </div>
      ))}
    </div>
  );
};
export default MySupports;
"""

files["src/pages/Notifications.js"] = """import React, {useEffect, useState} from 'react';
import { getMyNotificationsApi, markNotificationReadApi } from '../api/apiServices';
import { NotificationItem } from '../components/Cards';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  
  const load = () => getMyNotificationsApi().then(res => setNotifs(res.data));
  useEffect(() => { load() }, []);

  const onRead = async (id) => {
    await markNotificationReadApi(id);
    load();
  };

  return (
    <div className="container">
      <h2>Notifications</h2>
      <div style={{marginTop:'20px'}}>
        {notifs.map(n => <NotificationItem key={n.id} notif={n} onRead={onRead} />)}
      </div>
    </div>
  );
};
export default Notifications;
"""

files["src/pages/AdminPages.js"] = """import React, {useEffect, useState} from 'react';
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
      <h2>Review Hazard Reports</h2>
      {reports.map(r => (
        <div key={r.id} className="card" style={{marginTop:'20px'}}>
          <strong>{r.reportType}</strong><p>{r.description}</p>
          <div style={{marginTop:'10px'}}>
            <button className="btn" onClick={()=>action(r.id, true)} style={{marginRight:'10px'}}>Approve to Map</button>
            <button className="btn btn-outline" onClick={()=>action(r.id, false)}>Reject</button>
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
      <h2>Manage Rescue Requests</h2>
      {reqs.map(r => (
        <div key={r.id} className="card" style={{marginTop:'20px'}}>
          <div className="card-header"><span>{r.requestType} - {r.numberOfPeople} People</span><span className={`badge ${r.status}`}>{r.status}</span></div>
          <p>{r.description}</p>
          {r.status === 'PENDING' && <button className="btn" onClick={()=>update(r.id, 'ASSIGNED')}>Assign Team</button>}
          {r.status === 'ASSIGNED' && <button className="btn" onClick={()=>update(r.id, 'IN_PROGRESS')}>Mark In Progress</button>}
          {r.status === 'IN_PROGRESS' && <button className="btn" onClick={()=>update(r.id, 'RESOLVED')}>Mark Resolved</button>}
        </div>
      ))}
    </div>
  );
};
"""

# App.js and Index.js
files["src/App.js"] = """import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shelters from './pages/Shelters';
import Alerts from './pages/Alerts';
import { ReportHazard, RequestSupport } from './pages/Forms';
import MySupports from './pages/MySupports';
import Notifications from './pages/Notifications';
import { AdminReportReview, AdminSupportManagement } from './pages/AdminPages';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/shelters" element={<ProtectedRoute><Shelters /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/report-hazard" element={<ProtectedRoute><ReportHazard /></ProtectedRoute>} />
        <Route path="/request-support" element={<ProtectedRoute><RequestSupport /></ProtectedRoute>} />
        <Route path="/my-supports" element={<ProtectedRoute><MySupports /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReportReview /></ProtectedRoute>} />
        <Route path="/admin/supports" element={<ProtectedRoute adminOnly><AdminSupportManagement /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
"""

files["src/index.js"] = """import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
"""

for partial_path, content in files.items():
    full_path = os.path.join(base_dir, partial_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Frontend scaffolded successfully")
