import React, { useState, useEffect } from 'react';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header';
import makeApiCall from '../api/Api';
import styles from './css/Learn.module.css';
import LearnCard from './LearnCard';
import LearnModal from './LearnModal';
import Loader from '../shared/Loader';


const Learn = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    try {
      const res = await makeApiCall('/api/courses/', 'get');
      setCourses(res);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const res = await makeApiCall(`/api/subscriber/check?courseId=${selectedCourse._id}`);
      if (res.isSubscribed) {
        setIsSubscribed(prev => ({
          ...prev,
          [selectedCourse._id]: !prev[selectedCourse._id]
        }));
      }
    }

    if (selectedCourse) {
      fetchSubscriptions();
    }
  }, [selectedCourse]);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubscribe = async (courseId) => {
    try {
      const isCurrentlySubscribed = isSubscribed[courseId];
      const endpoint = isCurrentlySubscribed ? `/api/subscriber/delete` : `/api/subscriber/create`;
      const method = isCurrentlySubscribed ? 'delete' : 'post';

      const response = await makeApiCall(endpoint, method, { courseId });

      setIsSubscribed(prev => ({
        ...prev,
        [courseId]: !prev[courseId]
      }));

      console.log(response, courseId);
    } catch (error) {
      console.error('Error toggling subscription:', error);
      alert('An error occurred while toggling subscription.');
    }
  };

  return (
    <>
      <SideBar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.learningContainer}>
          <h1 className={styles.pageTitle}>Available Courses</h1>
          
          {isLoading ? (
          <Loader /> // Show loader while loading
          ) : (
            <div className={styles.courseGrid}>
              {courses.map(course => (
                <LearnCard 
                  key={course._id} 
                  course={course} 
                  onClick={() => handleSelectCourse(course)} 
                />
              ))}
            </div>
          )}

          {showModal && selectedCourse && (
            <LearnModal 
              course={selectedCourse} 
              onClose={handleCloseModal} 
              onSubscribe={() => handleSubscribe(selectedCourse._id)} 
              isSubscribed={isSubscribed[selectedCourse._id]} 
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Learn;