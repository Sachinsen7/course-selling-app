import React from 'react';
import PropTypes from 'prop-types';

function ProgressTracker({ courseProgress }) {
  return (
    <div className="bg-background-card p-md rounded-lg shadow-sm border border-gray-100 font-sans">
      <h3 className="text-xl font-bold text-text-primary mb-md">Course Progress</h3>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-primary-main h-4 rounded-full"
          style={{ width: `${courseProgress}%` }}
        ></div>
      </div>
      <p className="text-text-secondary text-sm mt-2 text-center">{courseProgress.toFixed(1)}% Completed</p>
    </div>
  );
}

ProgressTracker.propTypes = {
  courseProgress: PropTypes.number.isRequired,
};

export default ProgressTracker;
