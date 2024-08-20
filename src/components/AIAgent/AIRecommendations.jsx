import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../LoadingSpinner';
import ErrorDisplay from '../ErrorDisplay';

const AIRecommendations = () => {
  const [chatMessage, setChatMessage] = useState('');

  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['personalizedRecommendations'],
    queryFn: aiService.getRecommendations,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    onError: (error) => {
      toast.error(`Failed to load recommendations: ${error.message}`);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }) => aiService.submitFeedback(id, feedback),
    onSuccess: () => {
      toast.success('Feedback submitted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  const chatMutation = useMutation({
    mutationFn: (message) => aiService.getChatResponse(message),
    onSuccess: (data) => {
      toast.success('AI response received');
      // Handle the chat response, e.g., update state to display it
    },
    onError: (error) => {
      toast.error(`Failed to get AI response: ${error.message}`);
    },
  });

  const handleFeedback = (id, feedback) => {
    feedbackMutation.mutate({ id, feedback });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      chatMutation.mutate(chatMessage);
      setChatMessage('');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error.message} />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center">
        <Lightbulb className="mr-2" />
        Personalized AI Recommendations
      </h2>
      {recommendations.map((rec) => (
        <Card key={rec.id} className={`transition-shadow hover:shadow-lg ${rec.matchesAdhdType ? 'border-green-500' : ''}`}>
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
            <div className="text-sm text-gray-500">
              Relevance: {rec.relevanceScore}%
              {rec.matchesAdhdType && <span className="ml-2 text-green-500">Matches ADHD Type</span>}
            </div>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <MessageCircle className="mr-2" />
            Chat with AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChatSubmit} className="flex space-x-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow"
            />
            <Button type="submit" disabled={chatMutation.isLoading}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRecommendations;