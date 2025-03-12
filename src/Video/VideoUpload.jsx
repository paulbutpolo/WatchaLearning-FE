import React, { useState, useRef } from 'react';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header';
import makeApiCall from '../api/Api';
import styles from './css/VideoUpload.module.css'

const VideoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setUploadError('');
      } else {
        setUploadError('Please select a valid video file');
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setVisibility('public');
    setTags('');
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadError('Please select a video file to upload');
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
      setUploadSuccess(true);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <SideBar />
      <div className="main-content">
        <Header />
        <div className={styles["video-upload-container"]}>
          <h1>Upload Video</h1>
          <p className={styles["upload-description"]}>Wink wink ( ͡° ͜ʖ ͡°)</p>
          
          {uploadSuccess ? (
            <div className={styles["upload-success"]}>
              <div className={styles["success-icon"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2>Upload Complete!</h2>
              <p>Your video "{title}" has been successfully uploaded and processed.</p>
              <div className={styles["success-actions"]}>
                <button className={`${styles.btn} ${styles["btn-primary"]}`} onClick={() => window.location.href = '/videolist'}>
                  Go to Your Videos
                </button>
                <button className={`${styles.btn} ${styles["btn-secondary"]}`} onClick={() => {
                  resetForm();
                  setUploadSuccess(false);
                }}>
                  Upload Another Video
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles["upload-form"]}>
              <div className={styles["form-grid"]}>
                <div className={styles["form-left"]}>
                  <div 
                    className={`${styles["drop-area"]} ${selectedFile ? styles["has-file"] : ''}`}
                    onDragOver={handleDragOver} 
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {selectedFile ? (
                      <div className={styles["selected-file"]}>
                        <div className={styles["file-icon"]}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                          </svg>
                        </div>
                        <div className={styles["file-info"]}>
                          <span className={styles["file-name"]}>{selectedFile.name}</span>
                          <span className={styles["file-size"]}>{formatFileSize(selectedFile.size)}</span>
                        </div>
                        <button 
                          type="button" 
                          className={styles["change-file-btn"]}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current.click();
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={styles["upload-icon"]}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        </div>
                        <p className={styles["drop-text"]}>Drag and drop your video here or click to browse</p>
                        <p className={styles["file-types"]}>Supported formats: MP4, MOV, AVI, MKV</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="video/*" 
                      className={styles["file-input"]}
                    />
                  </div>
                  
                  {(isUploading) && (
                    <div className={styles["progress-container"]}>
                      {isUploading && (
                        <div className={styles["progress-section"]}>
                          <div className={styles["progress-header"]}>
                            <span>Uploading</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className={styles["progress-bar-bg"]}>
                            <div 
                              className={styles["progress-bar-fill"]} 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {uploadError && <div className={styles["error-message"]}>{uploadError}</div>}
                </div>
                
                {/* For now I am not including this to the form lets focus on other things*/}
                <div className={styles["form-right"]}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="title">Title *</label>
                    <input 
                      type="text" 
                      id="title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Add a title that describes your video"
                      disabled={isUploading}
                      required
                    />
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label htmlFor="description">Description</label>
                    <textarea 
                      id="description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell viewers about your video"
                      rows="4"
                      disabled={isUploading}
                    ></textarea>
                  </div>
                  
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="category">Category</label>
                      <select 
                        id="category" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isUploading}
                      >
                        <option value="">Select a category</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="education">Education</option>
                        <option value="gaming">Gaming</option>
                        <option value="music">Music</option>
                        <option value="tech">Technology</option>
                        <option value="sports">Sports</option>
                        <option value="travel">Travel</option>
                      </select>
                    </div>
                    
                    <div className={styles["form-group"]}>
                      <label htmlFor="visibility">Visibility</label>
                      <select 
                        id="visibility" 
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        disabled={isUploading}
                      >
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label htmlFor="tags">Tags</label>
                    <input 
                      type="text" 
                      id="tags" 
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Add tags separated by commas"
                      disabled={isUploading}
                    />
                    <small>Help viewers find your video with tags (separate with commas)</small>
                  </div>
                </div>
              </div>
              
              <div className={styles["form-actions"]}>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles["btn-secondary"]}`}
                  onClick={resetForm}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`${styles.btn} ${styles["btn-primary"]}`}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoUpload;