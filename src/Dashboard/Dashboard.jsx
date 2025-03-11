import React from 'react';
import UserDashboard from './User';
import AdminDashboard from './Admin';

const Dashboard = () => {
  const userRole = localStorage.getItem('userRole');  // Change in production

  return userRole === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;