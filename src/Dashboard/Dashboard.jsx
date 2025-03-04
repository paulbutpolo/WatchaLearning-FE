import React, { useState, useEffect } from 'react';
import UserDashboard from './User';
import AdminDashboard from './Admin';
import axios from 'axios';

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/role`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setError('Failed to fetch user role. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>; 
  }

  if (userRole === 'admin') {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default Dashboard;