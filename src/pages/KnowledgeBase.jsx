import React from 'react';
import VoiceflowChat from '../components/VoiceflowChat';

const KnowledgeBase = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>
      <p className="mb-4">
        Use this Voiceflow-powered chat interface to interact with our knowledge base.
        You can ask questions, capture ideas, or explore information related to ADHD and 2e characteristics.
      </p>
      <VoiceflowChat />
    </div>
  );
};

export default KnowledgeBase;