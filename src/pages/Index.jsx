import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to ADHD 2e AI Agent System</h1>
      <p className="text-xl text-gray-600 mb-8">Your personal assistant for managing ADHD and leveraging your unique abilities.</p>
      <div className="space-x-4">
        <Link to="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Go to Dashboard
        </Link>
        <Link to="/tasks" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          View Tasks
        </Link>
      </div>
    </div>
  );
};

export default Index;
