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

  // Fetch enrolled course details and overall progress
  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);
      setError(null);
      if (!isAuthenticated) {
        showModal({
          isOpen: true,
          title: "Access Denied",
          message: "You must be logged in to access course learning content.",
          type: "error",
        });
        navigate('/login', { replace: true });
        return;
      }

      try {
        const data = await getEnrolledCourseDetails(courseId);
        setCourse(data.course);

        // Build initial progress map from fetched course data
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

        // Fetch overall course progress
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
        console.error("Error fetching learning data:", err);
        setError(err.message || "Failed to load course learning content. Make sure you are enrolled.");
        showModal({
          isOpen: true,
          title: "Error",
          message: err.message || "Failed to load course learning content. Make sure you are enrolled.",
          type: "error",
        });
        navigate(`/courses/${courseId}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchLearningData();
    }
  }, [courseId, isAuthenticated, user, authLoading, navigate, showModal]);

  // Callback for updating lecture progress
  const handleLectureProgressUpdate = useCallback(async (lectureId, isCompleted, lastWatchedPosition = 0) => {
    try {
      await updateLectureProgress(lectureId, isCompleted, lastWatchedPosition);
      setLectureProgressMap(prev => ({
        ...prev,
        [lectureId]: { isCompleted, lastWatchedPosition }
      }));
     
      const updatedProgressData = await getCourseProgress(courseId);
      setOverallCourseProgress(updatedProgressData.courseProgress);

      showModal({
        isOpen: true,
        title: "Progress Updated",
        message: `Lecture progress updated successfully.`,
        type: "success",
      });
    } catch (err) {
      console.error("Error updating lecture progress:", err);
      showModal({
        isOpen: true,
        title: "Progress Update Failed",
        message: err.message || "Could not update lecture progress.",
        type: "error",
      });
    }
  }, [courseId, showModal]);

  // Callbacks for VideoPlayer
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

  // Callback for Quiz/Assignment completion
  const handleQuizAssignmentComplete = useCallback((passed = true) => {
    if (selectedLecture) {
      handleLectureProgressUpdate(selectedLecture._id, passed);
    }
  }, [selectedLecture, handleLectureProgressUpdate]);


  if (authLoading || loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-background-main font-sans flex flex-col lg:flex-row">
      {/* Sidebar for Course Curriculum */}
      <div className="lg:w-1/4 bg-background-card p-md shadow-lg border-r border-gray-100 overflow-y-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-lg border-b pb-sm">
          {course.title}
        </h2>
        {/* Overall Course Progress */}
        <div className="mb-lg">
          <ProgressTracker courseProgress={overallCourseProgress} />
        </div>

        <div className="space-y-md">
          {course.sections.map((section) => (
            <div key={section._id} className="mb-md">
              <h3 className="font-semibold text-text-primary text-lg mb-sm">{section.title}</h3>
              <ul className="space-y-1">
                {section.lectures.map((lecture) => (
                  <li
                    key={lecture._id}
                    className={`flex items-center justify-between p-sm rounded-md cursor-pointer transition-colors duration-200
                      ${selectedLecture?._id === lecture._id ? 'bg-primary-light text-white' : 'hover:bg-gray-100 text-text-secondary'}
                      ${lectureProgressMap[lecture._id]?.isCompleted ? 'text-accent-success' : ''}
                    `}
                    onClick={() => setSelectedLecture(lecture)}
                  >
                    <span>{lecture.order + 1}. {lecture.title}</span>
                    {lectureProgressMap[lecture._id]?.isCompleted && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-success ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {selectedLecture?._id !== lecture._id && !lectureProgressMap[lecture._id]?.isCompleted && (
                        <span className="text-primary-main text-sm ml-2">Not Completed</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-lg overflow-y-auto">
        {selectedLecture ? (
          <div className="bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
            <h2 className="text-3xl font-bold text-text-primary mb-md">{selectedLecture.title}</h2>
            <p className="text-text-secondary text-sm mb-lg">Type: {selectedLecture.type}</p>

            {selectedLecture.type === 'video' && (
              <VideoPlayer
                src={selectedLecture.contentUrl}
                onProgress={handleVideoProgress}
                onEnded={handleVideoEnded}
                lastWatchedPosition={lectureProgressMap[selectedLecture._id]?.lastWatchedPosition || 0}
              />
            )}

            {selectedLecture.type === 'text' && (
              <div className="prose max-w-none text-text-primary" dangerouslySetInnerHTML={{ __html: selectedLecture.textContent }}></div>
            )}

            {selectedLecture.type === 'quiz' && selectedLecture.quizId && (
              <QuizComponent
                quizId={selectedLecture.quizId}
                onQuizComplete={handleQuizAssignmentComplete}
                showModal={showModal}
              />
            )}

            {selectedLecture.type === 'quiz' && !selectedLecture.quizId && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-yellow-600 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Quiz Not Available</h3>
                <p className="text-yellow-700">
                  This quiz lecture is still being prepared by the instructor. Please check back later.
                </p>
              </div>
            )}

            {selectedLecture.type === 'assignment' && (
              <AssignmentComponent
                lectureId={selectedLecture._id}
                onAssignmentComplete={handleQuizAssignmentComplete}
                showModal={showModal}
              />
            )}

            {/* Mark as Complete Button (for text/video if not auto-completed) */}
            {(selectedLecture.type === 'text' || selectedLecture.type === 'video') && !lectureProgressMap[selectedLecture._id]?.isCompleted && (
              <Button
                text="Mark as Complete"
                onClick={() => handleLectureProgressUpdate(selectedLecture._id, true)}
                className="mt-xl px-lg py-md"
              />
            )}
            {lectureProgressMap[selectedLecture._id]?.isCompleted && (
              <p className="text-accent-success font-semibold mt-xl">This lecture is completed!</p>
            )}

          </div>
        ) : (
          <div className="text-center text-text-secondary text-xl mt-xl bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
            Select a lecture from the sidebar to start learning!
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseLearning;
