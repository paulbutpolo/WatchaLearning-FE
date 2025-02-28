import { useState } from 'react';
import SideBar from '../shared/Sidebar';
import LearningPath from './LearningPath'; 
import Videos from './Videos';
import UserManagement from './UserManagement';
import './css/Admin.css'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(''); // State to manage the active tab

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>Admin Dashboard</h1>
        </header>
        <main className="content-admin">
          <div className="navbar">
            <div className="nav-links">
              <a href="#" onClick={() => handleTabClick('learningPath')}>Learning Paths</a>
              <a href="#" onClick={() => handleTabClick('videos')}>Videos</a>
              <a href="#" onClick={() => handleTabClick('usermgmt')}>User Management</a>
              <a href="#">TBA</a>
            </div>
          </div>
          {activeTab === 'learningPath' && <LearningPath />}
          {activeTab === 'videos' && <Videos />}
          {activeTab === 'usermgmt' && <UserManagement />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;