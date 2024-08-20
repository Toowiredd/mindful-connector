import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';

const AIRecommendations = () => {
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: aiService.getRecommendations,
  });

  const handleFeedback = (id, feedback) => {
    // TODO: Implement feedback submission to the backend
    console.log(`Recommendation ${id} received ${feedback} feedback`);
  };

  if (isLoading) return <div>Loading personalized recommendations...</div>;
  if (error) return <div>Error loading recommendations: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center">
        <Lightbulb className="mr-2" />
        Personalized AI Recommendations
      </h2>
      {recommendations.map((rec) => (
        <Card key={rec.id} className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">{rec.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">{rec.description}</p>
            {rec.actionItem && (
              <div className="mt-2">
                <strong>Suggested Action:</strong> {rec.actionItem}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">Relevance: {rec.relevanceScore}%</div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(rec.id, 'helpful')}
              >
                <ThumbsUp className="mr-1" /> Helpful
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(rec.id, 'not helpful')}
              >
                <ThumbsDown className="mr-1" /> Not Helpful
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AIRecommendations;