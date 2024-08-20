import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
            <li><Link to="/tasks" className="hover:underline">Tasks</Link></li>
            <li><Link to="/profile" className="hover:underline">Profile</Link></li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-200 p-4 text-center">
        <p>&copy; 2023 ADHD 2e AI Agent System</p>
      </footer>
    </div>
  );
};

export default Layout;