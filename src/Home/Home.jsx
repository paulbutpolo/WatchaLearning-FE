import React, { useEffect, useState } from 'react';
import SideBar from '../shared/Sidebar';
import axios from 'axios'; // Assuming you're using axios for API calls
import { useNavigate } from 'react-router-dom';
// import './css/Home.css'

const Home = () => {
  const [lastWatchedVideo, setLastWatchedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLastWatchedVideo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks/last-watched`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLastWatchedVideo(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching last watched video');
      } finally {
        setLoading(false);
      }
    };

    fetchLastWatchedVideo();
  }, []);

  const handleVideoClick = (courseId, videoId) => {
    navigate(`/course/${courseId}/video/${videoId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>Home</h1>
        </header>
        <main className="content-test">
          {lastWatchedVideo && lastWatchedVideo.videoId ? (
            <div className="card">
              <h3>Last Watched Video</h3>
              <p>Title: {lastWatchedVideo.videoTitle}</p>
              <button onClick={() => handleVideoClick(lastWatchedVideo.courseId, lastWatchedVideo.videoId)}>
                Watch Video
              </button>
            </div>
          ) : (
            <p>No video watched yet.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;