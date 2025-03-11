import React from 'react';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header'

const AdminDashboard = () => {
  return (
    <>
      <SideBar />
      <div className="main-content">
        <Header />
        Admin test
      </div>
    </>
  );
};

export default AdminDashboard;