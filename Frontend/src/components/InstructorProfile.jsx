import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

function InstructorProfile({ instructor, showFullProfileLink = false }) {
  if (!instructor) {
    return null;
  }

  return (
    <div className="bg-background-card p-lg rounded-lg shadow-md border border-gray-100 font-sans">
      <div className="flex items-center mb-md">
        <img
          src={instructor.profilePicture || 'https://placehold.co/80x80/F9F3EF/1B3C53?text=Instructor'}
          alt={`${instructor.firstName} ${instructor.lastName}`}
          className="w-20 h-20 rounded-full mr-md object-cover border-2 border-primary-main shadow-sm"
        />
        <div>
          <h3 className="text-2xl font-bold text-text-primary">
            {instructor.firstName} {instructor.lastName}
          </h3>
          <p className="text-text-secondary text-sm">Instructor</p>
        </div>
      </div>
      {instructor.bio && (
        <p className="text-text-primary text-md mb-md line-clamp-4">
          {instructor.bio}
        </p>
      )}
      {/* You can add more instructor stats here*/}
      {showFullProfileLink && (
        <div className="mt-md text-center">
          <Link to={`/instructors/${instructor._id}`}> 
            <Button text="View Full Profile" variant="outline" className="px-md py-sm" />
          </Link>
        </div>
      )}
    </div>
  );
}

InstructorProfile.propTypes = {
  instructor: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    profilePicture: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
  showFullProfileLink: PropTypes.bool,
};

export default InstructorProfile;
