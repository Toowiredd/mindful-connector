import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner';
import ResponsiveLayout from '../components/ResponsiveLayout';

const Tasks = () => {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task created successfully');
      setNewTaskTitle('');
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }) => taskService.updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task updated successfully');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate({ title: newTaskTitle, status: 'Not Started' });
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateTaskMutation.mutate({ id, task: { status: newStatus } });
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(id);
    }
  };

  if (isLoading) return <div aria-live="polite">Loading tasks...</div>;
  if (error) return <div aria-live="assertive">Error: {error.message}</div>;

  return (
    <ResponsiveLayout>
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <form onSubmit={handleCreateTask} className="mb-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            name="taskTitle"
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            aria-label="New task title"
          />
          <Button type="submit" disabled={createTaskMutation.isLoading || !newTaskTitle.trim()}>
            {createTaskMutation.isLoading ? 'Creating...' : 'Add Task'}
          </Button>
        </div>
      </form>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="bg-card text-card-foreground p-4 rounded shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="text-xl font-semibold">{task.title}</h3>
                <p className="text-muted-foreground">Status: {task.status}</p>
              </div>
              <div className="space-x-2 mt-2 sm:mt-0">
                <Button 
                  onClick={() => handleUpdateStatus(task.id, 'In Progress')} 
                  disabled={task.status === 'In Progress'}
                  aria-label={`Start task: ${task.title}`}
                >
                  Start
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus(task.id, 'Completed')} 
                  disabled={task.status === 'Completed'}
                  aria-label={`Complete task: ${task.title}`}
                >
                  Complete
                </Button>
                <Button 
                  onClick={() => handleDeleteTask(task.id)} 
                  variant="destructive"
                  aria-label={`Delete task: ${task.title}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ResponsiveLayout>
  );
};

export default Tasks;