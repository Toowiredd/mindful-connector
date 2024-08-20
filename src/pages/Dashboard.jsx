import React, { lazy, Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { pushNotificationService } from '../services/pushNotificationService';
import ResponsiveLayout from '../components/ResponsiveLayout';

const TaskList = lazy(() => import('../components/TaskList'));
const AIRecommendations = lazy(() => import('../components/AIAgent/AIRecommendations'));
const TaskChart = lazy(() => import('../components/DataVisualization/TaskChart'));
const FeedbackForm = lazy(() => import('../components/FeedbackForm'));

const Dashboard = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  });

  useEffect(() => {
    if (tasks) {
      const completedTasks = tasks.filter(task => task.status === 'Completed').length;
      const totalTasks = tasks.length;
      const completionRate = (completedTasks / totalTasks) * 100;

      if (completionRate >= 50) {
        pushNotificationService.sendNotification(
          'Great Progress!',
          { body: `You've completed ${completionRate.toFixed(0)}% of your tasks. Keep up the good work!` }
        );
      } else {
        pushNotificationService.sendNotification(
          'Motivational Message',
          { body: "Remember, every small step counts. You've got this!" }
        );
      }
    }
  }, [tasks]);

  if (isLoading) return <div aria-live="polite">Loading dashboard...</div>;
  if (error) return <div aria-live="assertive">Error: {error.message}</div>;

  return (
    <ResponsiveLayout>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading tasks...</div>}>
          <div>
            <TaskList />
            <TaskChart tasks={tasks} />
          </div>
        </Suspense>
        <Suspense fallback={<div>Loading recommendations...</div>}>
          <AIRecommendations />
        </Suspense>
      </div>
      <Suspense fallback={<div>Loading feedback form...</div>}>
        <FeedbackForm />
      </Suspense>
    </ResponsiveLayout>
  );
};

export default Dashboard;