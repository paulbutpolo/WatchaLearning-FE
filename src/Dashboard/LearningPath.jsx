import React, { useState, useEffect } from 'react';

const LearningPath = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videos, setVideos] = useState([]);

  // Fetch videos from the API when the component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/videos');
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  // Fetch learning paths from the API when the component mounts
  useEffect(() => {
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

  // Handle form submission to create a new learning path
  const handleCreateLearningPath = async (e) => {
    e.preventDefault();

    const newLearningPath = {
      title,
      description,
      videos: selectedVideos.map((video) => ({
        videoId: video.id,
        order: video.order,
      })),
      createdBy: 'Admin', // Replace with actual user ID from auth
    };

    try {
      const response = await fetch('http://localhost:3000/api/paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLearningPath),
      });

      if (!response.ok) {
        throw new Error('Failed to create learning path');
      }

      const createdPath = await response.json();
      setLearningPaths([...learningPaths, createdPath]);

      setTitle('');
      setDescription('');
      setSelectedVideos([]);
      alert('Learning path created successfully!');
    } catch (error) {
      console.error('Error creating learning path:', error);
      alert('Failed to create learning path. Please try again.');
    }
  };

  // Handle video selection and order input
  const handleVideoSelection = (e, videoId) => {
    const order = parseInt(e.target.value, 10);

    if (e.target.checked) {
      setSelectedVideos([...selectedVideos, { id: videoId, order }]);
    } else {
      setSelectedVideos(selectedVideos.filter((video) => video.id !== videoId));
    }
  };

  // Handle order change for a selected video
  const handleOrderChange = (videoId, newOrder) => {
    setSelectedVideos((prevSelectedVideos) =>
      prevSelectedVideos.map((video) =>
        video.id === videoId ? { ...video, order: newOrder } : video
      )
    );
  };

  return (
    <div className="learning-path">
      <h2>Learning Paths</h2>

      {/* Form to create a new learning path */}
      <form onSubmit={handleCreateLearningPath}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Select Videos:</label>
          {videos.map((video) => (
            <div key={video._id}>
              <input
                type="checkbox"
                id={video._id}
                onChange={(e) => handleVideoSelection(e, video._id)}
              />
              <label htmlFor={video._id}>{video.title}</label>
              {selectedVideos.some((v) => v.id === video._id) && (
                <input
                  type="number"
                  min="1"
                  value={
                    selectedVideos.find((v) => v.id === video._id)?.order || ''
                  }
                  onChange={(e) =>
                    handleOrderChange(video._id, parseInt(e.target.value, 10))
                  }
                  placeholder="Order"
                />
              )}
            </div>
          ))}
        </div>
        <button type="submit">Create Learning Path</button>
      </form>

      {/* Table to display learning paths */}
      <h3>Current Learning Paths</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Videos</th>
          </tr>
        </thead>
        <tbody>
          {learningPaths.map((path) => (
            <tr key={path._id}>
              <td>{path.title}</td>
              <td>{path.description}</td>
              <td>{path.createdBy}</td>
              <td>
                <ul>
                  {path.videos
                    .sort((a, b) => a.order - b.order)
                    .map((video) => {
                      const selectedVideo = videos.find(
                        (v) => v._id === video.videoId
                      );
                      return (
                        <li key={video.videoId}>
                          {selectedVideo ? selectedVideo.title : 'Video not found'} (Order: {video.order})
                        </li>
                      );
                    })}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
 
export default LearningPath;