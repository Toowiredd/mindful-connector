import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tasks');
      setLoading(false);
    }
  };

  const handleTaskComplete = async (id) => {
    try {
      await taskService.updateTask(id, { completed: true });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
          <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
          {!task.completed && (
            <button
              onClick={() => handleTaskComplete(task.id)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Complete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;