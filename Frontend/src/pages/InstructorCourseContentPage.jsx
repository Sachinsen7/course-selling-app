import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getInstructorCourses,
  createSection,
  updateSection,
  deleteSection,
  createLecture,
  updateLecture,
  deleteLecture,
} from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Model'; 
import CourseCurriculum from '../components/course/CourseCurriculum';
import VideoPlayer from '../components/learning/VideoPlayer';
import QuizComponent from '../components/learning/QuizAssessment';
import AssignmentComponent from '../components/learning/AssignmentComponent';

function InstructorCourseContentPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, showModal } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Section 
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({ courseId, title: '', order: 0 });

  // Lecture
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [lectureFormData, setLectureFormData] = useState({
    sectionId: '',
    title: '',
    type: 'video',
    contentUrl: '',
    textContent: '',
    duration: 0,
    order: 0,
    isPublished: true,
  });


  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    itemType: '',
    itemId: null,
    itemTitle: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'instructor')) {
      showModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You must be an instructor to manage course content.',
        type: 'error',
      });
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!authLoading && user && user.role === 'instructor') {
      fetchCourseContent();
    }
  }, [courseId, user, authLoading, navigate, showModal]);

const fetchCourseContent = async () => {
  setLoading(true);
  setError(null);
  try {
    const instructorCoursesData = await getInstructorCourses();
    const courseDetails = instructorCoursesData.courses.find((c) => c._id === courseId);

    if (!courseDetails) {
      setError("Course not found or you don't own it.");
      setLoading(false);
      return;
    }

    const sections = Array.isArray(courseDetails.sections) ? courseDetails.sections : [];
    setCourse({ ...courseDetails, sections });
    setSectionFormData((prev) => ({
      ...prev,
      courseId,
      order: sections.length || 0,
    }));
  } catch (err) {
    console.error('Error fetching course content:', err);
    setError(err.message || 'Failed to load course content.');
    showModal({
      isOpen: true,
      title: 'Error',
      message: err.message || 'Failed to load course content.',
      type: 'error',
    });
  } finally {
    setLoading(false);
  }
};


