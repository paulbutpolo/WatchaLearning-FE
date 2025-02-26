import { useState, useEffect } from 'react';
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
      console.log(token)
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        // Fetch the user's role from the backend
        const response = await axios.get('http://localhost:3000/api/users/role', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Set the user role
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
    return <div>Loading...</div>; // Show a loading spinner or message
  }

  if (error) {
    return <div>{error}</div>; // Show an error message
  }

  // Render the appropriate dashboard based on the user's role
  if (userRole === 'admin') {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default Dashboard;