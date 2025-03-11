// CourseDetails.jsx
import React from 'react';
import styles from './css/CourseManagement.module.css';

const CourseDetails = ({ selectedCourse, handleEditCourse, handleDeleteCourse }) => {
  return (
    <div className={styles.detailsSection}>
      <div className={styles.detailsHeader}>
        <h2 className={styles.detailsTitle}>{selectedCourse.title}</h2>
        <div className={styles.detailsButtonGroup}>
          <button 
            className={`${styles.detailsButton} ${styles.editCourseButton}`}
            onClick={() => handleEditCourse(selectedCourse)}
          >
            Edit Course
          </button>
          <button 
            className={`${styles.detailsButton} ${styles.deleteCourseButton}`}
            onClick={() => handleDeleteCourse(selectedCourse._id)}
          >
            Delete Course
          </button>
        </div>
      </div>

      <div className={styles.detailsInfo}>
        <div className={styles.detailsInfoItem}>
          <div className={styles.detailsInfoTitle}>Duration</div>
          <div className={styles.detailsInfoValue}>{selectedCourse.duration}</div>
        </div>
        <div className={styles.detailsInfoItem}>
          <div className={styles.detailsInfoTitle}>Level</div>
          <div className={styles.detailsInfoValue}>{selectedCourse.level}</div>
        </div>
        <div className={styles.detailsInfoItem}>
          <div className={styles.detailsInfoTitle}>Enrolled Students</div>
          <div className={styles.detailsInfoValue}>{selectedCourse.students}</div>
        </div>
      </div>

      <div className={styles.detailsDescription}>
        {selectedCourse.description}
      </div>

      <div className={styles.modulesSection}>
        <h3 className={styles.modulesHeader}>Course Modules</h3>
        <div className={styles.modulesList}>
          {selectedCourse.modules.map((module) => (
            <div key={module._id} className={styles.moduleItem}>
              <div className={styles.moduleTitle}>
                {module.title}
                <span className={styles.moduleDuration}>{module.duration}</span>
              </div>
              <div className={styles.moduleDescription}>
                {module.description}
              </div>
              {module.video && (
                <div className={styles.moduleVideo}>
                  <h4>Video:</h4>
                  {module.video.title}
                </div>
              )}
              {module.resources?.length > 0 && (
                <div className={styles.moduleResources}>
                  <h4>Resources:</h4>
                  <ul className={styles.moduleResourcesList}>
                    {module.resources.map((resource, index) => (
                      <li key={index}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {selectedCourse.modules.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateText}>No modules available for this course</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;