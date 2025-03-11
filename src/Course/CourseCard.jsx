// CourseCard.jsx
import React from 'react';
import styles from './css/CourseManagement.module.css';

const CourseCard = ({ course, selectedCourse, handleSelectCourse, handleEditCourse, handleDeleteCourse }) => {
  return (
    <div 
      key={course._id} 
      className={`${styles.courseCard} ${selectedCourse?._id === course._id ? styles.courseCardSelected : ""}`}
      onClick={() => handleSelectCourse(course)}
    >
      <div className={styles.courseImageContainer}>
        <img src={course.imageUrl} alt={course.title} className={styles.courseImage} />
      </div>
      <div className={styles.courseContent}>
        <h3 className={styles.courseTitle}>{course.title}</h3>
        <div className={styles.courseInfo}>
          <span className={styles.courseInfoItem}>{course.level}</span>
          <span className={styles.courseInfoItem}>{course.duration}</span>
        </div>
        <p className={styles.courseDescription}>{course.description}</p>
        <div className={styles.courseActions}>
          <button 
            className={`${styles.actionButton} ${styles.editButton}`}
            onClick={(e) => {
              e.stopPropagation();
              handleEditCourse(course);
            }}
          >
            Edit
          </button>
          <button 
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCourse(course._id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;