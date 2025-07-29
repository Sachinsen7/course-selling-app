import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfileCard from '../components/user/UserProfileCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { updateUserProfile, changePassword } from '../services/api';
import { Link } from 'react-router-dom'; 

function UserProfile() {
  const { user, loading: authLoading, showModal, login: authLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: '',
    bio: '',
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setProfileFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
      });
      setLoading(false);
    } else if (!authLoading && !user) {
      setError('Please log in to view your profile.');
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setError(null);

    try {
      const updatedData = {
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        profilePicture: profileFormData.profilePicture,
        bio: profileFormData.bio,
      };
      const response = await updateUserProfile(user.userId, updatedData);
      authLogin(user.token, { ...user, ...response.user });
      showModal({
        isOpen: true,
        title: 'Profile Updated!',
        message: 'Your profile has been updated successfully.',
        type: 'success',
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      showModal({
        isOpen: true,
        title: 'Update Failed',
        message: err.message || 'Could not update profile.',
        type: 'error',
      });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPassword(true);
    setError(null);

    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      setError('New password and confirmation do not match.');
      setSubmittingPassword(false);
      return;
    }
    if (passwordFormData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setSubmittingPassword(false);
      return;
    }

    try {
      await changePassword(passwordFormData.currentPassword, passwordFormData.newPassword);
      showModal({
        isOpen: true,
        title: 'Password Changed!',
        message: 'Your password has been updated successfully.',
        type: 'success',
      });
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password.');
      showModal({
        isOpen: true,
        title: 'Password Change Failed',
        message: err.message || 'Could not change password.',
        type: 'error',
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (authLoading || loading) return <Loader />;
  if (error && !user) return <div className="text-accent-error text-center p-6 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-8 px-4 font-sans flex justify-center">
      <div className="container mx-auto max-w-5xl bg-[#FFFFFF] p-8 rounded-xl shadow-lg border border-[#E5E7EB]">
        <h1 className="text-4xl font-bold text-[#1B3C53] text-center mb-8">Your Profile</h1>

        {error && <p className="text-[#DC2626] text-center mb-6 text-lg">{error}</p>}

        {user ? (
          <>
            <div className="flex flex-col lg:flex-row lg:space-x-8 mb-12">
              {/* Profile Card Section */}
              <div className="lg:w-1/3 mb-6 lg:mb-0">
                <UserProfileCard user={user} />
                <Button
                  text={isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full mt-4 bg-[#1B3C53] text-white hover:bg-[#456882] transition-colors duration-200 rounded-md py-3 font-semibold text-base"
                  variant={isEditing ? 'secondary' : 'default'}
                />
              </div>

              {/* Profile Edit Form */}
              <div className="lg:w-2/3">
                <h2 className="text-2xl font-semibold text-[#1B3C53] mb-6 border-b-2 border-[#4A8292] pb-2">
                  {isEditing ? 'Edit Profile Information' : 'Profile Details'}
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="firstName" className="block text-[#1B3C53] text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileFormData.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#F9FAFB] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                      required
                      disabled={!isEditing || submittingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-[#1B3C53] text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileFormData.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#F9FAFB] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                      required
                      disabled={!isEditing || submittingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[#1B3C53] text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileFormData.email}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="profilePicture" className="block text-[#1B3C53] text-sm font-medium mb-2">Profile Picture URL</label>
                    <input
                      type="url"
                      id="profilePicture"
                      name="profilePicture"
                      value={profileFormData.profilePicture}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#F9FAFB] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                      disabled={!isEditing || submittingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-[#1B3C53] text-sm font-medium mb-2">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="4"
                      value={profileFormData.bio}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#F9FAFB] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                      disabled={!isEditing || submittingProfile}
                    ></textarea>
                  </div>
                  {isEditing && (
                    <Button
                      text={submittingProfile ? 'Saving Profile...' : 'Save Profile'}
                      type="submit"
                      className="w-full bg-[#1B3C53] text-white hover:bg-[#456882] transition-colors duration-200 rounded-md py-3 font-semibold text-base"
                      disabled={submittingProfile}
                    />
                  )}
                </form>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-12 pt-8 border-t-2 border-[#E5E7EB]">
              <h2 className="text-2xl font-semibold text-[#1B3C53] mb-6 border-b-2 border-[#4A8292] pb-2">Change Password</h2>
              <form onSubmit={handleChangePasswordSubmit} className="max-w-lg mx-auto space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-[#1B3C53] text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#F9FAFB] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                    required
                    disabled={submittingPassword}
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-[#1B3C53] text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#F9FAFB] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                    required
                    disabled={submittingPassword}
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-[#1B3C53] text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={passwordFormData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#F9FAFB] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                    required
                    disabled={submittingPassword}
                  />
                </div>
                <Button
                  text={submittingPassword ? 'Changing Password...' : 'Change Password'}
                  type="submit"
                  className="w-full bg-[#1B3C53] text-white hover:bg-[#456882] transition-colors duration-200 rounded-md py-3 font-semibold text-base"
                  disabled={submittingPassword}
                />
              </form>
            </div>
          </>
        ) : (
          <p className="text-center text-[#6B7280] text-lg mt-8">
            You are not logged in. Please{' '}
            <Link to="/login" className="text-[#4A8292] hover:underline font-medium">
              log in
            </Link>{' '}
            to view your profile.
          </p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;