import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/Learn.module.css';

const LearnModal = ({ course, onClose, onSubscribe, isSubscribed }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/course/${course._id}`);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <div className={styles.modalImageContainer}>
            <img src={course.imageUrl} alt={course.title} className={styles.modalImage} />
          </div>
          <div className={styles.modalHeaderInfo}>
            <h2 className={styles.modalTitle}>{course.title}</h2>
            <p className={styles.modalDescription}>{course.description}</p>
            <div className={styles.modalMetadata}>
              <span className={styles.metadataItem}>
                <i className={styles.icon}>⏱️</i> {course.duration}
              </span>
              <span className={styles.metadataItem}>
                <i className={styles.icon}>🎯</i> {course.level}
              </span>
              <span className={styles.metadataItem}>
                <i className={styles.icon}>👥</i> {course.students} students
              </span>
            </div>
            <button 
              className={`${styles.subscribeButton} ${isSubscribed ? styles.unsubscribeButton : ''}`}
              onClick={onSubscribe}
            >
              {isSubscribed ? 'Unsubscribe' : 'Subscribe to Course'}
            </button>
            {isSubscribed && (
              <button 
                className={`${styles.viewButton}`}
                onClick={handleViewClick}
              >
                View
              </button>
            )}
          </div>
        </div>
        
        <div className={styles.modulesList}>
          <h3 className={styles.modulesTitle}>Course Modules</h3>
          {course.modules.map((module, index) => (
            <div key={module._id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <span className={styles.moduleNumber}>Module {index + 1}</span>
                <span className={styles.moduleDuration}>{module.duration}</span>
              </div>
              <h4 className={styles.moduleTitle}>{module.title}</h4>
              <p className={styles.moduleDescription}>{module.description}</p>
              
              <div className={styles.moduleContent}>
                <div className={styles.videoInfo}>
                  <i className={styles.icon}>🎬</i> {module.video.title}
                </div>
                
                {module.resources && module.resources.length > 0 && (
                  <div className={styles.resourcesList}>
                    <h5 className={styles.resourcesTitle}>Resources</h5>
                    <ul>
                      {module.resources.map(resource => (
                        <li key={resource._id} className={styles.resourceItem}>
                          <i className={styles.icon}>📄</i> {resource.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnModal;