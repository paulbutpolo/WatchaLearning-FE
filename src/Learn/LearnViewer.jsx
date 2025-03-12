// LearnViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header';
import Loader from '../shared/Loader';
import HLSPlayer from '../Video/HLSPlayer';
import styles from './css/LearnViewer.module.css';
import makeApiCall from '../api/Api';

const LearnViewer = () => {
  const { id } = useParams(); // Extract the `id` parameter from the URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isDownloadOptionsOpen, setIsDownloadOptionsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null); // For HLSPlayer.jsx
  const [isLoading, setIsLoading] = useState(false); // For HLSPlayer.jsx
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingResolution, setDownloadingResolution] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_MINIO_URL;
  useEffect(() => {
    const fetchCourse = async () => {

      await new Promise((resolve) => setTimeout(resolve, 250)); // Simulation for the skeleton
      
      try {
        const courseData = await makeApiCall(`/api/course/${id}`); // Fetch course data from your backend
        setCourse(courseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const subscriptionChecker = async () => {
      const res = await makeApiCall(`/api/subscriber/check?courseId=${id}`);
      if (!res.isSubscribed) {
        navigate(`/unauthorized`);
      }
    }
    subscriptionChecker();
    fetchCourse();
  }, [id]);

  useEffect(() => {
    const videoId = course?.modules[activeModule]?.video?.id;
    if (videoId) {
      handlePlayVideo(videoId);
    } else {
      console.warn('Video ID is missing or undefined.');
      setCurrentPlayingVideo(null); // Clear any previous video data
    }

    const fetchNotes = async () => {
      try {
        const response = await makeApiCall(`/api/notes/${id}/${videoId}`);
        setNotes(response);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, [activeModule, course]);

  if (loading) {
    return <Loader/>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <p>Course not found or no modules available.</p>
      </div>
    );
  }

  const currentModule = course.modules[activeModule];

  const handleNoteChange = (e) => {
    setCurrentNote(e.target.value);
  };

  const saveNotes = async () => {
    const videoId = course?.modules[activeModule]?.video?.id
    const courseId = id

    try {
      if (editingNoteId) {
        // Update existing note
        await makeApiCall(`/api/note/${editingNoteId}`, 'put', { noteText: currentNote });

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === editingNoteId ? { ...note, noteText: currentNote } : note
          )
        );
        setEditingNoteId(null);
      } else {
        // Create new note
        const newNote = await makeApiCall(`/api/note/`, 'post', { videoId, courseId, noteText: currentNote });
        setNotes((prevNotes) => [...prevNotes, newNote]);
      }
      setCurrentNote('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const editNote = (note) => {
    setCurrentNote(note.noteText);
    setEditingNoteId(note._id);
  };

  const deleteNote = async (noteId) => {
    console.log(noteId)
    try {
      await makeApiCall(`/api/note/${noteId}`, 'delete');
      setNotes((prevNotes) => [...prevNotes.filter((note) => note._id !== noteId)]);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleModuleChange = (index) => {
    setActiveModule(index);
    setIsResourcesOpen(false);
    setIsDownloadOptionsOpen(false);
  };

  const handleNextModule = () => {
    if (activeModule < course.modules.length - 1) {
      handleModuleChange(activeModule + 1);
    }
  };

  const handlePreviousModule = () => {
    if (activeModule > 0) {
      handleModuleChange(activeModule - 1);
    }
  };

  const toggleResources = () => {
    setIsResourcesOpen(!isResourcesOpen);
    if (isDownloadOptionsOpen) setIsDownloadOptionsOpen(false);
  };

  const toggleDownloadOptions = () => {
    setIsDownloadOptionsOpen(!isDownloadOptionsOpen);
    if (isResourcesOpen) setIsResourcesOpen(false);
  };

  const calculateProgress = () => {
    return ((activeModule + 1) / course.modules.length) * 100;
  };

  const handleDownload = async (resolution) => {
    try {
      const videoId = course?.modules[activeModule]?.video?.id;
      const videoName = course?.modules[activeModule]?.video?.title || "video";
      
      setIsDownloading(true);
      setDownloadingResolution(resolution);
      setDownloadProgress(0);

      // Use the modified makeApiCall which now returns the full response when responseType is 'blob'
      const response = await makeApiCall(`/api/video/${videoId}/download/${resolution}`, 'get', null, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(percentCompleted);
        }
      });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${videoName}_${resolution}.mp4`);
      document.body.appendChild(link);
      link.click();
      
      setIsDownloadOptionsOpen(false);
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsDownloading(false);
        setDownloadingResolution(null);
        setIsDownloadOptionsOpen(false);
      }, 100);
    } catch (error) {
      console.error("Error downloading video:", error);
      alert("Failed to download video");
      setIsDownloading(false);
      setDownloadingResolution(null);
    }
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
  

  return (
    <>
      <SideBar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.courseContainer}>
          <div className={styles.courseSidebar}>
            <div className={styles.courseInfo}>
              <h2>{course.title}</h2>
              <div className={styles.courseMetadata}>
                <span className={styles.metadataItem}>
                  <i className={styles.icon}>⏱️</i> {course.duration}
                </span>
                <span className={styles.metadataItem}>
                  <i className={styles.icon}>📊</i> {course.level}
                </span>
              </div>
              <div className={styles.progressContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${calculateProgress()}%` }}
                />
                <span className={styles.progressText}>
                  {activeModule + 1} / {course.modules.length} modules
                </span>
              </div>
            </div>
            <div className={styles.modulesList}>
              <h3>Modules</h3>
              <ul>
                {course.modules.map((module, index) => (
                  <li 
                    key={module._id.toString()}
                    className={`${styles.moduleItem} ${index === activeModule ? styles.activeModule : ''}`}
                    onClick={() => handleModuleChange(index)}
                  >
                    <div className={styles.moduleNumber}>{index + 1}</div>
                    <div className={styles.moduleDetails}>
                      <h4>{module.title}</h4>
                      <span className={styles.moduleDuration}>{module.duration}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.courseContent}>
            <div className={styles.contentHeader}>
              <h2>{currentModule.title}</h2>
              <div className={styles.moduleNavigation}>
                <button 
                  className={styles.navButton}
                  onClick={handlePreviousModule}
                  disabled={activeModule === 0}
                >
                  Previous
                </button>
                <button 
                  className={styles.navButton}
                  onClick={handleNextModule}
                  disabled={activeModule === course.modules.length - 1}
                >
                  Next
                </button>
              </div>
            </div>
            <div className={styles.videoContainer}>
              {currentModule.video && (
                <div className={styles.videoPlayer}>
                  <div className={styles.videoPlaceholder}>
                    {isLoading ? (
                      <p>Loading video...</p>
                    ) : (
                      <>
                        {currentPlayingVideo && (
                          <HLSPlayer 
                          src={currentPlayingVideo.masterPlaylist}
                          courseId={id}
                          videoId={course?.modules[activeModule]?.video?.id}
                          />
                        )}
                        {isDownloadOptionsOpen && (
                          <>
                            <div className={styles.overlay} onClick={toggleDownloadOptions} />
                            <div className={styles.downloadOptions}>
                              {isDownloading ? (
                                <div className={styles.downloadProgress}>
                                  <div className={styles.downloadProgressInfo}>
                                    <span>Downloading {downloadingResolution}</span>
                                    <span>{downloadProgress}%</span>
                                  </div>
                                  <div className={styles.downloadProgressBar}>
                                    <div 
                                      className={styles.downloadProgressFill} 
                                      style={{ width: `${downloadProgress}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => handleDownload('1080p')} className={styles.resolutionButton}>
                                    <span className={styles.resolutionLabel}>1080p</span>
                                    <span className={styles.resolutionDesc}>Full HD</span>
                                  </button>
                                  <button onClick={() => handleDownload('720p')} className={styles.resolutionButton}>
                                    <span className={styles.resolutionLabel}>720p</span>
                                    <span className={styles.resolutionDesc}>HD</span>
                                  </button>
                                  <button onClick={() => handleDownload('480p')} className={styles.resolutionButton}>
                                    <span className={styles.resolutionLabel}>480p</span>
                                    <span className={styles.resolutionDesc}>SD</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button 
              className={styles.downloadOptionButton}
              onClick={toggleDownloadOptions}
            >
              Download Video
            </button>
            <div className={styles.moduleDescription}>
              <h3>Description</h3>
              <p>{currentModule.description}</p>
            </div>
            <div className={styles.notesSection}>
              <h3>My Notes</h3>

              <textarea
                className={styles.notesTextarea}
                value={currentNote}
                onChange={handleNoteChange}
                placeholder="Add your notes here..."
                rows="4"
              />
              <div className={styles.notesActions}>
                <button className={styles.saveNotesButton} onClick={saveNotes}>
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
                {editingNoteId && (
                  <button 
                    className={styles.cancelButton} 
                    onClick={() => {
                      setEditingNoteId(null);
                      setCurrentNote('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className={styles.notesList}>
                {notes.length === 0 ? (
                  <div className={styles.emptyNotes}>
                    <p>No notes yet. Add your first note above!</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note._id} className={styles.noteItem}>
                      <div className={styles.noteContent}>
                        <p>{note.noteText}</p>
                        <span className={styles.noteTimestamp}>
                          {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className={styles.noteActions}>
                        <button 
                          className={styles.noteActionButton}
                          onClick={() => editNote(note)}
                          title="Edit note"
                        >
                          <span className={styles.noteActionIcon}>✏️</span>
                        </button>
                        <button 
                          className={styles.noteActionButton} 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this note?')) {
                              deleteNote(note._id);
                            }
                          }}
                          title="Delete note"
                        >
                          <span className={styles.noteActionIcon}>🗑️</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {currentModule.resources && currentModule.resources.length > 0 && (
              <div className={styles.resourcesSection}>
                <div 
                  className={styles.resourcesHeader} 
                  onClick={toggleResources}
                >
                  <h3>Resources ({currentModule.resources.length})</h3>
                  <span className={styles.toggleIcon}>
                    {isResourcesOpen ? '−' : '+'}
                  </span>
                </div>
                {isResourcesOpen && (
                  <ul className={styles.resourcesList}>
                    {currentModule.resources.map((resource) => (
                      <li key={resource._id.toString()} className={styles.resourceItem}>
                        <span className={styles.resourceIcon}>📄</span>
                        <span className={styles.resourceTitle}>{resource.title}</span>
                        <button className={styles.downloadButton}>View Page</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnViewer;