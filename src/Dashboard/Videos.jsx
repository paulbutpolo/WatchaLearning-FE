import { useState, useEffect, useRef } from "react";
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
  const videoRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await axios.get("http://localhost:3000/api/videos");
    setVideos(res.data);
  };

  // const uploadVideo = async () => {
  //   if (!videoFile) return;
  
  //   setIsUploading(true);
  //   setUploadProgress(0);
  //   setTranscodingProgress(0);
  
  //   const formData = new FormData();
  //   formData.append("video", videoFile);
  
  //   try {
  //     const uploadRes = await axios.post("http://localhost:3000/api/videos/upload", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //       onUploadProgress: (progressEvent) => {
  //         const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //         setUploadProgress(percentCompleted);
  //       },
  //       timeout: 1800000, // 30-minute timeout
  //     });
  
  //     // Use the original filename for progress tracking
  //     const { originalFilename } = uploadRes.data;
  
  //     if (originalFilename) {
  //       const eventSource = new EventSource(`http://localhost:3000/api/videos/progress/${encodeURIComponent(originalFilename)}`);
  
  //       eventSource.onmessage = (event) => {
  //         const data = JSON.parse(event.data);
  //         setTranscodingProgress(data.progress);
  
  //         // Close EventSource when transcoding is complete
  //         if (data.progress >= 100) {
  //           eventSource.close();
  //           setIsUploading(false);
  //           fetchVideos(); // Refresh video list
  //         }
  //       };
  
  //       eventSource.onerror = () => {
  //         console.error("EventSource failed");
  //         eventSource.close();
  //         setIsUploading(false);
  //       };
  
  //       // Clean up EventSource on component unmount
  //       return () => {
  //         eventSource.close();
  //       };
  //     }
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     alert("Upload failed. Please try again.");
  //     setIsUploading(false);
  //   }
  // };

  const uploadVideo = async () => {
    if (!videoFile) return;
  
    setIsUploading(true);
    setUploadProgress(0);
    setTranscodingProgress(0);
  
    const formData = new FormData();
    formData.append("video", videoFile);
  
    try {
      const uploadRes = await axios.post("http://localhost:3000/api/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        timeout: 1800000, // 30-minute timeout
      });
  
      // Use the original filename for progress tracking
      const { originalFilename } = uploadRes.data;
  
      if (originalFilename) {
        const eventSource = new EventSource(`http://localhost:3000/api/videos/progress/${encodeURIComponent(originalFilename)}`);
  
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setTranscodingProgress(data.progress);
          console.log(`${data.progress}%`)
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
      const res = await axios.post(`http://localhost:3000/api/video/${videoId}/subtitles`, formData, {
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
      await axios.delete(`http://localhost:3000/api/video/${id}`);
      alert("Video deleted successfully");
      fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  const playVideo = async (video) => {
    setCurrentPlayingVideo(video);
    const savedProgress = await getProgress(video._id);

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: true, // Enable debug mode for troubleshooting
      });
      window.currentHls = hls;
       setCurrentPlayingVideo(video);
      hls.loadSource(video.url);
      hls.attachMedia(videoRef.current);
  
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Manifest parsed, starting playback");
        videoRef.current.currentTime = savedProgress; // Set saved progress
        videoRef.current.play().catch((e) => console.error("Playback failed:", e));
      });
  
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
        console.log("Subtitle tracks updated:", data.subtitleTracks);
        if (data.subtitleTracks.length > 0) {
          // Automatically enable the first subtitle track
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
              // Cannot recover
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Fallback for Safari
      videoRef.current.src = video.url;
      videoRef.current.currentTime = savedProgress; // Set saved progress
    }

    videoRef.current.onpause = () => {
      saveProgress(video._id, videoRef.current.currentTime);
    };
  };

  const adjustSubtitleSync = async (videoId, language, offset) => {
    try {
      const currentTime = videoRef.current.currentTime; // Save current playback position
  
      await axios.post(`http://localhost:3000/api/video/${videoId}/adjust-subtitle`, {
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
        `http://localhost:3000/api/video/${videoId}/download/${resolution}`,
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

  const saveProgress = async (videoId, currentTime) => {
    try {
      await axios.post("http://localhost:3000/api/tracks/save-progress", {
        videoId,
        currentProgress: currentTime,
      });
      console.log("Progress saved");
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };
  
  const getProgress = async (videoId) => {
    try {
      const res = await axios.get("http://localhost:3000/api/tracks/get-progress", {
        params: { videoId },
      });
      return res.data.currentProgress || 0;
    } catch (error) {
      console.error("Error fetching progress:", error);
      return 0;
    }
  };
  
  return (
    <div style={{ padding: 20 }}>
      <h2>HLS Video Streaming</h2>

      <input type="file" accept="video/mkv/*" onChange={(e) => setVideoFile(e.target.files[0])} />
      <button onClick={uploadVideo} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Video"}
      </button>

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
      <ul>
        {videos.map((video, index) => (
          <li key={index}>
            {video.title} - <button onClick={() => playVideo(video)}>Play</button>
            <button onClick={() => deleteVideo(video._id)}>Delete</button>
            <div>
              <button onClick={() => downloadVideo(video._id, video.name, "1080p")}>Download 1080p</button>
              <button onClick={() => downloadVideo(video._id, video.name, "720p")}>Download 720p</button>
              <button onClick={() => downloadVideo(video._id, video.name, "480p")}>Download 480p</button>
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
                        <button onClick={() => adjustSubtitleSync(video._id, sub.language, -500)}>-0.5s</button>
                        <button onClick={() => adjustSubtitleSync(video._id, sub.language, -100)}>-0.1s</button>
                        <button onClick={() => adjustSubtitleSync(video._id, sub.language, 100)}>+0.1s</button>
                        <button onClick={() => adjustSubtitleSync(video._id, sub.language, 500)}>+0.5s</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      <h3>Video Player:</h3>
      <video ref={videoRef} controls width="640" height="360"></video>
    </div>
  );
}

export default Videos;