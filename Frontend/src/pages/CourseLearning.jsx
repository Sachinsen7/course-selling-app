import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectAuthLoading } from '../Redux/slices/authSlice';
import { showModal } from '../Redux/slices/uiSlice';
import { getEnrolledCourseDetails, updateLectureProgress, getCourseProgress } from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import VideoPlayer from '../components/learning/VideoPlayer';
import QuizComponent from '../components/learning/QuizAssessment';
import AssignmentComponent from '../components/learning/AssignmentComponent';
import ProgressTracker from '../components/learning/ProgressTracker';
import { motion } from 'framer-motion';

function CourseLearning() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lectureProgressMap, setLectureProgressMap] = useState({});
  const [overallCourseProgress, setOverallCourseProgress] = useState(0);

  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);
      setError(null);
      if (!isAuthenticated) {
        dispatch(showModal({
          isOpen: true,
          title: 'Access Denied',
          message: 'You must be logged in to access course learning content.',
          type: 'error',
        }));
        navigate('/login', { replace: true });
        return;
      }

      try {
        const data = await getEnrolledCourseDetails(courseId);
        setCourse(data.course);

        const initialProgress = {};
        data.course.sections.forEach(section => {
          section.lectures.forEach(lecture => {
            initialProgress[lecture._id] = {
              isCompleted: lecture.isCompleted,
              lastWatchedPosition: lecture.lastWatchedPosition,
            };
          });
        });
        setLectureProgressMap(initialProgress);

        const progressData = await getCourseProgress(courseId);
        setOverallCourseProgress(progressData.courseProgress);

        if (data.course.sections.length > 0) {
          let firstLecture = null;
          for (const section of data.course.sections) {
            if (section.lectures.length > 0) {
              const uncompletedLecture = section.lectures.find(lec => !initialProgress[lec._id]?.isCompleted);
              if (uncompletedLecture) {
                firstLecture = uncompletedLecture;
                break;
              }
              if (!firstLecture) firstLecture = section.lectures[0];
            }
          }
          setSelectedLecture(firstLecture);
        }
      } catch (err) {
        console.error('Error fetching learning data:', err);
        setError(err.message || 'Failed to load course learning content. Make sure you are enrolled.');
        dispatch(showModal({
          isOpen: true,
          title: 'Error',
          message: err.message || 'Failed to load course learning content. Make sure you are enrolled.',
          type: 'error',
        }));
        navigate(`/courses/${courseId}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchLearningData();
    }
  }, [courseId, isAuthenticated, user, authLoading, navigate, dispatch]);

  const handleLectureProgressUpdate = useCallback(async (lectureId, isCompleted, lastWatchedPosition = 0) => {
    try {
      await updateLectureProgress(lectureId, isCompleted, lastWatchedPosition);
      setLectureProgressMap(prev => ({
        ...prev,
        [lectureId]: { isCompleted, lastWatchedPosition }
      }));
      const updatedProgressData = await getCourseProgress(courseId);
      setOverallCourseProgress(updatedProgressData.courseProgress);

      dispatch(showModal({
        isOpen: true,
        title: 'Progress Updated',
        message: 'Lecture progress updated successfully.',
        type: 'success',
      }));
    } catch (err) {
      console.error('Error updating lecture progress:', err);
      dispatch(showModal({
        isOpen: true,
        title: 'Progress Update Failed',
        message: err.message || 'Could not update lecture progress.',
        type: 'error',
      }));
    }
  }, [courseId, dispatch]);

  const handleVideoProgress = useCallback((currentTime) => {
    if (selectedLecture && selectedLecture.type === 'video') {
      handleLectureProgressUpdate(selectedLecture._id, false, currentTime);
    }
  }, [selectedLecture, handleLectureProgressUpdate]);

  const handleVideoEnded = useCallback(() => {
    if (selectedLecture && selectedLecture.type === 'video') {
      handleLectureProgressUpdate(selectedLecture._id, true, selectedLecture.duration);
    }
  }, [selectedLecture, handleLectureProgressUpdate]);

  const handleQuizAssignmentComplete = useCallback((passed = true) => {
    if (selectedLecture) {
      handleLectureProgressUpdate(selectedLecture._id, passed);
    }
  }, [selectedLecture, handleLectureProgressUpdate]);

  // Custom SVG Icons
  const CheckIcon = () => (
    <svg className="w-5 h-5 text-[#4A8292]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  const WarningIcon = () => (
    <svg className="w-12 h-12 text-[#6B7280] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  if (authLoading || loading) return <Loader />;
  if (error) return (
    <div className="text-[#6B7280] text-center p-8 text-lg bg-[#F9FAFB] rounded-lg shadow-md border border-[#E5E7EB]">
      {error}
    </div>
  );
  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col lg:flex-row">
      {/* Sidebar for Course Curriculum */}
      <motion.aside
        className="lg:w-1/4 bg-[#F9FAFB] p-6 border-r border-[#E5E7EB] overflow-y-auto"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-serif font-bold text-[#1B3C53] mb-6 border-b border-[#1B3C53] pb-2">
          {course.title}
        </h2>
        {/* Overall Course Progress */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ProgressTracker courseProgress={overallCourseProgress} />
        </motion.div>

        <div className="space-y-4">
          {course.sections.map((section) => (
            <motion.div
              key={section._id}
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="font-serif font-semibold text-[#1B3C53] text-lg mb-2">{section.title}</h3>
              <ul className="space-y-1">
                {section.lectures.map((lecture) => (
                  <motion.li
                    key={lecture._id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-200
                      ${selectedLecture?._id === lecture._id ? 'bg-[#1B3C53] text-[#FFFFFF]' : 'hover:bg-[#E5E7EB] text-[#6B7280]'}
                      ${lectureProgressMap[lecture._id]?.isCompleted ? 'text-[#4A8292]' : ''}
                    `}
                    onClick={() => setSelectedLecture(lecture)}
                    whileHover={{ scale: 1.02 }}
                    aria-current={selectedLecture?._id === lecture._id ? 'true' : 'false'}
                    aria-label={`Select lecture: ${lecture.title}`}
                  >
                    <span>{lecture.order + 1}. {lecture.title}</span>
                    {lectureProgressMap[lecture._id]?.isCompleted && <CheckIcon />}
                    {selectedLecture?._id !== lecture._id && !lectureProgressMap[lecture._id]?.isCompleted && (
                      <span className="text-[#4A8292] text-sm">Not Completed</span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {selectedLecture ? (
          <motion.div
            className="bg-[#F9FAFB] p-8 rounded-lg shadow-md border border-[#E5E7EB]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-serif font-bold text-[#1B3C53] mb-4">{selectedLecture.title}</h2>
            <p className="text-[#6B7280] text-sm mb-6">Type: {selectedLecture.type}</p>

            {selectedLecture.type === 'video' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <VideoPlayer
                  src={selectedLecture.contentUrl}
                  onProgress={handleVideoProgress}
                  onEnded={handleVideoEnded}
                  lastWatchedPosition={lectureProgressMap[selectedLecture._id]?.lastWatchedPosition || 0}
                />
              </motion.div>
            )}

            {selectedLecture.type === 'text' && (
              <motion.div
                className="prose max-w-none text-[#1B3C53]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                dangerouslySetInnerHTML={{ __html: selectedLecture.textContent }}
              />
            )}

            {selectedLecture.type === 'quiz' && selectedLecture.quizId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <QuizComponent
                  quizId={selectedLecture.quizId}
                  onQuizComplete={handleQuizAssignmentComplete}
                  showModal={showModal}
                />
              </motion.div>
            )}

            {selectedLecture.type === 'quiz' && !selectedLecture.quizId && (
              <motion.div
                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <WarningIcon />
                <h3 className="text-lg font-serif font-semibold text-[#1B3C53] mb-2">Quiz Not Available</h3>
                <p className="text-[#6B7280]">
                  This quiz lecture is still being prepared by the instructor. Please check back later.
                </p>
              </motion.div>
            )}

            {selectedLecture.type === 'assignment' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <AssignmentComponent
                  lectureId={selectedLecture._id}
                  onAssignmentComplete={handleQuizAssignmentComplete}
                  showModal={showModal}
                />
              </motion.div>
            )}

            {(selectedLecture.type === 'text' || selectedLecture.type === 'video') && !lectureProgressMap[selectedLecture._id]?.isCompleted && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  text="Mark as Complete"
                  onClick={() => handleLectureProgressUpdate(selectedLecture._id, true)}
                  className="mt-6 px-6 py-3 bg-[#1B3C53] text-[#FFFFFF] rounded-full hover:bg-[#456882] transition-all duration-300 shadow-md"
                  aria-label="Mark lecture as complete"
                />
              </motion.div>
            )}
            {lectureProgressMap[selectedLecture._id]?.isCompleted && (
              <motion.p
                className="text-[#4A8292] font-semibold mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                This lecture is completed!
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="text-center text-[#6B7280] text-xl mt-8 bg-[#F9FAFB] p-8 rounded-lg shadow-md border border-[#E5E7EB]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Select a lecture from the sidebar to start learning!
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default CourseLearning;