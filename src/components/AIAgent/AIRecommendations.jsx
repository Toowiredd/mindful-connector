import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await aiService.getRecommendations();
        setRecommendations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch AI recommendations');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Recommendations</h2>
      {recommendations.map((rec, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{rec.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{rec.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIRecommendations;