import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfileCard from '../components/user/UserProfileCard';
import Loader from '../components/common/Loader';

function UserProfile() {
  const { user, loading: authLoading } = useAuth(); 

  if (authLoading) return <Loader />;
  if (!user) return <div className="text-center text-text-primary p-lg">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans flex justify-center">
      <div className="container mx-auto max-w-lg">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-xl">Your Profile</h1>
        <UserProfileCard user={user} />
      </div>
    </div>
  );
}

export default UserProfile;