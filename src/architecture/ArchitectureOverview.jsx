import React from 'react';
import { Mermaid } from 'mermaid';

const ArchitectureOverview = () => {
  const diagram = `
    graph TD
      Client[React Frontend]
      AG[API Gateway]
      Auth[Authentication Service]
      Task[Task Management Service]
      Profile[User Profile Service]
      AI[AI Recommendation Service]
      Analytics[Analytics Service]
      
      SB[(Supabase)]
      MDB[(MongoDB)]
      Neo[(Neo4j)]
      
      Client --> AG
      AG --> Auth
      AG --> Task
      AG --> Profile
      AG --> AI
      AG --> Analytics
      
      Auth <--> SB
      Task <--> MDB
      Profile <--> MDB
      AI <--> Neo
      Analytics <--> MDB
      Analytics <--> Neo
  `;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ADHD 2e AI Agent System Architecture</h1>
      <Mermaid chart={diagram} />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Component Descriptions:</h2>
        <ul className="list-disc pl-5">
          <li><strong>React Frontend:</strong> User interface for interacting with the system.</li>
          <li><strong>API Gateway:</strong> Single entry point for all client requests, handles routing and load balancing.</li>
          <li><strong>Authentication Service:</strong> Manages user authentication and authorization using Supabase.</li>
          <li><strong>Task Management Service:</strong> Handles CRUD operations for tasks and todo lists.</li>
          <li><strong>User Profile Service:</strong> Manages user profiles and preferences.</li>
          <li><strong>AI Recommendation Service:</strong> Provides personalized recommendations and insights using Neo4j.</li>
          <li><strong>Analytics Service:</strong> Collects and analyzes user data for insights and reporting.</li>
          <li><strong>Supabase:</strong> Handles real-time features and acts as a backup authentication system.</li>
          <li><strong>MongoDB:</strong> Primary data storage for user profiles, tasks, and analytics data.</li>
          <li><strong>Neo4j:</strong> Graph database for managing relationships and generating AI recommendations.</li>
        </ul>
      </div>
    </div>
  );
};

export default ArchitectureOverview;