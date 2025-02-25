// Signup.jsx
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    // Simulate a signup process
    alert('Signup successful! Please log in.');
    navigate('/login'); // Redirect to the login page after signup
  };

  return (
    <div>
      <h1>Signup Page</h1>
      <button onClick={handleSignup}>Sign Up</button>
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );
};

export default Signup;