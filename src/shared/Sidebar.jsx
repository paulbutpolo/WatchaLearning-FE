import { useNavigate } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <h2>My App</h2>
      <nav>
        <ul>
          <li>
            <button onClick={() => navigate("/home")}>Home</button>
          </li>
          <li>
            <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          </li>
          <li>
            <button onClick={() => navigate("/course")}>Course</button>
          </li>
          <li>
            <button onClick={() => navigate("/settings")}>Settings</button>
          </li>
          <li>
            <button onClick={handleLogout}>Log Out</button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;