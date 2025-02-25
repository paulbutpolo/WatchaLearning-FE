import { useState, useEffect } from 'react';
import UserDashboard from './User';
import AdminDashboard from './Admin';

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Fetch the user role from localStorage or an API
    const role = localStorage.getItem('userRole') || 'admin'; // Default to 'user'
    setUserRole(role);
  }, []);

  if (userRole === 'admin') {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default Dashboard;