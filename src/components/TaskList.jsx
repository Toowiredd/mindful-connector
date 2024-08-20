import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/api';
import { Button } from "@/components/ui/button"
import { toast } from 'sonner';

const TaskList = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }) => taskService.updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    },
  });

  const handleTaskComplete = (id) => {
    updateTaskMutation.mutate({ id, task: { completed: true } });
  };

  const handleTaskDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
          <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
          <div>
            {!task.completed && (
              <Button
                onClick={() => handleTaskComplete(task.id)}
                disabled={updateTaskMutation.isLoading}
                className="mr-2"
              >
                Complete
              </Button>
            )}
            <Button
              onClick={() => handleTaskDelete(task.id)}
              disabled={deleteTaskMutation.isLoading}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;