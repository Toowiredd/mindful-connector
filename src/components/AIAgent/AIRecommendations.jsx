import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AIRecommendations = () => {
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: aiService.getRecommendations,
  });

  if (isLoading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error.message}</div>;

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