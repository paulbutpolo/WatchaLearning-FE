import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../shared/Sidebar';
import './css/LearningPathDetail.css'

const LearningPathDetail = () => {
  const { id } = useParams();
  const [learningPath, setLearningPath] = useState(null);
  const [videos, setVideos] = useState([]);
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: '', description: '', url: '' });

  // Fetch learning path, videos, and resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch learning path
        const pathResponse = await fetch(`http://localhost:3000/api/paths/${id}`);
        const pathData = await pathResponse.json();
        setLearningPath(pathData);

        // Fetch videos
        const videosResponse = await fetch('http://localhost:3000/api/videos');
        const videosData = await videosResponse.json();
        setVideos(videosData);

        // Fetch resources
        const resourcesResponse = await fetch(
          `http://localhost:3000/api/learning-paths/${id}/resources`
        );
        const resourcesData = await resourcesResponse.json();
        setResources(resourcesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  // Handle adding a new resource
  const handleAddResource = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in to add a resource.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/learning-paths/${id}/resources`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newResource),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add resource');
      }

      const addedResource = await response.json();
      setResources([...resources, addedResource]); // Update resources list
      setNewResource({ title: '', description: '', url: '' }); // Reset form
      alert('Resource added successfully!');
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource. Please try again.');
    }
  };

  // Handle input changes for the new resource form
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewResource((prev) => ({ ...prev, [id]: value }));
  };

  const handleDelete = async (resourceId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/resources/${resourceId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete learning path');
      }

      setResources(resources.filter((path) => path._id !== resourceId));
      alert('Learning path deleted successfully!');
      
    } catch(error){
      console.error('Error deleting learning resource:', error);
    }
  }

  if (!learningPath) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>Admin Dashboard</h1>
        </header>
        <main className="content-admin">
          <div className="learningPathContainer">
            <h2 className="title">{learningPath.title}</h2>
            <p>{learningPath.description}</p>

            {/* Videos Section */}
            <h3 className="subTitle">Videos</h3>
            <ul className="videoList">
              {learningPath.videos
                .sort((a, b) => a.order - b.order)
                .map((video) => {
                  const selectedVideo = videos.find((v) => v._id === video.videoId);
                  return (
                    <li key={video.videoId} className="videoItem">
                      {selectedVideo ? selectedVideo.title : "Video not found"} (Order: {video.order})
                    </li>
                  );
                })}
            </ul>

            {/* Add Resource Form */}
            <h3 className="subTitle">Add Resource</h3>
            <form onSubmit={handleAddResource}>
              <div>
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  className="inputField"
                  value={newResource.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  className="inputField"
                  value={newResource.description}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="url">URL:</label>
                <input
                  type="url"
                  id="url"
                  className="inputField"
                  value={newResource.url}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submitButton">Add Resource</button>
            </form>

            {/* Resources List */}
            <h3 className="subTitle">Resources</h3>
            {resources.length === 0 ? (
              <p>No resources found.</p>
            ) : (
              <ul>
                {resources.map((resource) => (
                  <li key={resource._id}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resourceLink">
                      {resource.title}
                    </a>
                    <p className="resourceDescription">{resource.description}</p>
                    <button onClick={() => handleDelete(resource._id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPathDetail;