import { useNavigate } from "react-router-dom";
import './Sidebar.css'

const SideBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="sidebar-container">
      <h2>My App</h2>
      <nav className="sidebar-nav">
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        <button onClick={() => navigate("/course")}>Course</button>
        <button onClick={() => navigate("/settings")}>Settings</button>
        <button onClick={handleLogout}>Log Out</button>
      </nav>
    </div>
  );
};

export default SideBar;