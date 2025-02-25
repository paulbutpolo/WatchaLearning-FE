import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './css/Dashboard.css'; // Reuse Home.css for consistent styling
import LearningPath from './LearningPath'; // Import the LearningPath component
import Videos from './Videos'; // Import the new Videos component

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
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>My App</h2>
        <nav>
          <ul>
            <li>
              <button onClick={() => navigate('/home')}>Home</button>
            </li>
            <li>
              <button onClick={() => navigate('/settings')}>Settings</button>
            </li>
            <li>
              <button onClick={handleLogout}>Log Out</button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1>Admin Dashboard</h1>
        </header>

        {/* Content */}
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