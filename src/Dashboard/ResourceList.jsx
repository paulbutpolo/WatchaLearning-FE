import React, { useEffect, useState } from 'react';

const ResourceList = ({ learningPathId }) => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/learning-paths/${learningPathId}/resources`
        );
        console.log(response)
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };

    fetchResources();
  }, [learningPathId]);

  return (
    <div>
      <h3>Resources</h3>
      {resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <ul>
          {resources.map((resource) => (
            <li key={resource._id}>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                {resource.title}
              </a>
              <p>{resource.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResourceList;