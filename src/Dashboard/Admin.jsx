import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SideBar from '../shared/Sidebar';
import LearningPath from './LearningPath'; // Import the LearningPath component
import Videos from './Videos'; // Import the new Videos component
import './css/Dashboard.css'; // Reuse Home.css for consistent styling

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(''); // State to manage the active tab

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

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
        <main className="content">
          <h2>Welcome, Admin!</h2>
          <p>Manage users, settings, and more.</p>
          <div>
            <h3>Admin Features</h3>
            <div className="navbar">
              <div className="logo"><a href="#">Logo</a></div>
              <div className="nav-links">
                <a href="#" onClick={() => handleTabClick('learningPath')}>Learning Paths</a>
                <a href="#" onClick={() => handleTabClick('videos')}>Videos</a>
                <a href="#">User Management</a>
                <a href="#">TBA</a>
              </div>
            </div>
          </div>
          {activeTab === 'learningPath' && <LearningPath />}
          {activeTab === 'videos' && <Videos />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;