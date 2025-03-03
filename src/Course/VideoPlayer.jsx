import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Hls from "hls.js";
import SideBar from '../shared/Sidebar';

const VideoPlayer = () => {
  const { id, videoId } = useParams(); // id is the learning path ID, videoId is the current video ID
  const [currentVideo, setCurrentVideo] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [resources, setResources] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const token = localStorage.getItem('authToken'); // Get the auth token from localStorage
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/video/${videoId}`);
        if (!response.ok) {
          throw new Error("Video not found");
        }
        const data = await response.json();
        setCurrentVideo(data);
      } catch (error) {
        console.error('Error fetching video:', error);
        alert('Failed to load video. Please try again.');
      }
    };

    const fetchSubscription = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscriber/check`, {
          params: { courseId: id },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.isSubscribed) {
          setSubscription(response.data.subscription);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/${videoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    const fetchResource = async () => {
      try {
        const resourcesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/learning-paths/${id}/resources`
        );
        const resourcesData = await resourcesResponse.json();
        setResources(resourcesData);
      } catch(error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchResource();
    fetchVideo();
    fetchSubscription();
    fetchNotes();
  }, [videoId]);

  // Fetch the saved progress for the current video
  const fetchProgress = async () => {
    console.log("fething progress..")
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks/get-progress`, {
        params: { videoId, courseId: id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("fetch Progress response:", response)
      if (response.data.currentProgress && videoRef.current) {
        console.log("Resuming from:", response.data.currentProgress);
        videoRef.current.currentTime = response.data.currentProgress; // Set the video to the saved progress
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const updateProgress = async (watchedPercentage, completed) => {
    if (subscription) {
      const updatedProgress = subscription.progress.map(progress => {
        if (progress.videoId.toString() === videoId) {
          return { ...progress, watchedPercentage, completed };
        }
        return progress;
      });

      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/subscriber/update-progress`, {
          userId: subscription.userId,
          courseId: subscription.courseId,
          progress: updatedProgress,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const saveProgress = async () => {
    console.log("Video paused, saving progress..."); // Debug: Check if this logs
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const watchedPercentage = (currentTime / duration) * 100;
      const completed = watchedPercentage >= 90;
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tracks/save-progress`, {
          videoId,
          courseId: id,
          currentProgress: currentTime,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await updateProgress(watchedPercentage, completed);
        console.log("Progress saved:", currentTime);
        console.log("API Response:", response.data); // Debug: Check the API response
      } catch (error) {
        console.error('Error saving progress:', error);
        console.error('Error details:', error.response); // Debug: Check the error response
      }
    }
  };

  const handleSaveNote = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notes`,
        { userId: subscription.userId, videoId, noteText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes([...notes, response.data]);
      setNoteText("");
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleUpdateNote = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${editingNoteId}`,
        { noteText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotes(notes.map(note => (note._id === editingNoteId ? response.data : note)));
      setNoteText("");
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleResolutionChange = (resolution) => {
    setSelectedResolution(resolution);
    if (hlsRef.current) {
      const levels = hlsRef.current.levels; // Access levels from the HLS instance
      const levelIndex = levels.findIndex(level => level.height === parseInt(resolution));
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex; // Manually set the resolution
      }
    }
  };

  const downloadVideo = async (videoId, videoName, resolution) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/video/${videoId}/download/${resolution}`,
        {
          responseType: "blob", // Ensure the response is treated as a binary file
        }
      );
  
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${videoName}_${resolution}.mp4`); // Set the file name
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading video:", error);
      alert("Failed to download video");
    }
  };

  // Play the video when currentVideo is set
  useEffect(() => {
    if (currentVideo && videoRef.current) {
      playVideo(currentVideo);
    }
  }, [currentVideo]);

  // Play the video using HLS.js
  const playVideo = async (video) => {
    if (Hls.isSupported()) {
      const hls = new Hls({
        // debug: true,
        autoLevelEnabled: true,
      });
      hlsRef.current = hls;
      hls.loadSource(video.url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        await fetchProgress(); // Fetch progress after the video is ready
        videoRef.current.play().catch((e) => console.error("Playback failed:", e));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log("Switched to level:", data.level);
        if (selectedResolution) {
          const currentLevel = hls.levels[data.level];
          if (currentLevel.height !== parseInt(selectedResolution)) {
            // If the player switched to a different resolution due to network conditions,
            // update the selected resolution to reflect the current level.
            setSelectedResolution(currentLevel.height.toString());
          }
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Fallback for Safari
      videoRef.current.src = video.url;
      videoRef.current.play();
    }

    // Attach event listeners directly to the video element
    videoRef.current.onpause = saveProgress;
  };

  if (!currentVideo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>{currentVideo.title}</h1>
        </header>
        <main className="content">
          <div className="video-player">
            <video ref={videoRef} controls width="640" height="360"></video>
            <div className="resolution-selector">
              <label>Select Resolution:</label>
              <select
                value={selectedResolution || ""}
                onChange={(e) => handleResolutionChange(e.target.value)}
              >
                <option value="">Auto</option>
                <option value="480">480p</option>
                <option value="720">720p</option>
                <option value="1080">1080p</option>
              </select>
            </div>
          </div>
          <div className="download-buttons">
            <button onClick={() => downloadVideo(currentVideo._id, currentVideo.title, "1080p")}>Download 1080p</button>
            <button onClick={() => downloadVideo(currentVideo._id, currentVideo.title, "720p")}>Download 720p</button>
            <button onClick={() => downloadVideo(currentVideo._id, currentVideo.title, "480p")}>Download 480p</button>
          </div>
          <h3>Resources</h3>
            {resources.length === 0 ? (
              <p>No resources found.</p>
            ) : (
              <ul>
                {resources.map((resource) => (
                  <li key={resource._id}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {resource.title}
                    </a>
                    <p>{resource.description}</p>
                  </li>
                ))}
              </ul>
            )}
          <div className="notes-section">
            <h2>Notes</h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your notes here..."
            />
            {editingNoteId ? (
              <button onClick={handleUpdateNote}>Update Note</button>
            ) : (
              <button onClick={handleSaveNote}>Save Note</button>
            )}
            <ul>
              {notes.map((note) => (
                <li key={note._id}>
                  <p>{note.noteText}</p>
                  <button onClick={() => { setNoteText(note.noteText); setEditingNoteId(note._id); }}>Edit</button>
                  <button onClick={() => handleDeleteNote(note._id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoPlayer;