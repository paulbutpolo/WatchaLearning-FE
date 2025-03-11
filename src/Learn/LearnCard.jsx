import React from 'react';
import styles from './css/Learn.module.css';

const LearnCard = ({ course, onClick }) => {
  return (
    <div className={styles.courseCard} onClick={onClick}>
      <div className={styles.courseImageContainer}>
        <img src={course.imageUrl} alt={course.title} className={styles.courseImage} />
        <span className={styles.courseLevel}>{course.level}</span>
      </div>
      <div className={styles.courseContent}>
        <h2 className={styles.courseTitle}>{course.title}</h2>
        <p className={styles.courseDescription}>{course.description}</p>
        <div className={styles.courseMetadata}>
          <span className={styles.courseDuration}>
            <i className={styles.icon}>⏱️</i> {course.duration}
          </span>
          <span className={styles.courseStudents}>
            <i className={styles.icon}>👥</i> {course.students} students
          </span>
        </div>
        <div className={styles.courseModules}>
          <p>{course.modules.length} modules</p>
        </div>
      </div>
    </div>
  );
};

export default LearnCard;