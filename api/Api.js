import axios from 'axios';

const makeApiCall = async (endpoint, method = 'get', data = null, config = {}) => {
  const token = localStorage.getItem('authToken');

  try {
    // Create axiosConfig with the base properties
    const axiosConfig = {
      method,
      url: `${import.meta.env.VITE_API_URL}${endpoint}`, // Include base URL here
      ...config, // Spread the rest of the config
    };

    // Merge headers: Ensure Authorization is always included
    axiosConfig.headers = {
      ...config.headers, // Custom headers (e.g., Content-Type: multipart/form-data)
      Authorization: `Bearer ${token}`, // Always include the Authorization header
    };

    // Only include `data` if the method supports it
    if (data && (method === 'post' || method === 'put' || method === 'patch' || method === 'delete')) {
      axiosConfig.data = data;
    }
    console.log(axiosConfig)
    const response = await axios(axiosConfig);
    console.log(response.data)

    // For binary responses (like file downloads), return the whole response
    // This is detected by checking if responseType is 'blob'
    if (config.responseType === 'blob') {
      return response;
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'An unexpected error occurred.');
    } else if (error.request) {
      throw new Error('No response from the server. Please check your connection.');
    } else {
      throw new Error('An error occurred. Please try again.');
    }
  }
};

export default makeApiCall;