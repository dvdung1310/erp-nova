import React from 'react';
import { useParams } from 'react-router-dom';

const Recruit_news = () => {
  const { target_id } = useParams();
  // Use target_id as needed
  return <div>Recruit News Component for Target ID: {target_id}</div>;
};

export default Recruit_news;
