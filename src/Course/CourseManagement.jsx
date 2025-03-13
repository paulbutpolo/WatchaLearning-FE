import React, { useState, useEffect } from 'react';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header';
import styles from './css/CourseManagement.module.css';
import makeApiCall from '../api/Api';
import CourseForm from './CourseForm';
import CourseDetails from './CourseDetails';
import CourseCard from './CourseCard';
import ResourceForm from './ResourceForm';
import ConfirmationModal from '../shared/ConfirmationModal';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    level: "",
    modules: []
  });
  const [availableVideos, setAvailableVideos] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);

  const [showResourceForm, setShowResourceForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [courseToDelete, setCourseToDelete] = useState(null);

  const fetchCourses = async () => {
    const res = await makeApiCall('/api/courses/', 'get');
    setCourses(res);
  };

  const fetchVideos = async () => {
    const res = await makeApiCall('/api/videos?limit=0', 'get');
    setAvailableVideos(res);
  };

  const fetchResources = async () => {
    const res = await makeApiCall('/api/resources', 'get');
    setAvailableResources(res);
  };

  useEffect(() => {
    fetchResources();
    fetchVideos();
    fetchCourses();
  }, []);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleAddCourse = () => {
    setFormMode("create");
    setFormData({
      title: "",
      description: "",
      duration: "",
      level: "",
      modules: [],
    });
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setFormMode("edit");
    setFormData({
      _id: course._id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      modules: [...course.modules],
      imageUrl: course.imageUrl,
      students: course.students
    });
    setShowForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await makeApiCall(`/api/course/${courseId}`, 'delete');
      setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
      setSelectedCourse(null);
    } catch(error) {
      console.log(`Failed to delete course: ${error.response?.data?.message || error.message}`);
      alert("Failed to delete the course. Please try again.");
    }
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value
    };
    setFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const handleAddModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        {
          id: Date.now(),
          title: "",
          description: "",
          duration: "",
          video: null,
          resources: []
        }
      ]
    });
  };

  const handleRemoveModule = (index) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const handleVideoSelect = (index, video) => {
    const updatedModules = [...formData.modules];
    updatedModules[index].video = { id: video.id, title: video.originalName };
    setFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const handleAddResource = (index, resource) => {
    const updatedModules = [...formData.modules];
    const newResource = { _id: resource._id, title: resource.name };
    updatedModules[index].resources = [...updatedModules[index].resources, newResource];
    setFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const handleRemoveResource = (index, resourceIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[index].resources = updatedModules[index].resources.filter((_, i) => i !== resourceIndex);
    setFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (formMode === "create") {
        response = await makeApiCall('/api/course', 'post', formData);
        fetchCourses();
      } else {
        response = await makeApiCall(`/api/course/${formData._id}`, 'put', formData);
        setCourses(courses.map(course => 
          course._id === response._id ? response : course
        ));
        setSelectedCourse(response);
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save the course. Please try again.");
    }
  };

  const handleAddResources = async (resourceData) => {
    setIsLoading(true);
    try {
      makeApiCall('/api/resource', 'post', resourceData)
      setShowResourceForm(false);
    } catch (error) {
      console.error('Error adding resource:', error);
      // Handle error (show message, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (courseId) => {
    setCourseToDelete(courseId);
  };

  const confirmDelete = () => {
    handleDeleteCourse(courseToDelete);
    setCourseToDelete(null);
  };

  const cancelDelete = () => {
    setCourseToDelete(null);
  };

  return (
    <>
      <SideBar />
      <div className="main-content">
        <Header />
        <div className={styles.courseContainer}>
          <div className={styles.controlPanel}>
            <button className={styles.addButton} onClick={handleAddCourse}>
              Add New Course
            </button>
            <button className={styles.addResource} onClick={() => setShowResourceForm(true)}>
              Add Resources
            </button>
          </div>

          {selectedCourse && (
            <CourseDetails 
              selectedCourse={selectedCourse}
              handleEditCourse={handleEditCourse}
              handleDeleteCourse={handleDeleteCourse}
            />
          )}

          {courses.length > 0 ? (
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <CourseCard 
                  key={course._id}
                  course={course}
                  selectedCourse={selectedCourse}
                  handleSelectCourse={handleSelectCourse}
                  handleEditCourse={handleEditCourse}
                  handleDeleteCourse={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📚</div>
              <div className={styles.emptyStateText}>No courses found</div>
              <button className={styles.addButton} onClick={handleAddCourse}>
                Add Your First Course
              </button>
            </div>
          )}
          {showForm && (
            <CourseForm 
              formMode={formMode} 
              formData={formData} 
              handleFormInputChange={handleFormInputChange} 
              handleModuleChange={handleModuleChange} 
              handleAddModule={handleAddModule} 
              handleRemoveModule={handleRemoveModule} 
              handleVideoSelect={handleVideoSelect} 
              handleAddResource={handleAddResource} 
              handleRemoveResource={handleRemoveResource} 
              availableVideos={availableVideos} 
              availableResources={availableResources} 
              setShowForm={setShowForm} 
              handleFormSubmit={handleFormSubmit} 
            />
          )}
          {showResourceForm && (
            <ResourceForm 
              onSubmit={handleAddResources}
              setShowForm={setShowResourceForm}
              isLoading={isLoading}
            />
          )}
          <ConfirmationModal
            isOpen={courseToDelete !== null}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            message="Are you sure you want to delete this course?"
          />
        </div>
      </div>
    </>
  );
};

export default CourseManagement;