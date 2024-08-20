import React from 'react';

const Tasks = () => {
  const tasks = [
    { id: 1, title: 'Complete project proposal', status: 'In Progress' },
    { id: 2, title: 'Review team presentations', status: 'Not Started' },
    { id: 3, title: 'Schedule client meeting', status: 'Completed' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{task.title}</h3>
            <p className="text-gray-600">Status: {task.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;