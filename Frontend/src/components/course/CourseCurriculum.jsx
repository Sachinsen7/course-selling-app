import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

function CourseCurriculum({ sections, isEnrolledView = false, lectureProgressMap = {}, onLectureClick }) {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (!sections || sections.length === 0) {
    return <p className="text-text-secondary text-lg font-medium">No curriculum available yet.</p>;
  }

  return (
    <div className="space-y-md">
      {sections.map((section) => (
        <motion.div
          key={section._id}
          className="bg-background-card p-md rounded-md shadow-md border border-secondary-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            className="flex justify-between items-center w-full text-xl font-semibold text-text-primary mb-sm"
            onClick={() => toggleSection(section._id)}
          >
            <span>{section.title}</span>
            <motion.span
              animate={{ rotate: openSections[section._id] ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▼
            </motion.span>
          </button>
          <AnimatePresence>
            {openSections[section._id] && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-sm"
              >
                {section.lectures && section.lectures.length > 0 ? (
                  section.lectures.map((lecture) => (
                    <motion.li
                      key={lecture._id}
                      className={`flex items-center justify-between p-sm rounded-md transition-colors duration-200 ${
                        isEnrolledView ? 'cursor-pointer hover:bg-primary-light/10' : ''
                      } ${
                        lectureProgressMap[lecture._id]?.isCompleted
                          ? 'text-accent-success'
                          : 'text-text-secondary'
                      }`}
                      onClick={isEnrolledView && onLectureClick ? () => onLectureClick(lecture) : undefined}
                      whileHover={{ scale: isEnrolledView ? 1.02 : 1 }}
                    >
                      <span className="text-sm">
                        {lecture.order + 1}. {lecture.title} ({lecture.type})
                      </span>
                      {isEnrolledView && lectureProgressMap[lecture._id]?.isCompleted && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-accent-success"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {isEnrolledView && !lectureProgressMap[lecture._id]?.isCompleted && (
                        <span className="text-primary-main text-sm">Start</span>
                      )}
                    </motion.li>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm">No lectures in this section yet.</p>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
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