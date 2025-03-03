import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';
import axios from 'axios';
import './css/User.css';

const UserDashboard = () => {
  const [subscriptions, setSubscriptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscriber`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptions(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching last watched video');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleButtonClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>User Dashboard</h1>
        </header>
        <main className="content-test">
          {subscriptions.map((subscription, index) => (
            <div key={subscription.id.toString()} className="subscription-item">
              <h3>{subscription.title}</h3>
              <p>Progress: {subscription.progress}</p>
              <button onClick={() => handleButtonClick(subscription.id)}>
                View Details
              </button>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;