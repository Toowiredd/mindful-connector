import React from 'react';

const Profile = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> john.doe@example.com</p>
        <p><strong>ADHD Type:</strong> Combined</p>
        <p><strong>2e Traits:</strong> Gifted in mathematics, Dyslexia</p>
      </div>
    </div>
  );
};

export default Profile;