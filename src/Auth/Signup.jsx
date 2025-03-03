import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRepassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent form submission refresh

    try {
      axios.post(`${import.meta.env.VITE_API_URL}/api/signup`, { username, email, password });
      
      // Notify the user of successful signup
      alert('Signup successful! Please log in.');
      
      // Redirect to the login page
      navigate('/login');
    } catch (error) {
      setError('Signup failed. Please try again.');
      console.error('Signup failed', error);
    }
  };

  return (
    <div className="page-container">
      <div className="login-container">
        <h1>Signup Page</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form className="login-form" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder='********'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder='********'
            value={rePassword}
            onChange={(e) => setRepassword(e.target.value)}
            required
          />
          <button type="submit">Sign up</button>
        </form>
        <p className="register-link">
          Already registered? Click <a onClick={() => navigate('/login')}> here</a>
        </p>
      </div>
      <div className="main-content">
      </div>
    </div>
  );
};

export default Signup;