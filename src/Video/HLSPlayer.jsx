import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import styles from './css/HLSPlayer.module.css';
import makeApiCall from '../api/Api';

const getSavedProgress = async (courseId, videoId) => {
  const endpoint = `/api/tracks/get-progress?courseId=${courseId}&videoId=${videoId}`;
  try {
    const response = await makeApiCall(endpoint, 'get', {});

    if (response && response.currentProgress !== undefined) {
      return parseFloat(response.currentProgress);
    } else {
      return 0;
    }
  } catch (error) {
    console.error('Error fetching saved progress:', error);
    return 0;
  }
};

const saveProgress = (courseId, position, videoId) => {
  if (courseId) {
    const progress = {
      courseId: courseId,
      videoId: videoId,
      currentProgress: position
    }
    
    makeApiCall('/api/tracks/save-progress', 'post', progress)
  }
};

const savedCourseProgress = async (courseId, videoId, position, duration) => {
  const watchedPercentage = (position / duration) * 100;
  const completed = watchedPercentage >= 90;

  const updatedVideoProgress = {
    videoId,
    watchedPercentage,
    completed,
  };

  try {
    const currentSubscriber = await makeApiCall(`/api/subscriber/check?courseId=${courseId}`);
    const currentProgress = currentSubscriber.subscription.progress;

    const videoIndex = currentProgress.findIndex(item => item.videoId === videoId);

    if (videoIndex !== -1) {
      currentProgress[videoIndex] = updatedVideoProgress;
    } else {
      currentProgress.push(updatedVideoProgress);
    }


    const data = {
      courseId,
      progress: currentProgress,
    };

    makeApiCall(`/api/subscriber/update-progress`, 'put', data);
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

const HLSPlayer = ({ src, poster = '', className = '', muted = false, courseId, videoId }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const subtitleInputRef = useRef(null);

  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [customOffsetValue, setCustomOffsetValue] = useState('0.0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 for auto
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [hasSubtitles, setHasSubtitles] = useState(false);

  // Clean up HLS instance
  const cleanupHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  // Save progress when the user leaves the page or closes the browser
  const handleSaveProgress = () => {
    if (courseId && videoRef) {
      savedCourseProgress(courseId, videoId, videoRef.current.currentTime, videoRef.current.duration)
      saveProgress(courseId, videoRef.current.currentTime, videoId);
    }
  };

  // Initialize HLS player
  const initializeHls = async () => {
    if (!src || !videoRef.current) return;

    setLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      cleanupHls();

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        capLevelToPlayerSize: true,
        startLevel: -1, // Auto level selection
        abrEwmaDefaultEstimate: 1000000, // 1 Mbps initial estimate
        abrEwmaSlowVoD: 0.95,
        abrEwmaFastVoD: 0.9,
        abrBandWidthFactor: 0.7,
        abrBandWidthUpFactor: 0.7,
        fragLoadingTimeOut: 20000, // Increase timeout for slower connections
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 6,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      setupHlsEventListeners(hls);

      // Retrieve saved progress and seek to that position
      if (courseId) {
        const savedProgress = await getSavedProgress(courseId, videoId);
        videoRef.current.currentTime = savedProgress;
      }
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has native HLS support
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', async () => {
        videoRef.current.play().catch(err => console.error('Auto-play error:', err));
        setLoading(false);

        // Retrieve saved progress and seek to that position
        if (courseId) {
          const savedProgress = await getSavedProgress(courseId, videoId);
          videoRef.current.currentTime = savedProgress;
        }
      });
    } else {
      setError('HLS is not supported in this browser');
      setLoading(false);
    }

    // Save progress on pause
    videoRef.current.onpause = () => {
      handleSaveProgress();
    };

    // Check if video has subtitles
    videoRef.current.addEventListener('loadedmetadata', () => {
      if (videoRef.current.textTracks && videoRef.current.textTracks.length > 0) {
        setHasSubtitles(true);
      }
    });
  };

  // Set up event listeners for the HLS player
  const setupHlsEventListeners = (hls) => {
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const levels = hls.levels.map((level, index) => ({
        index,
        height: level.height,
        width: level.width,
        bitrate: level.bitrate,
        name: level.height ? `${level.height}p` : `Level ${index}`
      }));

      setAvailableLevels([
        { index: -1, name: 'Auto' },
        ...levels
      ]);

      setLoading(false);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      setCurrentQuality(data.level);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error:', data);
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('Fatal network error', data);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('Fatal media error', data);
            hls.recoverMediaError();
            break;
          default:
            console.error('Fatal HLS error', data);
            cleanupHls();
            initializeHls();
            break;
        }
      }
    });
  };

  // Set the quality level
  const setQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
  };

  // Show controls and set timeout to hide them
  const showControls = () => {
    setControlsVisible(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (!showSubtitleMenu) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  // Initialize HLS when source changes
  useEffect(() => {
    if (src) {
      initializeHls();
    }

    return cleanupHls;
  }, [src]);

  // Set up event listeners for showing/hiding controls
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleMouseMove = () => showControls();
      const handlePlay = () => showControls();
      const handlePause = () => showControls();

      videoElement.addEventListener('mousemove', handleMouseMove);
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);

      return () => {
        videoElement.removeEventListener('mousemove', handleMouseMove);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);

        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [showSubtitleMenu]);

  // Save progress when the user leaves the page or closes the browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleSaveProgress();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSaveProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId]);

  // Focus input field when subtitle menu opens
  useEffect(() => {
    if (showSubtitleMenu && subtitleInputRef.current) {
      subtitleInputRef.current.focus();
    }
  }, [showSubtitleMenu]);

  const adjustSubtitleOffset = (offset) => {
    const newOffset = subtitleOffset + offset;
    setSubtitleOffset(newOffset);
    setCustomOffsetValue(newOffset.toFixed(1));

    applySubtitleOffset(offset);
  };

  const applySubtitleOffset = (offsetChange) => {
    if (!videoRef.current) return;

    for (let i = 0; i < videoRef.current.textTracks.length; i++) {
      const track = videoRef.current.textTracks[i];
      if (track.kind === "subtitles") {
        for (let j = 0; j < track.cues.length; j++) {
          let cue = track.cues[j];
          cue.startTime += offsetChange;
          cue.endTime += offsetChange;
        }
      }
    }
  };

  const setCustomOffset = () => {
    try {
      const newOffsetValue = parseFloat(customOffsetValue);
      if (!isNaN(newOffsetValue)) {
        const offsetChange = newOffsetValue - subtitleOffset;
        setSubtitleOffset(newOffsetValue);
        applySubtitleOffset(offsetChange);
      }
    } catch (e) {
      console.error("Invalid subtitle offset value", e);
    }
  };

  const handleCustomOffsetChange = (e) => {
    setCustomOffsetValue(e.target.value);
  };

  const handleCustomOffsetKeyDown = (e) => {
    if (e.key === 'Enter') {
      setCustomOffset();
    }
  };

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setCustomOffsetValue(newValue.toFixed(1));
    const offsetChange = newValue - subtitleOffset;
    setSubtitleOffset(newValue);
    applySubtitleOffset(offsetChange);
  };

  const resetSubtitleOffset = () => {
    const offsetChange = -subtitleOffset;
    setSubtitleOffset(0);
    setCustomOffsetValue('0.0');
    applySubtitleOffset(offsetChange);
  };

  return (
    <div
      className={`${styles['hls-player-wrapper']} ${className}`}
      onMouseMove={showControls}
      onMouseEnter={showControls}
    >
      {loading && (
        <div className={styles["hls-player-loading"]}>
          <div className={styles["loading-spinner"]}></div>
        </div>
      )}

      {error && (
        <div className={styles["hls-player-error"]}>
          <p>{error}</p>
          <button onClick={initializeHls}>Retry</button>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        muted={muted}
        className={styles["hls-player-video"]}
      ></video>

      {availableLevels.length > 1 && (
        <>
          <div className={`${styles["hls-player-controls"]} ${controlsVisible ? styles["visible"] : styles["hidden"]}`}>
            <div className={styles["quality-selector"]}>
              <select
                value={currentQuality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
              >
                {availableLevels.map(level => (
                  <option key={level.index} value={level.index}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
            {hasSubtitles && (
              <button 
                className={styles["subtitle-button"]}
                onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
              >
                CC {subtitleOffset !== 0 ? `(${subtitleOffset > 0 ? '+' : ''}${subtitleOffset.toFixed(1)}s)` : ''}
              </button>
            )}
          </div>

          {hasSubtitles && showSubtitleMenu && (
            <div className={styles["subtitle-menu"]}>
              <div className={styles["subtitle-menu-header"]}>
                <h3>Subtitle Synchronization</h3>
                <button 
                  className={styles["close-button"]}
                  onClick={() => setShowSubtitleMenu(false)}
                >
                  ×
                </button>
              </div>
              
              <div className={styles["subtitle-offset-display"]}>
                Current Offset: <span>{subtitleOffset > 0 ? '+' : ''}{subtitleOffset.toFixed(1)}s</span>
              </div>
              
              <div className={styles["subtitle-slider-container"]}>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={subtitleOffset}
                  onChange={handleSliderChange}
                  className={styles["subtitle-slider"]}
                />
                <div className={styles["slider-labels"]}>
                  <span>-10s</span>
                  <span>0s</span>
                  <span>+10s</span>
                </div>
              </div>
              
              <div className={styles["subtitle-input-group"]}>
                <input
                  ref={subtitleInputRef}
                  type="text"
                  value={customOffsetValue}
                  onChange={handleCustomOffsetChange}
                  onKeyDown={handleCustomOffsetKeyDown}
                  className={styles["subtitle-offset-input"]}
                />
                <span className={styles["input-suffix"]}>s</span>
                <button 
                  onClick={setCustomOffset}
                  className={styles["apply-button"]}
                >
                  Apply
                </button>
              </div>
              
              <div className={styles["subtitle-preset-buttons"]}>
                <button onClick={() => adjustSubtitleOffset(-1.0)}>-1s</button>
                <button onClick={() => adjustSubtitleOffset(-0.5)}>-0.5s</button>
                <button onClick={resetSubtitleOffset}>Reset</button>
                <button onClick={() => adjustSubtitleOffset(0.5)}>+0.5s</button>
                <button onClick={() => adjustSubtitleOffset(1.0)}>+1s</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HLSPlayer;