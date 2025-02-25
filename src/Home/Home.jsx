import { useNavigate } from 'react-router-dom';
import "./css/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>My App</h2>
        <nav>
          <ul>
            <li>
              <button onClick={() => navigate('/dashboard')}>Dashboard</button>
            </li>
            <li>
              <button onClick={() => navigate('/settings')}>Settings</button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1>Home</h1>
        </header>

        {/* Content */}
        <main className="content">
        </main>
      </div>
    </div>
  );
};

export default Home;
