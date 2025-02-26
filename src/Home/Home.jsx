import { useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';
import "./css/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>Home</h1>
        </header>
        <main className="content">
        </main>
      </div>
    </div>
  );
};

export default Home;
