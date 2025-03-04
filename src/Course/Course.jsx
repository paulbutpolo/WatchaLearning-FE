import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';
import axios from 'axios';
import './css/Course.css';

const Course = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/paths`);
        const data = await response.json();
        setLearningPaths(data);
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      }
    };

    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscriber`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptions(response.data);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
      }
    };

    fetchSubscription();
    fetchLearningPaths();
  }, []);

  const handlePathClick = (id) => {
    navigate(`/course/${id}`);
  };

  // Function to check if a learning path is subscribed
  const isSubscribed = (id) => {
    return subscriptions.some(sub => sub.id === id);
  };

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>Course</h1>
        </header>
        <main className="content-test">
          <h2>Available Courses</h2>
          <table className="courses-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Subscription Status</th>
              </tr>
            </thead>
            <tbody>
              {learningPaths.map((path) => (
                <tr key={path._id} onClick={() => handlePathClick(path._id)}>
                  <td>{path.title}</td>
                  <td>{path.description}</td>
                  <td>{isSubscribed(path._id) ? 'Subscribed' : 'Unsubscribed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default Course;