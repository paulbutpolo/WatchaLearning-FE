// ResourceForm.jsx
import React, { useState } from 'react';
import styles from './css/CourseManagement.module.css';

const ResourceForm = ({
  onSubmit,
  setShowForm,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: ''
  });

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Add New Resource</h2>
          <button 
            className={styles.closeButton} 
            onClick={() => setShowForm(false)}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Resource Name</label>
            <input
              type="text"
              name="name"
              className={styles.formInput}
              value={formData.name}
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
            <label className={styles.formLabel}>URL</label>
            <input
              type="url"
              name="url"
              className={styles.formInput}
              value={formData.url}
              onChange={handleFormInputChange}
              placeholder="https://example.com/resource"
              required
            />
          </div>

          <div className={styles.formButtons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;