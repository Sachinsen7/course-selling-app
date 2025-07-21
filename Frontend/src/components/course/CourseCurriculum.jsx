import React from 'react';
import PropTypes from 'prop-types';

function CourseCurriculum({ sections, isEnrolledView = false, lectureProgressMap = {}, onLectureClick }) {
  if (!sections || sections.length === 0) {
    return <p className="text-text-secondary text-lg">No curriculum available yet.</p>;
  }

  return (
    <div className="space-y-md"> 
      {sections.map((section) => (
        <div key={section._id} className="bg-background-main p-md rounded-md shadow-sm border border-gray-100"> {/* Use theme spacing */}
          <h3 className="text-xl font-semibold text-text-primary mb-sm">{section.title}</h3> {/* Use theme spacing */}
          {section.lectures && section.lectures.length > 0 ? (
            <ul className="space-y-1">
              {section.lectures.map((lecture) => (
                <li
                  key={lecture._id}
                  className={`flex items-center justify-between p-sm rounded-md transition-colors duration-200
                    ${isEnrolledView ? 'cursor-pointer hover:bg-gray-100' : ''}
                    ${lectureProgressMap[lecture._id]?.isCompleted ? 'text-accent-success' : 'text-text-secondary'}
                  `}
                  onClick={isEnrolledView && onLectureClick ? () => onLectureClick(lecture) : undefined}
                >
                  <span>{lecture.order + 1}. {lecture.title} ({lecture.type})</span>
                  {isEnrolledView && lectureProgressMap[lecture._id]?.isCompleted && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-success ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isEnrolledView && !lectureProgressMap[lecture._id]?.isCompleted && (
                      <span className="text-primary-main text-sm ml-2">Not Completed</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm">No lectures in this section yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}

CourseCurriculum.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      order: PropTypes.number,
      lectures: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          order: PropTypes.number,
        })
      ),
    })
  ).isRequired,
  isEnrolledView: PropTypes.bool,
  lectureProgressMap: PropTypes.object, 
  onLectureClick: PropTypes.func, 
};

export default CourseCurriculum;
