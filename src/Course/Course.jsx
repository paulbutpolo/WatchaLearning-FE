import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';

const Course = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch learning paths from the backend
    const fetchLearningPaths = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/paths');
        const data = await response.json();
        setLearningPaths(data);
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      }
    };

    fetchLearningPaths();
  }, []);

  const handlePathClick = (id) => {
    navigate(`/course/${id}`);
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>Course</h1>
        </header>
        <main className="content">
          <h2>Learning Paths</h2>
          <ul>
            {learningPaths.map((path) => (
              <li key={path._id} onClick={() => handlePathClick(path._id)}>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default Course;