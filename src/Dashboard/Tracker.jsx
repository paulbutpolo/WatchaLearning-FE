import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Tracker.css'

const Tracker = () => {
  const token = localStorage.getItem('authToken');
  const [progressData, setProgressData] = useState([]); // State to store progress data
  const [error, setError] = useState(''); // State to handle errors

  useEffect(() => {
    fetchAllProgress();
  }, []);

  const fetchAllProgress = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscriber/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(res.data);
      setProgressData(res.data); // Set the fetched data to state
    } catch (error) {
      setError('Failed to fetch progress data.'); // Set error message
      console.error('Failed to fetch progress data', error);
    }
  };

  return (
    <div>
      <h1>Progress Tracker</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table className='tracker-table'>
        <thead>
          <tr>
            <th>Username</th>
            <th>User ID</th>
            <th>Course ID</th>
            <th>Total Videos</th>
            <th>Completed Videos</th>
            <th>Progress Percentage</th>
            <th>Course Completed</th>
          </tr>
        </thead>
        <tbody>
          {progressData.map((progress, index) => (
            <tr key={index}>
              <td>{progress.username}</td>
              <td>{progress.userId}</td>
              <td>{progress.courseId}</td>
              <td>{progress.totalVideos}</td>
              <td>{progress.completedVideos}</td>
              <td>{progress.progressPercentage}%</td>
              <td>{progress.courseCompleted ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tracker;