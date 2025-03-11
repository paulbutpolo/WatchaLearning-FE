import React, { useState, useEffect } from 'react';
import styles from './css/VideoDetailsModal.module.css';
import HLSPlayer from './HLSPlayer';
import makeApiCall from '../../api/Api';

const formatFileSize = (size) => {
  if (size >= 1e9) return (size / 1e9).toFixed(2) + " GB";
  if (size >= 1e6) return (size / 1e6).toFixed(2) + " MB";
  if (size >= 1e3) return (size / 1e3).toFixed(2) + " KB";
  return size + " B";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const API_URL = 'http://localhost:9000';

const VideoDetailsModal = ({ video, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVideo, setEditedVideo] = useState(video);
  const [activeTab, setActiveTab] = useState('details');
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [isUploadingSubtitle, setIsUploadingSubtitle] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [subtitleFile, setSubtitleFile] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Save the edited video details (you can implement this function)
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedVideo({ ...editedVideo, [name]: value });
  };

  const handlePlayVideo = async (id) => {
    setIsLoading(true);
    try {
      const response = await makeApiCall(`/api/videos/${id}/hls-info`);
      const videoData = {
        id,
        masterPlaylist: `${API_URL}/${response.masterPlaylist}`,
        formats: response.formats
      };
      setCurrentPlayingVideo(videoData);
    } catch (err) {
      console.error('Error getting HLS info:', err);
      setError(`Failed to play video: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: styles.statusCompleted,
      transcoding: styles.statusProcessing,
      error: styles.statusError,
      pending: styles.statusPending
    };
    
    return (
      <span className={`${styles.statusBadge} ${statusClasses[status.toLowerCase()] || ''}`}>
        {status}
      </span>
    );
  };

  const fetchSubtitles = async () => {
    if (!video.id) return;
    
    setIsLoading(true);
    try {
      const videoId = video.id
      const response = await makeApiCall(`/api/videos/${videoId}/subtitles`);
      setSubtitles(response);
    } catch (err) {
      console.error('Error fetching subtitles:', err);
      setError(`Failed to fetch subtitles: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtitleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/vtt') {
      setSubtitleFile(file);
      setError(null);
    } else {
      setSubtitleFile(null);
      setError('Please select a valid .vtt subtitle file');
    }
  };

  const handleSubtitleLanguageChange = (e) => {
    setSubtitleLanguage(e.target.value);
  };

  const handleSubtitleUpload = async () => {
    if (!subtitleFile || !subtitleLanguage) {
      setError('Please select a file and language');
      return;
    }

    setIsUploadingSubtitle(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', subtitleFile);
    formData.append('videoId', video.id);
    formData.append('language', subtitleLanguage);
  
    try {
      await makeApiCall('/api/subtitles', 'post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMessage('Subtitle uploaded successfully');
      setSubtitleFile(null);
      // Reset file input
      document.getElementById('subtitleFileInput').value = '';
      // Refresh subtitles list
      fetchSubtitles();
    } catch (err) {
      console.error('Error uploading subtitle:', err);
      setError(`Failed to upload subtitle: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploadingSubtitle(false);
    }
  };

  const handleDeleteSubtitle = async (subtitleId) => {
    if (!window.confirm('Are you sure you want to delete this subtitle?')) {
      return;
    }

    setIsLoading(true);
    try {
      await makeApiCall(`/api/subtitles/${subtitleId}`, 'DELETE');
      setSuccessMessage('Subtitle deleted successfully');
      // Refresh subtitles list
      fetchSubtitles();
    } catch (err) {
      console.error('Error deleting subtitle:', err);
      setError(`Failed to delete subtitle: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'player' && video.id) {
      handlePlayVideo(video.id);
    } else if (activeTab === 'subtitles' && video.id) {
      fetchSubtitles();
    }
  }, [activeTab, video.id]);

  // Clear messages when changing tabs
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [activeTab]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.test}>
            <h2>{video.originalName}</h2>
            <div className={styles.videoStatus}>
              {getStatusBadge(video.status)}
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'player' ? styles.activeTab : ''}`}
            onClick={() => 
              setActiveTab('player')
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
            </svg>
            Play Video
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'details' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Details
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'subtitles' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('subtitles')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Subtitles
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {activeTab === 'player' ? (
            <div className={styles.playerContainer}>
              {video.status === 'completed' ? (
                  isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    currentPlayingVideo ? (
                      <HLSPlayer src={currentPlayingVideo.masterPlaylist} />
                    ) : (
                      <div>No video to play</div>
                    )
                  )
              ) : (
                <div className={styles.videoPlaceholder}>
                  <div className={styles.placeholderContent}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>This video is currently {video.status.toLowerCase()}.</p>
                    <p>Playback will be available once processing is complete.</p>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'subtitles' ? (
            <div className={styles.subtitlesContainer}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
              
              <div className={styles.subtitleUploadSection}>
                <h3>Upload New Subtitle</h3>
                <div className={styles.uploadForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="subtitleLanguage">Language</label>
                    <select 
                      id="subtitleLanguage"
                      value={subtitleLanguage}
                      onChange={handleSubtitleLanguageChange}
                      className={styles.select}
                      disabled={isUploadingSubtitle}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="subtitleFileInput">Subtitle File (.vtt)</label>
                    <input 
                      type="file" 
                      id="subtitleFileInput"
                      accept=".vtt" 
                      onChange={handleSubtitleFileChange} 
                      className={styles.fileInput}
                      disabled={isUploadingSubtitle}
                    />
                    <div className={styles.fileHint}>Only .vtt format is supported</div>
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      className={styles.uploadButton}
                      onClick={handleSubtitleUpload}
                      disabled={!subtitleFile || isUploadingSubtitle}
                    >
                      {isUploadingSubtitle ? 'Uploading...' : 'Upload Subtitle'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.subtitlesListSection}>
                <h3>Available Subtitles</h3>
                {isLoading ? (
                  <div className={styles.loading}>Loading subtitles...</div>
                ) : subtitles.length > 0 ? (
                  <table className={styles.subtitlesTable}>
                    <thead>
                      <tr>
                        <th>Language</th>
                        <th>Added Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subtitles.map((subtitle) => (
                        <tr key={subtitle._id}>
                          <td>{subtitle.language}</td>
                          <td>{formatDate(subtitle.createdAt)}</td>
                          <td>
                            <button 
                              className={styles.deleteButton}
                              onClick={() => handleDeleteSubtitle(subtitle._id)}
                              disabled={isLoading}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.noSubtitles}>
                    No subtitles available for this video.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {isEditing ? (
                <form className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="originalName">Title</label>
                    <input 
                      type="text" 
                      id="originalName" 
                      name="originalName" 
                      value={editedVideo.originalName} 
                      onChange={handleChange} 
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="status">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      value={editedVideo.status} 
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="error">Error</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={styles.cancelButton} 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className={styles.saveButton} 
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className={styles.videoInfo}>
                    
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Type</span>
                        <span className={styles.detailValue}>{video.type}</span>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Size</span>
                        <span className={styles.detailValue}>{formatFileSize(video.size)}</span>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Upload Date</span>
                        <span className={styles.detailValue}>{formatDate(video.uploadDate)}</span>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Completed Date</span>
                        <span className={styles.detailValue}>{formatDate(video.completedDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.modalFooter}>
                    <button 
                      onClick={handleEdit} 
                      className={styles.editButton}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.editIcon}>
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Edit Details
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsModal;