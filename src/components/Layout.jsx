import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Helmet } from 'react-helmet';
import InstallPrompt from './InstallPrompt';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <meta charSet="utf-8" />
        <title>ADHD 2e AI Agent System</title>
        <meta name="description" content="AI-powered assistant for managing ADHD and leveraging unique abilities" />
        <link rel="canonical" href="https://adhd2e.com" />
      </Helmet>
      <header className="bg-primary text-primary-foreground p-4">
        <nav className="flex justify-between items-center">
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
            <li><Link to="/tasks" className="hover:underline">Tasks</Link></li>
            <li><Link to="/profile" className="hover:underline">Profile</Link></li>
          </ul>
          <div className="flex items-center space-x-2">
            <InstallPrompt />
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main id="main-content" className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-secondary text-secondary-foreground p-4 text-center">
        <p>&copy; 2023 ADHD 2e AI Agent System</p>
      </footer>
    </div>
  );
};

export default Layout;