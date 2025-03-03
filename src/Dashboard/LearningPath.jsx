import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/LearningPath.css'

const LearningPath = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [editingPath, setEditingPath] = useState(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 5;

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const nextPage = (e) => {
    e.preventDefault();
    if (indexOfLastVideo < videos.length) setCurrentPage(currentPage + 1);
  };

  const prevPage = (e) => {
    e.preventDefault();
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/videos`);
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

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

    fetchLearningPaths();
  }, []);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/paths`, {
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

  const handleVideoSelection = (e, videoId) => {
    const order = parseInt(e.target.value, 10);

    if (e.target.checked) {
      setSelectedVideos([...selectedVideos, { id: videoId, order }]);
    } else {
      setSelectedVideos(selectedVideos.filter((video) => video.id !== videoId));
    }
  };

  const handleOrderChange = (videoId, newOrder) => {
    setSelectedVideos((prevSelectedVideos) =>
      prevSelectedVideos.map((video) =>
        video.id === videoId ? { ...video, order: newOrder } : video
      )
    );
  };

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
        `${import.meta.env.VITE_API_URL}/api/paths/${editingPath._id}`,
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

  const handleDeleteLearningPath = async (pathId) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('You must be logged in to delete a learning path.');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/paths/${pathId}`,
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

  const handlePathClick = (id) => {
    navigate(`/dashboard/${id}`);
  };

  return (
    <div className="learning-path">
      <h2>Learning Paths</h2>

      <form
        className="learning-path-form"
        onSubmit={editingPath ? handleUpdateLearningPath : handleCreateLearningPath}
      >
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            className="input-field"
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            className="textarea-field"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Select Videos:</label>
          {currentVideos.map((video) => (
            <div key={video._id} className="video-selection">
              <input
                type="checkbox"
                id={video._id}
                onChange={(e) => handleVideoSelection(e, video._id)}
                checked={selectedVideos.some((v) => v.id === video._id)}
              />
              <label htmlFor={video._id}>{video.title}</label>
              {selectedVideos.some((v) => v.id === video._id) && (
                <input
                  className="input-order"
                  type="number"
                  min="1"
                  value={selectedVideos.find((v) => v.id === video._id)?.order || ''}
                  onChange={(e) => handleOrderChange(video._id, parseInt(e.target.value, 10))}
                  placeholder="Order"
                />
              )}
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span> Page {currentPage} </span>
            <button onClick={nextPage} disabled={indexOfLastVideo >= videos.length}>
              Next
            </button>
          </div>
        </div>

        <button className="submit-btn" type="submit">
          {editingPath ? "Update Learning Path" : "Create Learning Path"}
        </button>
        {editingPath && (
          <button className="cancel-btn" type="button" onClick={() => setEditingPath(null)}>
            Cancel Edit
          </button>
        )}
      </form>

      {/* Learning Paths Table */}
      <h3>Current Learning Paths</h3>
      <table className="learning-path-table">
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
                      const selectedVideo = videos.find((v) => v._id === video.videoId);
                      return (
                        <li key={video.videoId}>
                          {selectedVideo ? selectedVideo.title : "Video not found"} (Order: {video.order})
                        </li>
                      );
                    })}
                </ul>
              </td>
              <td>
                <button className="details-btn" onClick={() => handlePathClick(path._id)}>Details</button>
                <button className="edit-btn" onClick={() => handleEdit(path)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDeleteLearningPath(path._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LearningPath;