import React, { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/api';
import ResponsiveLayout from '../components/ResponsiveLayout';

const TaskList = lazy(() => import('../components/TaskList'));
const AIRecommendations = lazy(() => import('../components/AIAgent/AIRecommendations'));
const TaskChart = lazy(() => import('../components/DataVisualization/TaskChart'));

const Dashboard = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

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
    </ResponsiveLayout>
  );
};

export default Dashboard;