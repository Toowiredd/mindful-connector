import React from 'react';
import { useQuery } from '@tanstack/react-query';
import TaskList from '../components/TaskList';
import AIRecommendations from '../components/AIAgent/AIRecommendations';
import TaskChart from '../components/DataVisualization/TaskChart';
import { taskService } from '../services/api';

const Dashboard = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <TaskList />
          <TaskChart tasks={tasks} />
        </div>
        <AIRecommendations />
      </div>
    </div>
  );
};

export default Dashboard;