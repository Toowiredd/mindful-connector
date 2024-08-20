import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Task Overview</h2>
          <p>You have 5 tasks due today</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <p>You've completed 70% of your weekly goals</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
          <p>2 meetings scheduled for tomorrow</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;