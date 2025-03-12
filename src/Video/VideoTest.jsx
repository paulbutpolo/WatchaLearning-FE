// VideoUpload.jsx
import React, { useState, useEffect } from 'react';
import HLSPlayer from './HLSPlayer';
import makeApiCall from '../api/Api';

const API_URL = 'http://localhost:9000';

const VideoTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);

  // Fetch all videos on component mount
  useEffect(() => {
    fetchVideos();
    
    // Set up interval to refresh video statuses
    const intervalId = setInterval(() => {
      fetchVideos();
    }, 5000); // every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await makeApiCall('/api/videos', 'get');
      setVideos(response);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await makeApiCall('/api/videos/upload', 'post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      console.log('Upload successful:', response);
      setSelectedFile(null);
      setError(null);
      fetchVideos(); // Refresh the video list
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await makeApiCall(`/api/videos/${id}`, 'delete');
      
      // If this was the currently playing video, stop playback
      if (currentPlayingVideo && currentPlayingVideo.id === id) {
        setCurrentPlayingVideo(null);
      }
      
      fetchVideos(); // Refresh the video list
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete video: ${err.response?.data?.message || err.message}`);
    }
  };

  const handlePlayVideo = async (id) => {
    try {
      // Get HLS info for the video
      const response = await makeApiCall(`/api/videos/${id}/hls-info`);
      setCurrentPlayingVideo({
        id,
        masterPlaylist: `${API_URL}/${response.masterPlaylist}`,
        formats: response.formats
      });
    } catch (err) {
      console.error('Error getting HLS info:', err);
      setError(`Failed to play video: ${err.response?.data?.message || err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return 'blue';
      case 'transcoding': return 'orange';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="video-upload-container">
      <h2>Upload New Video</h2>
      
      <div className="upload-form">
        <input 
          type="file" 
          onChange={handleFileSelect} 
          accept="video/*"
          disabled={isUploading}
        />
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      
      {isUploading && (
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <span>{uploadProgress}%</span>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {currentPlayingVideo && (
        <div className="player-container">
          <h3>Now Playing</h3>
          <HLSPlayer src={currentPlayingVideo.masterPlaylist} />
          <button 
            className="close-button"
            onClick={() => setCurrentPlayingVideo(null)}
          >
            Close Player
          </button>
        </div>
      )}
      
      <h2>Your Videos</h2>
      {videos.length === 0 ? (
        <p>No videos uploaded yet</p>
      ) : (
        <div className="videos-list">
          {videos.map(video => (
            <div className="video-item" key={video.id}>
              <div className="video-info">
                <h3>{video.originalName}</h3>
                <p>
                  <span 
                    className="status-indicator" 
                    style={{ backgroundColor: getStatusColor(video.status) }}
                  ></span>
                  Status: {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                </p>
                <p>Uploaded: {formatDate(video.uploadDate)}</p>
                
                {video.status === 'transcoding' && (
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${video.transcodingProgress}%` }}
                    ></div>
                    <span>{video.transcodingProgress}% transcoded</span>
                  </div>
                )}
                
                {video.status === 'completed' && (
                  <>
                    <p>Completed: {formatDate(video.completedDate)}</p>
                    <button 
                      className="play-button"
                      onClick={() => handlePlayVideo(video.id)}
                    >
                      Play Video (Adaptive Streaming)
                    </button>
                  </>
                )}
                
                {video.status === 'failed' && (
                  <p className="error-message">
                    Transcoding failed. Please try again.
                  </p>
                )}
              </div>
              
              <div className="video-actions">
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(video.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .video-upload-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .upload-form {
          display: flex;
          margin-bottom: 20px;
        }
        
        .upload-form input {
          flex: 1;
          margin-right: 10px;
        }
        
        .progress-container {
          width: 100%;
          height: 20px;
          background-color: #eee;
          border-radius: 4px;
          margin: 10px 0;
          position: relative;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #4CAF50;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-container span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #333;
          font-size: 12px;
        }
        
        .error-message {
          color: red;
          margin: 10px 0;
        }
        
        .videos-list {
          margin-top: 20px;
        }
        
        .video-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 15px;
        }
        
        .video-info {
          flex: 1;
        }
        
        .status-indicator {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 5px;
        }
        
        .video-formats {
          margin-top: 10px;
        }
        
        .format-links {
          display: flex;
          gap: 10px;
        }
        
        .format-links a {
          padding: 5px 10px;
          background-color: #f0f0f0;
          border-radius: 4px;
          text-decoration: none;
          color: #333;
        }
        
        .format-links a:hover {
          background-color: #e0e0e0;
        }
        
        .delete-button {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .delete-button:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default VideoTest;