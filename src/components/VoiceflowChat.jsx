import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { voiceflowService } from '../services/voiceflowService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const VoiceflowChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userID, setUserID] = useState('');

  useEffect(() => {
    // Generate a unique user ID or fetch from user profile
    setUserID(`user_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const launchMutation = useMutation({
    mutationFn: () => voiceflowService.launchConversation(userID),
    onSuccess: (data) => {
      setMessages(data.map(item => ({ type: 'bot', content: item.payload.message })));
    },
  });

  const interactMutation = useMutation({
    mutationFn: (text) => voiceflowService.interact(userID, { type: 'text', payload: text }),
    onSuccess: (data) => {
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'user', content: input },
        ...data.map(item => ({ type: 'bot', content: item.payload.message }))
      ]);
      setInput('');
    },
  });

  useEffect(() => {
    if (userID) {
      launchMutation.mutate();
    }
  }, [userID]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      interactMutation.mutate(input);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <ScrollArea className="flex-grow p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={interactMutation.isLoading}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VoiceflowChat;