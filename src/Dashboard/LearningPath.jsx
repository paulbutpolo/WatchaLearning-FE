import React, { useState, useEffect } from 'react';

const LearningPath = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [editingPath, setEditingPath] = useState(null); // Track the learning path being edited

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

    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('You must be logged in to upload a video.');
      return;
    }

    const newLearningPath = {
      title,
      description,
      videos: selectedVideos.map((video) => ({
        videoId: video.id,
        order: video.order,
      })),
    };

    try {
      const response = await fetch('http://localhost:3000/api/paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

  // Handle edit button click
  const handleEdit = (path) => {
    setEditingPath(path);
    setTitle(path.title);
    setDescription(path.description);
    setSelectedVideos(
      path.videos.map((video) => ({
        id: video.videoId,
        order: video.order,
      }))
    );
  };

  // Handle update learning path
  const handleUpdateLearningPath = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('You must be logged in to update a learning path.');
      return;
    }

    const updatedLearningPath = {
      title,
      description,
      videos: selectedVideos.map((video) => ({
        videoId: video.id,
        order: video.order,
      })),
    };

    try {
      const response = await fetch(
        `http://localhost:3000/api/paths/${editingPath._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedLearningPath),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update learning path');
      }

      const updatedPath = await response.json();
      setLearningPaths(
        learningPaths.map((path) =>
          path._id === updatedPath._id ? updatedPath : path
        )
      );

      setEditingPath(null);
      setTitle('');
      setDescription('');
      setSelectedVideos([]);
      alert('Learning path updated successfully!');
    } catch (error) {
      console.error('Error updating learning path:', error);
      alert('Failed to update learning path. Please try again.');
    }
  };

  // Handle delete learning path
  const handleDeleteLearningPath = async (pathId) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('You must be logged in to delete a learning path.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/paths/${pathId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete learning path');
      }

      setLearningPaths(learningPaths.filter((path) => path._id !== pathId));
      alert('Learning path deleted successfully!');
    } catch (error) {
      console.error('Error deleting learning path:', error);
      alert('Failed to delete learning path. Please try again.');
    }
  };

  return (
    <div className="learning-path">
      <h2>Learning Paths</h2>

      {/* Form to create or edit a learning path */}
      <form onSubmit={editingPath ? handleUpdateLearningPath : handleCreateLearningPath}>
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
                checked={selectedVideos.some((v) => v.id === video._id)}
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
        <button type="submit">
          {editingPath ? 'Update Learning Path' : 'Create Learning Path'}
        </button>
        {editingPath && (
          <button type="button" onClick={() => setEditingPath(null)}>
            Cancel Edit
          </button>
        )}
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
            <th>Actions</th>
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
              <td>
                <button onClick={() => handleEdit(path)}>Edit</button>
                <button onClick={() => handleDeleteLearningPath(path._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LearningPath;