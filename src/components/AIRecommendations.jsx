import React, { useState, useEffect } from 'react';
import { aiService } from '../services/api';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await aiService.getRecommendations();
      setRecommendations(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch AI recommendations');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Recommendations</h2>
      {recommendations.map((rec, index) => (
        <div key={index} className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">{rec.title}</h3>
          <p>{rec.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AIRecommendations;