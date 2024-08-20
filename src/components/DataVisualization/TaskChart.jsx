import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TaskChart = ({ tasks }) => {
  const data = [
    { name: 'Completed', value: tasks.filter(task => task.completed).length },
    { name: 'In Progress', value: tasks.filter(task => !task.completed).length },
  ];

  return (
    <div className="w-full h-64">
      <BarChart width={300} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default TaskChart;