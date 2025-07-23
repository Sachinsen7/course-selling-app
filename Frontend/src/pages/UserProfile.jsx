import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfileCard from '../components/user/UserProfileCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { updateUserProfile, changePassword,} from '../services/api'; 

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
      // If not authenticated, redirect or show message 
      setError("Please log in to view your profile.");
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setError(null);

    try {
      // Send only editable fields to backend
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
        title: "Profile Updated!",
        message: "Your profile has been updated successfully.",
        type: "success",
      });
      setIsEditing(false); 
    } catch (err) {
      setError(err.message || "Failed to update profile.");
      showModal({
        isOpen: true,
        title: "Update Failed",
        message: err.message || "Could not update profile.",
        type: "error",
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
      setError("New password and confirmation do not match.");
      setSubmittingPassword(false);
      return;
    }
    if (passwordFormData.newPassword.length < 6) { 
      setError("New password must be at least 6 characters long.");
      setSubmittingPassword(false);
      return;
    }

    try {
      await changePassword(passwordFormData.currentPassword, passwordFormData.newPassword);
      showModal({
        isOpen: true,
        title: "Password Changed!",
        message: "Your password has been updated successfully.",
        type: "success",
      });
      setPasswordFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear form
    } catch (err) {
      setError(err.message || "Failed to change password.");
      showModal({
        isOpen: true,
        title: "Password Change Failed",
        message: err.message || "Could not change password.",
        type: "error",
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (authLoading || loading) return <Loader />;
  if (error && !user) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>; // Only show error if not logged in

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans flex justify-center">
      <div className="container mx-auto max-w-4xl bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-xl">Your Profile</h1>

        {error && <p className="text-accent-error text-center mb-md">{error}</p>}

        {user ? (
          <>
            <div className="flex flex-col md:flex-row md:space-x-xl mb-xl">
              {/* Profile Card Section */}
              <div className="md:w-1/3 mb-lg md:mb-0">
                <UserProfileCard user={user} />
                <Button
                  text={isEditing ? "Cancel Edit" : "Edit Profile"}
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full mt-md"
                  variant={isEditing ? "secondary" : "default"}
                />
              </div>

              {/* Profile Edit Form */}
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold text-text-primary mb-lg border-b pb-sm">
                  {isEditing ? 'Edit Profile Information' : 'Profile Details'}
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-md">
                  <div>
                    <label htmlFor="firstName" className="block text-text-primary text-sm font-semibold mb-sm">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileFormData.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                      required
                      disabled={!isEditing || submittingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-text-primary text-sm font-semibold mb-sm">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileFormData.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                      required
                      disabled={!isEditing || submittingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-text-primary text-sm font-semibold mb-sm">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileFormData.email}
                      className="w-full px-md py-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      disabled // Email is typically not editable directly
                    />
                  </div>
                  <div>
                    <label htmlFor="profilePicture" className="block text-text-primary text-sm font-semibold mb-sm">Profile Picture URL</label>
                    <input
                      type="url"
                      id="profilePicture"
                      name="profilePicture"
                      value={profileFormData.profilePicture}
                      onChange={handleProfileChange}
                      className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                      disabled={!isEditing || submittingProfile}
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-text-primary text-sm font-semibold mb-sm">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="4"
                      value={profileFormData.bio}
                      onChange={handleProfileChange}
                      className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                      disabled={!isEditing || submittingProfile}
                    ></textarea>
                  </div>
                  {isEditing && (
                    <Button
                      text={submittingProfile ? 'Saving Profile...' : 'Save Profile'}
                      type="submit"
                      className="w-full px-lg py-md"
                      disabled={submittingProfile}
                    />
                  )}
                </form>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-xl pt-xl border-t border-gray-200">
              <h2 className="text-3xl font-bold text-text-primary mb-lg border-b pb-sm">Change Password</h2>
              <form onSubmit={handleChangePasswordSubmit} className="max-w-xl mx-auto space-y-md">
                <div>
                  <label htmlFor="currentPassword" className="block text-text-primary text-sm font-semibold mb-sm">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                    required
                    disabled={submittingPassword}
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-text-primary text-sm font-semibold mb-sm">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                    required
                    disabled={submittingPassword}
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-text-primary text-sm font-semibold mb-sm">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={passwordFormData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                    required
                    disabled={submittingPassword}
                  />
                </div>
                <Button
                  text={submittingPassword ? 'Changing Password...' : 'Change Password'}
                  type="submit"
                  className="w-full px-lg py-md"
                  disabled={submittingPassword}
                />
              </form>
            </div>
          </>
        ) : (
          <p className="text-center text-text-secondary text-lg mt-8">
            You are not logged in. Please <Link to="/login" className="text-primary-main hover:underline">log in</Link> to view your profile.
          </p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
