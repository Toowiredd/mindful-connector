import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { feedbackService } from '../services/api';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('');

  const submitFeedbackMutation = useMutation({
    mutationFn: feedbackService.submitFeedback,
    onSuccess: () => {
      toast.success('Feedback submitted successfully');
      setFeedback('');
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      submitFeedbackMutation.mutate({ content: feedback });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Submit Feedback</h2>
      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Share your thoughts or suggestions..."
        rows={4}
        required
      />
      <Button type="submit" disabled={submitFeedbackMutation.isLoading}>
        {submitFeedbackMutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
};

export default FeedbackForm;