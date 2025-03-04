import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";

function Videos() {
  const [videoFile, setVideoFile] = useState(null);
  const [subtitleFile, setSubtitleFile] = useState(null); // For uploading subtitles
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [videos, setVideos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcodingProgress, setTranscodingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);
  const [description, setDescription] = useState(''); // State for the video title
  const videoRef = useRef(null);

  const token = localStorage.getItem('authToken');

  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 5;

  // Get paginated videos
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const nextPage = () => {playVideo
    if (indexOfLastVideo < videos.length) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos`);
    setVideos(res.data);
  };

  const uploadVideo = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
  
    setIsUploading(true);
    setUploadProgress(0);
    setTranscodingProgress(0);
  
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("description", description);
  
    try {
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}`},
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        timeout: 1800000, // 30-minute timeout
      });
  
      // Use the original filename for progress tracking
      const { originalFilename } = uploadRes.data;
  
      if (originalFilename) {
        const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/api/videos/progress/${encodeURIComponent(originalFilename)}`);
  
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setTranscodingProgress(data.progress);
          if (data.progress >= 100) {
            setTimeout(() => {
              eventSource.close();
              setIsUploading(false);
              fetchVideos(); // Refresh video list
              alert("Video upload and transcoding completed successfully!");
            }, 1000); // Add a 1-second delay to ensure the state updates
          }
        };
  
        eventSource.onerror = () => {
          // console.error("EventSource failed, Usually this triggered at end of force update in back end");
          eventSource.close();
          setIsUploading(false);
        };
  
        // Clean up EventSource on component unmount
        return () => {
          eventSource.close();
        };
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const uploadSubtitle = async (videoId) => {
    if (!subtitleFile) return;
  
    const formData = new FormData();
    formData.append("subtitle", subtitleFile);
    formData.append("language", selectedLanguage); // Send language to server
  
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/video/${videoId}/subtitles`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      alert("Subtitle uploaded successfully");
      fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error("Error uploading subtitle:", error);
      alert("Failed to upload subtitle");
    }
  };

  const deleteVideo = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/video/${id}`);
      alert("Video deleted successfully");
      fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  const playVideo = async (video) => {
    setCurrentPlayingVideo(video);
    // const savedProgress = await getProgress(video._id);

    if (Hls.isSupported()) {
      const hls = new Hls({
        // debug: true, // Enable debug mode for troubleshooting
      });
      window.currentHls = hls;
      // setCurrentPlayingVideo(video);
      hls.loadSource(video.url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Manifest parsed, starting playback");
        // videoRef.current.currentTime = savedProgress; // Set saved progress
        // videoRef.current.play().catch((e) => console.error("Playback failed:", e));
      });
  
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
        console.log("Subtitle tracks updated:", data.subtitleTracks);
        if (data.subtitleTracks.length > 0) {
          hls.subtitleTrack = 0;
        }
      });
  
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Fatal network error encountered, trying to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Fatal media error encountered, trying to recover");
              hls.recoverMediaError();
              break;
            default:
              console.log("Unrecoverable error");
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = video.url;
      // videoRef.current.currentTime = savedProgress;
    }
  
    // videoRef.current.onpause = () => {
    //   saveProgress(video._id, videoRef.current.currentTime);
    // };
  };

  const adjustSubtitleSync = async (videoId, videoName, language, offset) => {
    try {
      const currentTime = videoRef.current.currentTime; // Save current playback position
  
      await axios.post(`${import.meta.env.VITE_API_URL}/api/video/${videoName}/adjust-subtitle`, {
        language,
        timeOffset: offset
      });
  
      alert(`Subtitle timing adjusted by ${offset/1000} seconds`);
  
      // Reload the video if it's currently playing
      if (currentPlayingVideo && currentPlayingVideo._id === videoId) {
        playVideo(currentPlayingVideo);
        videoRef.current.currentTime = currentTime; // Restore playback position
      }
  
      fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error("Error adjusting subtitle:", error);
      alert("Failed to adjust subtitle timing");
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

  // const saveProgress = async (videoId, currentTime) => {
  //   try {
  //     await axios.post(`${import.meta.env.VITE_API_URL}/api/tracks/save-progress", {
  //       videoId,
  //       currentProgress: currentTime,
  //     }, 
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });
  //     console.log("Progress saved");
  //   } catch (error) {
  //     console.error("Error saving progress:", error);
  //   }
  // };
  
  // const getProgress = async (videoId) => {
  //   try {
  //     const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks/get-progress", {
  //       params: { videoId },
  //     },{
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });
  //     return res.data.currentProgress || 0;
  //   } catch (error) {
  //     console.error("Error fetching progress:", error);
  //     return 0;
  //   }
  // };
  
  return (
    <div style={{ padding: 20 }}>
      <h2>HLS Video Streaming</h2>
      <form onSubmit={uploadVideo}>
        <div>
          <label>Description:</label>
          <textarea
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Select Video File:</label>
          <input type="file" accept="video/mkv/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        </div>
        <button disabled={isUploading}>{isUploading ? "Uploading..." : "Upload Video"}</button>
      </form>

      {isUploading && (
        <div style={{ marginTop: 10 }}>
          <p>Upload Progress:</p>
          <progress value={uploadProgress} max="100" />
          <span>{uploadProgress}%</span>

          <p>Transcoding Progress:</p>
          <progress value={transcodingProgress} max="100" />
          <span>{transcodingProgress}%</span>

          {transcodingProgress >= 100 && (
            <p style={{ color: "green" }}>Transcoding completed successfully!</p>
          )}
        </div>
      )}

      <h3>Available Videos:</h3>
      <ul className="video-list">
        {currentVideos.map((video, index) => (
          <li key={index} className="video-item">
            <div className="video-info">
              <strong>{video.title}</strong>
              <div className="video-actions">
                <button onClick={() => playVideo(video)}>▶ Play</button>
                <button className="delete-btn" onClick={() => deleteVideo(video._id)}>🗑 Delete</button>
              </div>
            </div>
            <div className="download-buttons">
              <button onClick={() => downloadVideo(video._id, video.title, "1080p")}>Download 1080p</button>
              <button onClick={() => downloadVideo(video._id, video.title, "720p")}>Download 720p</button>
              <button onClick={() => downloadVideo(video._id, video.title, "480p")}>Download 480p</button>
            </div>
            <div>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                {/* Add more languages as needed */}
              </select>
              <input
                type="file"
                accept=".vtt"
                onChange={(e) => setSubtitleFile(e.target.files[0])}
              />
              <button onClick={() => uploadSubtitle(video._id)}>
                Upload Subtitle
              </button>
            </div>
            {video.subtitles && video.subtitles.length > 0 && (
              <div>
                <p>Available Subtitles:</p>
                <ul>
                  {video.subtitles.map((sub, i) => (
                    <li key={i}>
                      {sub.language}
                      <div>
                        <button onClick={() => adjustSubtitleSync(video._id, video.title, sub.language, -500)}>-0.5s</button>
                        <button onClick={() => adjustSubtitleSync(video._id, video.title, sub.language, -100)}>-0.1s</button>
                        <button onClick={() => adjustSubtitleSync(video._id, video.title, sub.language, 100)}>+0.1s</button>
                        <button onClick={() => adjustSubtitleSync(video._id, video.title, sub.language, 500)}>+0.5s</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span> Page {currentPage} of {Math.ceil(videos.length / videosPerPage)} </span>
        <button onClick={nextPage} disabled={indexOfLastVideo >= videos.length}>Next</button>
      </div>

      <h3>Video Player:</h3>
      <video ref={videoRef} controls width="640" height="360"></video>
    </div>
  );
}

export default Videos;