import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css'; // Reusing that css and also the layout, hell yeah

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className={styles['notfound-container']}>
      <h1 className={styles['notfound-heading']}>Authorization required</h1>
      <p className={styles['notfound-text']}>You lack the sufficient access level permission to view this page</p>
      <button className={styles['notfound-button']} onClick={handleGoHome}>
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;