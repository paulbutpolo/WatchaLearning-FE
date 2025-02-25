// Login.jsx
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate a login by storing a token in localStorage
    localStorage.setItem('authToken', 'fake-token');
    navigate('/home'); // Redirect to the home page after login
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Log In</button>
      <button onClick={() => navigate('/signup')}>Go to Signup</button>
    </div>
  );
};

export default Login;