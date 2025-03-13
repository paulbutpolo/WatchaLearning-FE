import React, { useState, useEffect } from 'react';
import SideBar from '../shared/Sidebar';
import Header from '../shared/Header';
import makeApiCall from '../api/Api';
import styles from './css/AccountsManager.module.css';

const AccountsManager = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from the API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await makeApiCall('/api/users', 'get');
      setUsers(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Set up form for editing a user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role
    });
    setIsEditing(true);
  };

  // Cancel editing and reset form
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'user'
    });
  };

  // Submit form to update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      await makeApiCall(`/api/users/${selectedUser._id}`, 'put', formData);
      fetchUsers(); // Refresh the user list
      setSuccessMessage('User updated successfully');
      handleCancelEdit();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await makeApiCall(`/api/users/${userId}`, 'delete');
        fetchUsers(); // Refresh the user list
        setSuccessMessage('User deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Error deleting user:', err);
      }
    }
  };

  // View a single user's details
  const handleViewUser = async (userId) => {
    try {
      const user = await makeApiCall(`/api/users/${userId}`, 'get');
      setSelectedUser(user);
    } catch (err) {
      setError('Failed to fetch user details. Please try again.');
      console.error('Error fetching user details:', err);
    }
  };

  const handleResetPassword = async (userId, username) => {
    if (window.confirm(`Are you sure you want to reset the password for ${username} to match their username?`)) {
      try {
        // You'll need to create this endpoint in your backend
        await makeApiCall(`/api/users/${userId}/reset-password`, 'post', {
          newPassword: username // Setting password same as username
        });
        
        setSuccessMessage(`Password for ${username} has been reset successfully`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Failed to reset password. Please try again.');
        console.error('Error resetting password:', err);
      }
    }
  };

  // Render user details view
  const renderUserDetails = () => {
    if (!selectedUser || isEditing) return null;
    
    return (
      <div className={styles.userDetails}>
        <h3>User Details</h3>
        <div className={styles.detailItem}>
          <strong>Username:</strong> {selectedUser.username}
        </div>
        <div className={styles.detailItem}>
          <strong>Email:</strong> {selectedUser.email}
        </div>
        <div className={styles.detailItem}>
          <strong>Role:</strong> {selectedUser.role}
        </div>
        <div className={styles.detailItem}>
          <strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}
        </div>
        <div className={styles.detailActions}>
          <button 
            className={styles.editButton} 
            onClick={() => handleEditClick(selectedUser)}
          >
            Edit
          </button>
          <button 
            className={styles.resetButton} 
            onClick={() => handleResetPassword(selectedUser._id, selectedUser.username)}
          >
            Reset Password
          </button>
          <button 
            className={styles.deleteButton} 
            onClick={() => handleDeleteUser(selectedUser._id)}
          >
            Delete
          </button>
          <button 
            className={styles.closeButton} 
            onClick={() => setSelectedUser(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Render edit form
  const renderEditForm = () => {
    if (!isEditing) return null;
    
    return (
      <div className={styles.editForm}>
        <h3>Edit User</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Update User
            </button>
            <button 
              className={styles.resetButton} 
              onClick={() => handleResetPassword(selectedUser._id, selectedUser.username)}
            >
              Reset Password
            </button>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render users table
  const renderUsersTable = () => {
    if (loading) {
      return <div className={styles.loading}>Loading users...</div>;
    }

    if (error) {
      return <div className={styles.error}>{error}</div>;
    }

    if (users.length === 0) {
      return <div className={styles.noUsers}>No users found.</div>;
    }

    return (
      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.role} ${styles[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className={styles.actions}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewUser(user._id)}
                  >
                    View
                  </button>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <SideBar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.accountsContainer}>
          <h2 className={styles.pageTitle}>User Accounts Management</h2>
          
          {/* Success message banner */}
          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}

          {/* Error message banner */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button onClick={() => setError(null)} className={styles.closeError}>×</button>
            </div>
          )}

          <div className={styles.contentLayout}>
            <div className={styles.usersList}>
              <div className={styles.tableHeader}>
                <h3>All Users</h3>
                <button className={styles.refreshButton} onClick={fetchUsers}>
                  Refresh
                </button>
              </div>
              {renderUsersTable()}
            </div>
            
            <div className={styles.userPanel}>
              {renderUserDetails()}
              {renderEditForm()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountsManager;