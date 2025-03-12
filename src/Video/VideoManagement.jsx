import React, { useEffect, useState, useRef, useCallback }  from 'react';
import VideoTable from './VideoTable';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header';
import makeApiCall from '../api/Api';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const uploadDate = useRef(null);
  const observer = useRef(null);
  const firstRender = useRef(true);

  const fetchVideos = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 250)); // Simulation for the skeleton
  
      const res = await makeApiCall(`/api/videos?limit=10&lastCreatedAt=${uploadDate.current || ""}`, 'get');
      const newVideos = await res;
      setVideos((prev) => {
        const prevVideosMap = new Map(prev.map(video => [video.id, video]));
        const updated = newVideos.map(newVideo => {
          const existingVideo = prevVideosMap.get(newVideo.id);
          
          if (existingVideo) {
            return { ...existingVideo, ...newVideo };
          }

          return newVideo;
        });
        
        const updatedIds = new Set(updated.map(video => video.id));
        const unchangedVideos = prev.filter(video => !updatedIds.has(video.id));
        
        return [...unchangedVideos, ...updated];
      });
  
      if (newVideos.length < 10) {
        setHasMore(false);
      } else {
        uploadDate.current = newVideos[newVideos.length - 1].createdAt;
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (firstRender.current) {
        firstRender.current = false;
        return;
    }

    fetchVideos();

    const intervalId = setInterval(() => {
      fetchVideos();
    }, 5000);
    return () => clearInterval(intervalId)
  }, []);

  const lastRowRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
            fetchVideos();
        }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchVideos]);  

  const handleDelete = async (id) => {
    try {
      await makeApiCall(`/api/videos/${id}`, 'delete');
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete video: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <>
      <SideBar />
      <div className = "main-content">
        {/* Static Header for now  */}
        <Header />
        {/* This is where the content*/}
        <VideoTable videos={videos} loading={loading} lastRowRef={lastRowRef} handleDelete={handleDelete}/>
      </div>
    </>
  )
}

export default VideoManagement