const handleAddSectionClick = () => {
  setCurrentSection(null);
  const sections = Array.isArray(course?.sections) ? course.sections : [];
  const nextOrder = sections.length || 0;
  setSectionFormData({
    courseId,
    title: '',
    order: nextOrder,
  });
  setShowSectionForm(true);
};


  const handleEditSectionClick = (section) => {
    setCurrentSection(section);
    setSectionFormData({
      courseId,
      title: section.title,
      order: Number.isInteger(section.order) ? section.order : 0,
    });
    setShowSectionForm(true);
  };

  const handleSectionFormChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? Number(value) || 0 : value,
    }));
  };

  const handleSectionFormSubmit = async (e) => {
   e.preventDefault();
  setSubmitting(true);
  setError(null);


  if (!sectionFormData.title.trim() || sectionFormData.title.length < 3) {
    setError('Section title must be at least 3 characters long.');
    setSubmitting(false);
    return;
  }
  const order = Number(sectionFormData.order);
  if (!Number.isInteger(order) || order < 0 || isNaN(order)) {
    setError('Section order must be a non-negative integer.');
    setSubmitting(false);
    return;
  }
  if (!sectionFormData.courseId.match(/^[0-9a-fA-F]{24}$/)) {
    setError('Invalid course ID format.');
    setSubmitting(false);
    return;
  }

  const payload = {
    courseId: sectionFormData.courseId,
    title: sectionFormData.title,
    order,
  };
  console.log('Section form payload:', JSON.stringify(payload, null, 2));

    try {
      if (currentSection) {
        await updateSection(currentSection._id, payload);
        showModal({
          isOpen: true,
          title: 'Section Updated',
          message: 'Section updated successfully.',
          type: 'success',
        });
      } else {
        await createSection(payload);
        showModal({
          isOpen: true,
          title: 'Section Created',
          message: 'Section created successfully.',
          type: 'success',
        });
      }
      setShowSectionForm(false);
      setSectionFormData({
        courseId,
        title: '',
        order: course && Array.isArray(course.sections) ? course.sections.length + 1 : 0,
      });
      fetchCourseContent();
    } catch (err) {
      console.error('Error saving section:', err);
      setError(err.message || 'Failed to save section.');
      showModal({
        isOpen: true,
        title: 'Error',
        message: err.message || 'Failed to save section.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSectionConfirm = (sectionId, sectionTitle) => {
    setConfirmModal({
      isOpen: true,
      itemType: 'section',
      itemId: sectionId,
      itemTitle: sectionTitle,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await deleteSection(sectionId);
          showModal({
            isOpen: true,
            title: 'Section Deleted',
            message: `"${sectionTitle}" and its lectures deleted.`,
            type: 'success',
          });
          fetchCourseContent();
        } catch (err) {
          showModal({
            isOpen: true,
            title: 'Error',
            message: err.message || 'Failed to delete section.',
            type: 'error',
          });
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

const handleAddLectureClick = (sectionId) => {
  setCurrentLecture(null);
  const section = course?.sections?.find((s) => s._id === sectionId);
  const lectures = Array.isArray(section?.lectures) ? section.lectures : [];
  const nextOrder = lectures.length || 0;
  setLectureFormData({
    sectionId,
    title: '',
    type: 'video',
    contentUrl: '',
    textContent: '',
    duration: 0,
    order: nextOrder,
    isPublished: true,
  });
  setShowLectureForm(true);
};

  const handleEditLectureClick = (lecture) => {
    setCurrentLecture(lecture);
    setLectureFormData({
      sectionId: lecture.sectionId || course.sections.find((s) => s.lectures.some((l) => l._id === lecture._id))?._id,
      title: lecture.title,
      type: lecture.type,
      contentUrl: lecture.contentUrl || '',
      textContent: lecture.textContent || '',
      duration: Number.isInteger(lecture.duration) ? lecture.duration : 0,
      order: Number.isInteger(lecture.order) ? lecture.order : 0,
      isPublished: lecture.isPublished,
    });
    setShowLectureForm(true);
  };

  const handleLectureFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLectureFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'duration' || name === 'order' ? Number(value) || 0 : value,
    }));
  };

const handleLectureFormSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);


  if (!lectureFormData.title.trim() || lectureFormData.title.length < 3 || lectureFormData.title.length > 150) {
    setError('Lecture title must be between 3 and 150 characters.');
    setSubmitting(false);
    return;
  }
  const order = Number(lectureFormData.order);
  if (!Number.isInteger(order) || order < 0 || isNaN(order)) {
    setError('Lecture order must be a non-negative integer.');
    setSubmitting(false);
    return;
  }
  if (!lectureFormData.sectionId.match(/^[0-9a-fA-F]{24}$/)) {
    setError('Invalid section ID format.');
    setSubmitting(false);
    return;
  }
  if (lectureFormData.type === 'video') {
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (!lectureFormData.contentUrl.trim() || !urlRegex.test(lectureFormData.contentUrl)) {
      setError('Video lectures require a valid URL (e.g., https://...).');
      setSubmitting(false);
      return;
    }
    const duration = Number(lectureFormData.duration);
    if (!Number.isInteger(duration) || duration <= 0 || isNaN(duration)) {
      setError('Video lectures require a positive integer duration in seconds.');
      setSubmitting(false);
      return;
    }
  }
  if (lectureFormData.type === 'text' && (!lectureFormData.textContent.trim() || lectureFormData.textContent.length < 10)) {
    setError('Text lectures require content with at least 10 characters.');
    setSubmitting(false);
    return;
  }
  if (lectureFormData.type === 'assignment') {
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (!lectureFormData.contentUrl.trim() || !urlRegex.test(lectureFormData.contentUrl)) {
      setError('Assignment lectures require a valid URL.');
      setSubmitting(false);
      return;
    }
  }
  if (!['video', 'text', 'quiz', 'assignment'].includes(lectureFormData.type)) {
    setError('Invalid lecture type.');
    setSubmitting(false);
    return;
  }

  const payload = {
    sectionId: lectureFormData.sectionId,
    title: lectureFormData.title,
    type: lectureFormData.type,
    contentUrl: lectureFormData.type === 'video' || lectureFormData.type === 'assignment' ? lectureFormData.contentUrl : undefined,
    textContent: lectureFormData.type === 'text' ? lectureFormData.textContent : undefined,
    duration: lectureFormData.type === 'video' ? Number(lectureFormData.duration) : undefined,
    order,
    isPublished: lectureFormData.isPublished,
  };
  console.log('Lecture form payload:', JSON.stringify(payload, null, 2));

  try {
    if (currentLecture) {
      await updateLecture(currentLecture._id, payload);
      showModal({
        isOpen: true,
        title: 'Lecture Updated',
        message: 'Lecture updated successfully.',
        type: 'success',
      });
    } else {
      await createLecture(courseId, lectureFormData.sectionId, payload);
      showModal({
        isOpen: true,
        title: 'Lecture Created',
        message: 'Lecture created successfully.',
        type: 'success',
      });
    }
    setShowLectureForm(false);
    fetchCourseContent();
  } catch (err) {
    console.error('Error saving lecture:', err);
    setError(err.message || 'Failed to save lecture.');
    showModal({
      isOpen: true,
      title: 'Error',
      message: err.message || 'Failed to save lecture.',
      type: 'error',
    });
  } finally {
    setSubmitting(false);
  }
};
  const handleDeleteLectureConfirm = (lectureId, lectureTitle) => {
    setConfirmModal({
      isOpen: true,
      itemType: 'lecture',
      itemId: lectureId,
      itemTitle: lectureTitle,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await deleteLecture(lectureId);
          showModal({
            isOpen: true,
            title: 'Lecture Deleted',
            message: `"${lectureTitle}" deleted.`,
            type: 'success',
          });
          fetchCourseContent();
        } catch (err) {
          showModal({
            isOpen: true,
            title: 'Error',
            message: err.message || 'Failed to delete lecture.',
            type: 'error',
          });
        } finally {
          setSubmitting(false);
        }
      },
    });
  };


  if (authLoading || loading) return <Loader />;
  if (error && !course) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!user || user.role !== 'instructor' || !course) return null;

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-lg">Manage Content for "{course.title}"</h1>
        <p className="text-lg text-text-secondary text-center mb-xl">Organize sections and lectures for your course.</p>


        <div className="mb-xl">
          <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">Course Sections</h2>
          <div className="flex justify-end mb-md">
            <Button
              text="Add New Section"
              onClick={handleAddSectionClick}
              className="px-md py-sm bg-primary-main text-background-card hover:bg-primary-light transition-all duration-200"
            />
          </div>
          {course.sections.length === 0 ? (
            <p className="text-center text-text-secondary text-lg mt-8">No sections added yet. Start by adding one!</p>
          ) : (
            <div className="space-y-md">
              {course.sections.sort((a, b) => (Number.isInteger(a.order) ? a.order : 0) - (Number.isInteger(b.order) ? b.order : 0)).map((section) => (
                <div key={section._id} className="bg-background-card p-md rounded-lg shadow-sm border border-secondary-light">
                  <div className="flex justify-between items-center mb-sm">
                    <h3 className="text-xl font-semibold text-text-primary">
                      {Number.isInteger(section.order) ? section.order + 1 : 1}. {section.title}
                    </h3>
                    <div className="flex space-x-sm">
                      <Button
                        text="Add Lecture"
                        onClick={() => handleAddLectureClick(section._id)}
                        variant="secondary"
                        className="px-sm py-xs text-sm bg-secondary-main text-background-card hover:bg-secondary-light"
                      />
                      <Button
                        text="Edit"
                        onClick={() => handleEditSectionClick(section)}
                        variant="outline"
                        className="px-sm py-xs text-sm border-secondary-light text-text-primary hover:bg-secondary-light hover:text-background-card"
                      />
                      <Button
                        text="Delete"
                        onClick={() => handleDeleteSectionConfirm(section._id, section.title)}
                        className="px-sm py-xs text-sm bg-accent-error text-background-card hover:bg-red-700"
                      />
                    </div>
                  </div>
                  {section.lectures.length > 0 ? (
                    <ul className="space-y-1 ml-md">
                      {section.lectures.sort((a, b) => (Number.isInteger(a.order) ? a.order : 0) - (Number.isInteger(b.order) ? b.order : 0)).map((lecture) => (
                        <li
                          key={lecture._id}
                          className="flex items-center justify-between text-text-secondary text-sm p-sm hover:bg-secondary-light/10 rounded-md"
                        >
                          <span className="flex-1 mr-md">
                            <i className="fas fa-play-circle mr-sm text-primary-main"></i>
                            {Number.isInteger(lecture.order) ? lecture.order + 1 : 1}. {lecture.title} ({lecture.type})
                          </span>
                          <div className="flex space-x-sm">
                            <Button
                              text="Edit"
                              onClick={() => handleEditLectureClick(lecture)}
                              variant="outline"
                              className="px-sm py-xs text-xs border-secondary-light text-text-primary hover:bg-secondary-light hover:text-background-card"
                            />
                            <Button
                              text="Delete"
                              onClick={() => handleDeleteLectureConfirm(lecture._id, lecture.title)}
                              className="px-sm py-xs text-xs bg-accent-error text-background-card hover:bg-red-700"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-text-secondary text-sm ml-md">No lectures in this section yet.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


        <Modal
          isOpen={showSectionForm}
          onClose={() => setShowSectionForm(false)}
          title={currentSection ? 'Edit Section' : 'Add New Section'}
          type="info"
        >
          <form onSubmit={handleSectionFormSubmit} className="space-y-md">
            {error && <p className="text-accent-error text-center mb-md">{error}</p>}
            <div>
              <label htmlFor="sectionTitle" className="block text-text-primary text-sm font-semibold mb-sm">
                Section Title
              </label>
              <input
                type="text"
                id="sectionTitle"
                name="title"
                value={sectionFormData.title}
                onChange={handleSectionFormChange}
                className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="sectionOrder" className="block text-text-primary text-sm font-semibold mb-sm">
                Order (Position)
              </label>
              <input
                type="number"
                id="sectionOrder"
                name="order"
                value={sectionFormData.order}
                onChange={handleSectionFormChange}
                min="0"
                step="1"
                className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                required
                disabled={submitting}
              />
            </div>
            <Button
              text={submitting ? 'Saving...' : 'Save Section'}
              type="submit"
              className="w-full px-lg py-md bg-primary-main text-background-card hover:bg-primary-light transition-all duration-200"
              disabled={submitting}
            />
          </form>
        </Modal>


        <Modal
          isOpen={showLectureForm}
          onClose={() => setShowLectureForm(false)}
          title={currentLecture ? 'Edit Lecture' : 'Add New Lecture'}
          type="info"
        >
          <form onSubmit={handleLectureFormSubmit} className="space-y-md">
            {error && <p className="text-accent-error text-center mb-md">{error}</p>}
            <div>
              <label htmlFor="lectureTitle" className="block text-text-primary text-sm font-semibold mb-sm">
                Lecture Title
              </label>
              <input
                type="text"
                id="lectureTitle"
                name="title"
                value={lectureFormData.title}
                onChange={handleLectureFormChange}
                className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="lectureType" className="block text-text-primary text-sm font-semibold mb-sm">
                Lecture Type
              </label>
              <select
                id="lectureType"
                name="type"
                value={lectureFormData.type}
                onChange={handleLectureFormChange}
                className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                required
                disabled={submitting || currentLecture}
              >
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            {(lectureFormData.type === 'video' || lectureFormData.type === 'assignment') && (
              <div>
                <label htmlFor="contentUrl" className="block text-text-primary text-sm font-semibold mb-sm">
                  Content URL (Video/File Link)
                </label>
                <input
                  type="url"
                  id="contentUrl"
                  name="contentUrl"
                  value={lectureFormData.contentUrl}
                  onChange={handleLectureFormChange}
                  placeholder="e.g., https://youtube.com/embed/..."
                  className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                  required={lectureFormData.type === 'video' || lectureFormData.type === 'assignment'}
                  disabled={submitting}
                />
                {lectureFormData.type === 'video' && lectureFormData.contentUrl && (
                  <div className="mt-md">
                    <VideoPlayer src={lectureFormData.contentUrl} />
                    <p className="text-text-secondary text-sm mt-sm">Video preview above.</p>
                  </div>
                )}
              </div>
            )}
            {lectureFormData.type === 'text' && (
              <div>
                <label htmlFor="textContent" className="block text-text-primary text-sm font-semibold mb-sm">
                  Text Content
                </label>
                <textarea
                  id="textContent"
                  name="textContent"
                  rows="6"
                  value={lectureFormData.textContent}
                  onChange={handleLectureFormChange}
                  placeholder="Enter your lecture content here..."
                  className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                  required={lectureFormData.type === 'text'}
                  disabled={submitting}
                ></textarea>
              </div>
            )}
            {lectureFormData.type === 'video' && (
              <div>
                <label htmlFor="duration" className="block text-text-primary text-sm font-semibold mb-sm">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={lectureFormData.duration}
                  onChange={handleLectureFormChange}
                  min="0"
                  step="1"
                  className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                  required={lectureFormData.type === 'video'}
                  disabled={submitting}
                />
              </div>
            )}
            {(lectureFormData.type === 'quiz' || lectureFormData.type === 'assignment') && !currentLecture && (
              <p className="text-accent-warning text-sm mt-md">
                Note: After creating this {lectureFormData.type} lecture, you will need to go to the Course Learning page to add
                questions (for Quiz) or define assignment details.
              </p>
            )}
            {currentLecture && lectureFormData.type === 'quiz' && currentLecture.quizId && (
              <div className="mt-md">
                <h4 className="text-lg font-bold text-text-primary mb-sm">Quiz Preview/Link</h4>
                <QuizComponent quizId={currentLecture.quizId} onQuizComplete={() => {}} showModal={showModal} />
              </div>
            )}
            {currentLecture && lectureFormData.type === 'assignment' && currentLecture.assignmentSubmissionId && (
              <div className="mt-md">
                <h4 className="text-lg font-bold text-text-primary mb-sm">Assignment Preview/Link</h4>
                <AssignmentComponent lectureId={currentLecture._id} onAssignmentComplete={() => {}} showModal={showModal} />
              </div>
            )}
            <div>
              <label htmlFor="lectureOrder" className="block text-text-primary text-sm font-semibold mb-sm">
                Order (Position)
              </label>
              <input
                type="number"
                id="lectureOrder"
                name="order"
                value={lectureFormData.order}
                onChange={handleLectureFormChange}
                min="0"
                step="1"
                className="w-full px-md py-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="flex items-center text-text-primary text-sm font-semibold">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={lectureFormData.isPublished}
                  onChange={handleLectureFormChange}
                  className="mr-sm accent-primary-main"
                  disabled={submitting}
                />
                Published (Visible to students)
              </label>
            </div>
            <Button
              text={submitting ? 'Saving...' : 'Save Lecture'}
              type="submit"
              className="w-full px-lg py-md bg-primary-main text-background-card hover:bg-primary-light transition-all duration-200"
              disabled={submitting}
            />
          </form>
        </Modal>


        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          title={`Confirm Delete ${confirmModal.itemType}`}
          message={`Are you sure you want to delete "${confirmModal.itemTitle}"? This will also delete all associated content (e.g., lectures in a section, quizzes/submissions in a lecture). This action cannot be undone.`}
          type="warning"
        >
          <div className="flex justify-center space-x-md mt-md">
            <Button
              text="Cancel"
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-md py-sm bg-gray-300 text-text-primary hover:bg-gray-400 transition-all duration-200"
            />
            <Button
              text="Delete"
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              }}
              className="px-md py-sm bg-accent-error text-background-card hover:bg-red-700 transition-all duration-200"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default InstructorCourseContentPage;