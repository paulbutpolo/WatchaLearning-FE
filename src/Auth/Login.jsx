import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Auth.css';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        identifier,
        password,
      });
      
      localStorage.setItem('authToken', response.data.token);
      setIsAuthenticated(true);

      navigate('/home');
    } catch (error) {
      setError('Invalid email/username or password');
      console.error('Login failed', error);
    }
  };

  return (
    <div className="page-container">
      <div className="login-container">
        <h1>Login Page</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder='Username or Email'
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder='********'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="register-link">
          Not registered? Click <a onClick={() => navigate('/signup')}> here</a>
        </p>
      </div>
      <div className="main-content">
      </div>
    </div>
  );
};

export default Login;