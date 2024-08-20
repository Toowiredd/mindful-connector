import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProgressTracker = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  if (isLoading) return <div>Loading progress...</div>;
  if (error) return <div>Error loading progress: {error.message}</div>;

  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="w-full" />
        <p className="mt-2 text-center">
          {completedTasks} out of {totalTasks} tasks completed ({progressPercentage.toFixed(1)}%)
        </p>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;