import { useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';
import './css/Dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token and user role from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>User Dashboard</h1>
        </header>
        <main className="content">
          <h2>Welcome, User!</h2>
          <p>Here you can access your personal content and settings.</p>
          <div>
            <h3>Your Data</h3>
            <p>This is where user-specific data will be displayed.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;