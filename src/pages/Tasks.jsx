import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner';

const Tasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task created successfully');
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
    const title = e.target.taskTitle.value;
    createTaskMutation.mutate({ title, status: 'Not Started' });
    e.target.reset();
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateTaskMutation.mutate({ id, task: { status: newStatus } });
  };

  const handleDeleteTask = (id) => {
    deleteTaskMutation.mutate(id);
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <form onSubmit={handleCreateTask} className="mb-4">
        <div className="flex space-x-2">
          <Input name="taskTitle" placeholder="New task title" required />
          <Button type="submit" disabled={createTaskMutation.isLoading}>
            {createTaskMutation.isLoading ? 'Creating...' : 'Add Task'}
          </Button>
        </div>
      </form>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{task.title}</h3>
              <p className="text-gray-600">Status: {task.status}</p>
            </div>
            <div className="space-x-2">
              <Button onClick={() => handleUpdateStatus(task.id, 'In Progress')} disabled={task.status === 'In Progress'}>
                Start
              </Button>
              <Button onClick={() => handleUpdateStatus(task.id, 'Completed')} disabled={task.status === 'Completed'}>
                Complete
              </Button>
              <Button onClick={() => handleDeleteTask(task.id)} variant="destructive">
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;