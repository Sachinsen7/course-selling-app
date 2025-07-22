import React from 'react';
import PropTypes from 'prop-types';

function UserProfileCard({ user }) {
  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-card p-lg rounded-lg shadow-md border border-gray-100 text-center font-sans">
      <img
        src={user.profilePicture || 'https://placehold.co/100x100/F9F3EF/1B3C53?text=User'}
        alt={`${user.firstName} ${user.lastName}`}
        className="w-24 h-24 rounded-full mx-auto mb-md object-cover border-4 border-primary-main shadow-sm"
      />
      <h2 className="text-2xl font-bold text-text-primary mb-sm">
        {user.firstName} {user.lastName}
      </h2>
      <p className="text-text-secondary text-md mb-sm">{user.email}</p>
      <p className="text-primary-main text-sm font-semibold capitalize">{user.role}</p>
      {user.bio && (
        <p className="text-text-secondary text-sm mt-md italic line-clamp-3">{user.bio}</p>
      )}
    </div>
  );
}

UserProfileCard.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    profilePicture: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
};

export default UserProfileCard;
