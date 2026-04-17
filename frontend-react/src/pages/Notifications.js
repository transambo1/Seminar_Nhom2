import React, {useEffect, useState} from 'react';
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
      <h2>Thông báo</h2>
      <div style={{marginTop:'20px'}}>
        {notifs.map(n => <NotificationItem key={n.id} notif={n} onRead={onRead} />)}
      </div>
    </div>
  );
};
export default Notifications;
