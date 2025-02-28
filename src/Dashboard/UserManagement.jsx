import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (error) {
      setError('Failed to fetch users.');
      console.error('Failed to fetch users', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const addUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/signup', newUser);
      setError('');
      setNewUser({ username: '', email: '', password: '' });
      fetchUsers(); // Refresh the user list after adding a new user
    } catch (error) {
      setError('Failed to add user. Please try again.');
      console.error('Failed to add user', error);
    }
  };

  const editUser = (user) => {
    setEditingUser(user);
  };

  const updateUser = async () => {
    try {
      const res = await axios.put(`http://localhost:3000/api/users/${editingUser._id}`, editingUser, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUsers(users.map((user) => (user._id === editingUser._id ? res.data : user)));
      setEditingUser(null);
    } catch (error) {
      setError('Failed to update user. Please try again.');
      console.error('Failed to update user', error);
    }
  };
  
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      setError('Failed to delete user. Please try again.');
      console.error('Failed to delete user', error);
    }
  };

  return (
    <div>
      <div>
        <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={editingUser ? editingUser.username : newUser.username}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={editingUser ? editingUser.email : newUser.email}
          onChange={handleInputChange}
        />
        {!editingUser && (
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newUser.password}
            onChange={handleInputChange}
          />
        )}
        {editingUser ? (
          <button onClick={updateUser}>Update User</button>
        ) : (
          <button onClick={addUser}>Add User</button>
        )}
      </div>
      <div>
        <h2>User List</h2>
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              {user.username} - {user.email}
              <button onClick={() => editUser(user)}>Edit</button>
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;