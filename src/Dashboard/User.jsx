import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';
import axios from 'axios';
import Loader from '../shared/Loader';
import Header from '../shared/Header';

const UserDashboard = () => {
  const [subscriptions, setSubscriptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // const fetchSubscription = async () => {
    //   try {
    //     const token = localStorage.getItem('authToken');
    //     const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscriber`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     setSubscriptions(response.data);
    //   } catch (err) {
    //     setError(err.response?.data?.message || 'Error fetching last watched video');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchSubscription();
  }, []);

  // const handleButtonClick = (courseId) => {
  //   navigate(`/course/${courseId}`);
  // };
  
  // if (loading) {
  //   return <Loader />;
  // }

  // if (error) {
  //   return <div>{error}</div>; 
  // }
  return (
    <>
      <SideBar />
      <div className = "main-content">
        {/* Static Header for now  */}
        <Header />
        
      </div>
    </>
  );
};

export default UserDashboard;