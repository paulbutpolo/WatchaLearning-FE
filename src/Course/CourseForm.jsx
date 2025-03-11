// CourseForm.jsx
import React from 'react';
import styles from './css/CourseManagement.module.css';

const CourseForm = ({
  formMode,
  formData,
  handleFormInputChange,
  handleModuleChange,
  handleAddModule,
  handleRemoveModule,
  handleVideoSelect,
  handleAddResource,
  handleRemoveResource,
  availableVideos,
  availableResources,
  setShowForm,
  handleFormSubmit
}) => {
  const renderModuleForm = (module, index) => (
    <div key={index} className={styles.moduleFormItem}>
      <div className={styles.moduleFormHeader}>
        <div className={styles.moduleFormTitle}>Module {index + 1}</div>
        <button
          type="button"
          className={styles.removeModuleButton}
          onClick={() => handleRemoveModule(index)}
        >
          Remove
        </button>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Title</label>
        <input
          type="text"
          className={styles.formInput}
          value={module.title}
          onChange={(e) => handleModuleChange(index, "title", e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Description</label>
        <textarea
          className={styles.formTextarea}
          value={module.description}
          onChange={(e) => handleModuleChange(index, "description", e.target.value)}
          required
        ></textarea>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Duration</label>
        <input
          type="text"
          className={styles.formInput}
          value={module.duration}
          onChange={(e) => handleModuleChange(index, "duration", e.target.value)}
          placeholder="e.g. 1h 30min"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Video</label>
        <select
          className={styles.formInput}
          value={module.video ? module.video.id : ""}
          onChange={(e) => {
            const selectedVideo = availableVideos.find(video => video.id === e.target.value);
            handleVideoSelect(index, selectedVideo);
          }}
        >
          <option value="">Select a video</option>
          {availableVideos.map(video => (
            <option key={video.id} value={video.id}>{video.originalName}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Resources</label>
        <select
          className={styles.formInput}
          onChange={(e) => {
            const selectedResource = availableResources.find(resource => resource._id === e.target.value);
            if (selectedResource) {
              handleAddResource(index, selectedResource);
            }
          }}
        >
          <option value="">Select a resource</option>
          {availableResources.map(resource => (
            <option key={resource._id} value={resource._id}>
              {resource.name}
            </option>
          ))}
        </select>
        <div className={styles.resourcesList}>
          {module.resources.map((resource, resourceIndex) => (
            <div key={resourceIndex} className={styles.resourceItem}>
              <span>{resource.title}</span>
              <button
                type="button"
                className={styles.removeResourceButton}
                onClick={() => handleRemoveResource(index, resourceIndex)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            {formMode === "create" ? "Add New Course" : "Edit Course"}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={() => setShowForm(false)}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Course Title</label>
            <input
              type="text"
              name="title"
              className={styles.formInput}
              value={formData.title}
              onChange={handleFormInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              name="description"
              className={styles.formTextarea}
              value={formData.description}
              onChange={handleFormInputChange}
              required
            ></textarea>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Duration</label>
            <input
              type="text"
              name="duration"
              className={styles.formInput}
              value={formData.duration}
              onChange={handleFormInputChange}
              placeholder="e.g. 8 weeks"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Level</label>
            <select
              name="level"
              className={styles.formInput}
              value={formData.level}
              onChange={handleFormInputChange}
              required
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className={styles.modulesSection}>
            <h3 className={styles.modulesHeader}>Course Modules</h3>
            {formData.modules.map((module, index) => renderModuleForm(module, index))}
            <button
              type="button"
              className={styles.addModuleButton}
              onClick={handleAddModule}
            >
              + Add Module
            </button>
          </div>

          <div className={styles.formButtons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {formMode === "create" ? "Create Course" : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;