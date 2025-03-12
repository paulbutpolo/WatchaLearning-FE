import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/Auth.module.css';
import makeApiCall from '../api/Api';

const Auth = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRepassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await makeApiCall('/api/login', 'post', {
        identifier,
        password,
      });
  
      localStorage.setItem('authToken', response.token); // Change in production
  
      const tokenPayload = response.token.split('.')[1];
      const decodedPayload = JSON.parse(atob(tokenPayload));
      const username = decodedPayload.username;
      const role = decodedPayload.role;
  
      localStorage.setItem('userName', username); // Change in production
      localStorage.setItem('userRole', role); // Change in production
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            setError('Invalid email/username or password');
          } else {
            setError('An unexpected error occurred. Please try again.');
          }
        } else if (error.request) {
          setError('No response from the server. Please check your connection.');
        } else {
          setError('An error occurred. Please try again.');
        }
      console.log(error)
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    try {
      await makeApiCall('/api/signup', 'post', {
        username,
        email,
        password,
      });
  
      alert('Signup successful! Please log in.');
      setIsLogin(true);
      setError('');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setError('Signup failed. Please check your input and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else if (error.request) {
        setError('No response from the server. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className={styles['auth-container']}>
      <div className={styles['login-container']}>
        <h1>{isLogin ? 'Welcome Back' : 'Create an Account'}</h1>
        {error && <div className={styles['error-message']}>{error}</div>}

        <form className={styles['login-form']} onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="test"
            placeholder="Username or Email"
            value={isLogin ? identifier : email}
            onChange={(e) => (isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={rePassword}
              onChange={(e) => setRepassword(e.target.value)}
              required
            />
          )}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>

        <p className={styles['toggle-auth']}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </a>
        </p>
        {isLogin && (
          <a href="#" className={styles['forgot-password']}>
              Forgot Password?
          </a>
          )}
      </div>
    </div>
  );
};

export default Auth;