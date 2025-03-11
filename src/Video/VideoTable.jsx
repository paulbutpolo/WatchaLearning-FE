import React, { useState } from 'react';
import styles from './css/VideoTable.module.css';
import VideoDetailsModal from './VideoDetailsModal'
import ConfirmationModal from '../shared/ConfirmationModal';

const SkeletonRow = () => {
  return (
    <tr className={styles.skeletonRow}>
      {[...Array(7)].map((_, i) => (
        <td key={i-1} className={styles.skeletonCell}>
          <div className={styles.skeletonBox}></div>
        </td>
      ))}
    </tr>
  );
};

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

const VideoTable = ({ videos, loading, lastRowRef, handleDelete }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const handleRowClick = (video) => {
    setSelectedVideo(video);
  };

  const handleDeleteClick = (videoId) => {
    setVideoToDelete(videoId);
  };

  const confirmDelete = () => {
    handleDelete(videoToDelete); // I WILL WRITE IT HERE JUST IN CASE I FORGOT. ONCE COMPLETED MAKE SURE TO DELETE THE REST OF DOCUMENTS LINKED IN THIS
    setVideoToDelete(null);
  };

  const cancelDelete = () => {
    setVideoToDelete(null);
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.videoTable}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Type</th>
            <th>Size</th>
            <th>Upload</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.length === 0 && loading
            ? Array(16).fill().map((_, index) => <SkeletonRow key={index} />)
            : videos.map((video, index) => (
              <tr key={video.id} ref={index === videos.length - 1 ? lastRowRef : null} 
                onClick={() => handleRowClick(video)} className={styles.clickableRow}>
                <td>{video.originalName}</td>
                <td>
                  <span className={`${styles.status} ${styles[video.status]}`}>
                    {video.status}
                    {video.status === "transcoding" && video.transcodingProgress !== undefined && (
                      <>({video.transcodingProgress}%)</>
                    )}
                  </span>

                  {video.status === "transcoding" && (
                    <div className={styles.progressContainer}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${video.transcodingProgress}%` }}
                      ></div>
                      <span>{video.transcodingProgress}%</span>
                    </div>
                  )}
                </td>
                <td>{video.type}</td>
                <td>{formatFileSize(video.size)}</td>
                <td title={formatDate(video.uploadDate)}>
                  {new Date(video.uploadDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td title={formatDate(video.completedDate)}>
                  {new Date(video.completedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td>
                  <button 
                    className={styles.btnDelete} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(video.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
          ))}
          {loading && Array(1).fill().map((_, index) => <SkeletonRow key={`additional-skeleton-${index}`} />)}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={videoToDelete !== null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Are you sure you want to delete this video?"
      />

      {/* Video Details Modal */}
      {selectedVideo && (
        <VideoDetailsModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
};

export default VideoTable;