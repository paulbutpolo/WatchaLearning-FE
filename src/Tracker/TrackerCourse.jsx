import React, { useState, useEffect } from 'react';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header';
import makeApiCall from '../api/Api';
import styles from './css/TrackerCourse.module.css';

const TrackerCourse = () => {
  // const [progressData, setProgressData] = useState([
  //   {
  //     _id: '67d04cc7370917e11f216110',
  //     userId: '67c6fd6981c9fe3ce435dbd5',
  //     courseId: '67cee22f53ba822215d76be4',
  //     progress: [
  //       {
  //         videoId: '67cfd306d33ae440f6773415',
  //         watchedPercentage: 52.41,
  //         completed: false
  //       },
  //       {
  //         videoId: '67cb4bdc182171adcca0f9ac',
  //         watchedPercentage: 53.85,
  //         completed: false
  //       },
  //       {
  //         videoId: '67cb3cbf918b26c9dd6351af',
  //         watchedPercentage: 24.83,
  //         completed: false
  //       }
  //     ],
  //     courseCompleted: false,
  //     lastActive: '2025-03-11T15:19:09.629Z'
  //   },
  //   {
  //     _id: '67d04cc7370917e11f216111',
  //     userId: '67c6fd6981c9fe3ce435dbd6',
  //     courseId: '67cee22f53ba822215d76be4',
  //     progress: [
  //       {
  //         videoId: '67cfd306d33ae440f6773415',
  //         watchedPercentage: 100,
  //         completed: true
  //       },
  //       {
  //         videoId: '67cb4bdc182171adcca0f9ac',
  //         watchedPercentage: 85.2,
  //         completed: false
  //       },
  //       {
  //         videoId: '67cb3cbf918b26c9dd6351af',
  //         watchedPercentage: 0,
  //         completed: false
  //       }
  //     ],
  //     courseCompleted: false,
  //     lastActive: '2025-03-10T11:24:32.123Z'
  //   },
  //   {
  //     _id: '67d04cc7370917e11f216112',
  //     userId: '67c6fd6981c9fe3ce435dbd5',
  //     courseId: '67cee22f53ba822215d76be5',
  //     progress: [
  //       {
  //         videoId: '67cfd306d33ae440f6773416',
  //         watchedPercentage: 100,
  //         completed: true
  //       },
  //       {
  //         videoId: '67cb4bdc182171adcca0f9ad',
  //         watchedPercentage: 100,
  //         completed: true
  //       },
  //       {
  //         videoId: '67cb3cbf918b26c9dd6351b0',
  //         watchedPercentage: 67.52,
  //         completed: false
  //       }
  //     ],
  //     courseCompleted: false,
  //     lastActive: '2025-03-09T09:15:43.872Z'
  //   }
  // ]);

  // // Video details mapping - in a real app, fetch this from an API
  // const videoDetails = {
  //   '67cfd306d33ae440f6773415': { title: 'Introduction to React', duration: '10:30' },
  //   '67cb4bdc182171adcca0f9ac': { title: 'Components and Props', duration: '15:45' },
  //   '67cb3cbf918b26c9dd6351af': { title: 'State and Lifecycle', duration: '20:15' },
  //   '67cfd306d33ae440f6773416': { title: 'JavaScript Closures', duration: '12:20' },
  //   '67cb4bdc182171adcca0f9ad': { title: 'Promises and Async/Await', duration: '18:30' },
  //   '67cb3cbf918b26c9dd6351b0': { title: 'Advanced ES6 Features', duration: '22:45' }
  // };

  const [progressData, setProgressData] = useState([]);
  const [videoDetails, setVideoDetails] = useState({});

  useEffect(() => {
    fetchAllProgress();
  }, [])

  const fetchAllProgress = async() => {
    const res = await makeApiCall(`/api/subscriber/progress`);
    setProgressData(res)
  }
  
  // State for filters
  const [filters, setFilters] = useState({
    user: 'all',
    course: 'all',
    sortBy: 'lastActive'
  });

  // Get unique users and courses for filter dropdowns
  const uniqueUsers = [...new Set(progressData.map(item => item.userId))];
  const uniqueCourses = [...new Set(progressData.map(item => item.courseId))];
  
  // Map of user IDs to names
  const userMap = progressData.reduce((acc, item) => {
    acc[item.userId] = item.userId;
    return acc;
  }, {});
  
  // Map of course IDs to names
  const courseMap = progressData.reduce((acc, item) => {
    acc[item.courseId] = item.courseId;
    return acc;
  }, {});

  // Filter and sort the data
  const filteredData = progressData.filter(item => {
    if (filters.user !== 'all' && item.userId !== filters.user) return false;
    if (filters.course !== 'all' && item.courseId !== filters.course) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'lastActive') {
      return new Date(b.lastActive) - new Date(a.lastActive);
    } else if (filters.sortBy === 'progress') {
      const aProgress = a.progress.reduce((sum, p) => sum + p.watchedPercentage, 0) / a.progress.length;
      const bProgress = b.progress.reduce((sum, p) => sum + p.watchedPercentage, 0) / b.progress.length;
      return bProgress - aProgress;
    }
    return 0;
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <>
      <SideBar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.dashboardContainer}>
          <div className={styles.dashboardHeader}>
            <div className={styles.filterControls}>
              <div className={styles.filterGroup}>
                <label htmlFor="user">User:</label>
                <select 
                  name="user"
                  id="user"
                  value={filters.user}
                  onChange={handleFilterChange}
                  className={styles.selectInput}
                >
                  <option value="all">All Users</option>
                  {uniqueUsers.map(userId => (
                    <option key={userId} value={userId}>
                      {userMap[userId]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="course">Course:</label>
                <select 
                  name="course"
                  id="course"
                  value={filters.course}
                  onChange={handleFilterChange}
                  className={styles.selectInput}
                >
                  <option value="all">All Courses</option>
                  {uniqueCourses.map(courseId => (
                    <option key={courseId} value={courseId}>
                      {courseMap[courseId]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="sortBy">Sort By:</label>
                <select 
                  name="sortBy"
                  id="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className={styles.selectInput}
                >
                  <option value="lastActive">Last Active</option>
                  <option value="progress">Progress</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className={styles.progressCards}>
            {filteredData.length === 0 ? (
              <div className={styles.noData}>No progress data found for the selected filters.</div>
            ) : (
              filteredData.map((item) => {
                // Calculate overall progress for this course
                const overallProgress = item.progress.reduce(
                  (sum, curr) => sum + curr.watchedPercentage, 0
                ) / item.progress.length;
                
                // Count completed videos
                const completedVideos = item.progress.filter(p => p.completed).length;
                
                return (
                  <div key={item._id} className={styles.progressCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.courseInfo}>
                        <h2>{item.courseId}</h2>
                        <span className={styles.userName}>{item.userId}</span>
                      </div>
                      <div className={styles.lastActive}>
                        Last active: {new Date(item.lastActive).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className={styles.overallStats}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Overall Progress:</span>
                        <span className={styles.statValue}>{overallProgress.toFixed(1)}%</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Completed:</span>
                        <span className={styles.statValue}>{completedVideos} of {item.progress.length} videos</span>
                      </div>
                    </div>
                    
                    <div className={styles.overallProgressBar}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                    
                    <div className={styles.videoProgress}>
                      <h3>Video Progress</h3>
                      <div className={styles.videoList}>
                        {item.progress.map((videoProgress) => {
                          const video = videoDetails[videoProgress.videoId] || 
                                      { title: 'Unknown Video', duration: '?' };
                          
                          return (
                            <div key={videoProgress.videoId} className={styles.videoItem}>
                              <div className={styles.videoInfo}>
                                <h4>{video.title}</h4>
                                <span className={styles.duration}>{video.duration}</span>
                              </div>
                              <div className={styles.videoProgressDetails}>
                                <div className={styles.progressBarContainer}>
                                  <div 
                                    className={styles.progressBarFill} 
                                    style={{ 
                                      width: `${videoProgress.watchedPercentage}%`,
                                      backgroundColor: videoProgress.completed ? 'var(--success)' : 'var(--primary)'
                                    }}
                                  ></div>
                                </div>
                                <span className={styles.progressPercentage}>
                                  {Math.round(videoProgress.watchedPercentage)}%
                                </span>
                                <span className={styles.status}>
                                  {videoProgress.completed ? 
                                    <span className={styles.completed}>Completed</span> : 
                                    <span className={styles.inProgress}>In Progress</span>
                                  }
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default TrackerCourse