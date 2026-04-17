import React, {useEffect, useState} from 'react';
import { getSheltersApi } from '../api/apiServices';
import { ShelterCard } from '../components/Cards';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  useEffect(() => { getSheltersApi().then(res => setShelters(res.data)) }, []);

  return (
    <div className="container">
      <h2>Danh sách điểm trú ẩn</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px', marginTop:'20px'}}>
        {shelters.map(s => <ShelterCard key={s.id} shelter={s} />)}
      </div>
    </div>
  );
};
export default Shelters;
