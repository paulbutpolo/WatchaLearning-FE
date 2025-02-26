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
  const [editingNoteId, setEditingNoteId] = useState(null);
  const videoRef = useRef(null);

  const token = localStorage.getItem('authToken'); // Get the auth token from localStorage
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/video/${videoId}`);
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
        const response = await axios.get("http://localhost:3000/api/subscriber/check", {
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
        const response = await axios.get(`http://localhost:3000/api/notes/${videoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchVideo();
    fetchSubscription();
    fetchNotes();
  }, [videoId]);

  // Fetch the saved progress for the current video
  const fetchProgress = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/tracks/get-progress", {
        params: { videoId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        await axios.put(`http://localhost:3000/api/subscriber/update-progress`, {
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
        const response = await axios.post("http://localhost:3000/api/tracks/save-progress", {
          videoId,
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
        "http://localhost:3000/api/notes",
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
        `http://localhost:3000/api/notes/${editingNoteId}`,
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
      await axios.delete(`http://localhost:3000/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
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
        debug: true,
      });
      hls.loadSource(video.url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        await fetchProgress(); // Fetch progress after the video is ready
        videoRef.current.play().catch((e) => console.error("Playback failed:", e));
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
          </div>
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