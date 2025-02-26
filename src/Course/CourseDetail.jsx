import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../shared/Sidebar';

const CourseDetail = () => {
  const { id } = useParams();
  const [learningPath, setLearningPath] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the specific learning path from the backend
    const fetchLearningPath = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/paths/${id}`);
        const data = await response.json();
        setLearningPath(data);
      } catch (error) {
        console.error('Error fetching learning path:', error);
      }
    };

    // Check if the user is subscribed
    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/subscriber/check?courseId=${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    fetchLearningPath();
    checkSubscriptionStatus();
  }, [id]);

  const handleVideoClick = (videoId) => {
    navigate(`/course/${id}/video/${videoId}`);
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/subscriber/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          courseId: id,
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('Subscribed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to subscribe: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error subscribing to course:', error);
      alert('An error occurred while subscribing.');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/subscriber/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          courseId: id,
        }),
      });

      if (response.ok) {
        setIsSubscribed(false);
        alert('Unsubscribed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to unsubscribe: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error unsubscribing from course:', error);
      alert('An error occurred while unsubscribing.');
    }
  };

  if (!learningPath) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <SideBar />
      <div className="main-content">
        <header className="header">
          <h1>{learningPath.title}</h1>
          {isSubscribed ? (
            <button onClick={handleUnsubscribe}>Unsubscribe</button>
          ) : (
            <button onClick={handleSubscribe}>Subscribe</button>
          )}
        </header>
        <main className="content">
          <p>{learningPath.description}</p>
          <h2>Videos</h2>
          <ul>
            {learningPath.videos.map((video, index) => (
              <li key={index} onClick={() => handleVideoClick(video.videoId)}>
                <p>Episode {video.order}: {video.videoId}</p>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default CourseDetail;