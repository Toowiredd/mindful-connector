import React from 'react';
import TaskList from '../components/TaskList';
import AIRecommendations from '../components/AIRecommendations';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TaskList />
        <AIRecommendations />
      </div>
    </div>
  );
};

export default Dashboard;