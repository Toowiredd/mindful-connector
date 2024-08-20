import React, { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import AIRecommendations from '../components/AIAgent/AIRecommendations';
import TaskChart from '../components/DataVisualization/TaskChart';
import { taskService } from '../services/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await taskService.getTasks();
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tasks');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <TaskList tasks={tasks} />
          <TaskChart tasks={tasks} />
        </div>
        <AIRecommendations />
      </div>
    </div>
  );
};

export default Dashboard;