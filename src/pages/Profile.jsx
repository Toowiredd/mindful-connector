import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/api';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner';

const Profile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedProfile = Object.fromEntries(formData.entries());
    updateProfileMutation.mutate(updatedProfile);
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" defaultValue={profile.name} placeholder="Name" required />
        <Input name="email" defaultValue={profile.email} placeholder="Email" required type="email" />
        <Input name="adhdType" defaultValue={profile.adhdType} placeholder="ADHD Type" />
        <Input name="traits" defaultValue={profile.traits} placeholder="2e Traits" />
        <Button type="submit" disabled={updateProfileMutation.isLoading}>
          {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
};

export default Profile;