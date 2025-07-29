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
import Modal from '../components/common/Modal';
import CourseCurriculum from '../components/course/CourseCurriculum';
import VideoPlayer from '../components/learning/VideoPlayer';
import QuizComponent from '../components/learning/QuizAssessment';
import AssignmentComponent from '../components/learning/AssignmentComponent';
import { motion } from 'framer-motion';

const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);

function InstructorCourseContentPage() {
  const { id: courseId } = useParams(); 
  const navigate = useNavigate(); 
  const { user, loading: authLoading, showModal } = useAuth(); 

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false); 


  const [showSectionForm, setShowSectionForm] = useState(false);
  const [currentSection, setCurrentSection] = useState(null); 
  const [sectionFormData, setSectionFormData] = useState({ courseId, title: '', order: 0 });


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
      const instructorCoursesData = await withTimeout(getInstructorCourses());
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
        order: sections.length || 0
      }));
    } catch (err) {
      console.error('Error fetching course content:', err, { response: err.response?.data });
      setError(err.response?.status === 404 ? 'Course not found.' : err.message || 'Failed to load course content.');
      showModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.status === 404 ? 'Course not found.' : err.message || 'Failed to load course content.',
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
    e.stopPropagation();
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

    try {
      if (currentSection) {
        await withTimeout(updateSection(currentSection._id, payload));
        showModal({
          isOpen: true,
          title: 'Section Updated',
          message: 'Section updated successfully.',
          type: 'success',
        });
      } else {
        await withTimeout(createSection(payload));
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
      console.error('Error saving section:', err, { response: err.response?.data });
      setError(err.response?.data?.message || err.message || 'Failed to save section.');
      showModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Failed to save section.',
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
          await withTimeout(deleteSection(sectionId));
          showModal({
            isOpen: true,
            title: 'Section Deleted',
            message: `"${sectionTitle}" and its lectures deleted.`,
            type: 'success',
          });
          fetchCourseContent(); 
        } catch (err) {
          console.error('Error deleting section:', err, { response: err.response?.data });
          showModal({
            isOpen: true,
            title: 'Error',
            message: err.response?.data?.message || err.message || 'Failed to delete section.',
            type: 'error',
          });
        } finally {
          setSubmitting(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false })); 
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
      sectionId: lecture.sectionId || course.sections.find((s) => s.lectures.some((l) => l._id === lecture._id))?._id || '',
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
    e.stopPropagation();
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
      order,
      isPublished: lectureFormData.isPublished,
      ...(lectureFormData.type === 'video' || lectureFormData.type === 'assignment' ? { contentUrl: lectureFormData.contentUrl } : {}),
      ...(lectureFormData.type === 'text' ? { textContent: lectureFormData.textContent } : {}),
      ...(lectureFormData.type === 'video' ? { duration: Number(lectureFormData.duration) } : {}),
    };

    try {
      console.log('Lecture payload:', payload); 
      if (currentLecture) {
        await withTimeout(updateLecture(currentLecture._id, payload));
        showModal({
          isOpen: true,
          title: 'Lecture Updated',
          message: 'Lecture updated successfully.',
          type: 'success',
        });
      } else {
        await withTimeout(createLecture(courseId, lectureFormData.sectionId, payload));
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
      console.error('Error saving lecture:', err, { response: err.response?.data });
      setError(err.response?.data?.message || err.message || 'Failed to save lecture.');
      showModal({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Failed to save lecture.',
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
          await withTimeout(deleteLecture(lectureId));
          showModal({
            isOpen: true,
            title: 'Lecture Deleted',
            message: `"${lectureTitle}" deleted.`,
            type: 'success',
          });
          fetchCourseContent(); 
        } catch (err) {
          console.error('Error deleting lecture:', err, { response: err.response?.data });
          showModal({
            isOpen: true,
            title: 'Error',
            message: err.response?.data?.message || err.message || 'Failed to delete lecture.',
            type: 'error',
          });
        } finally {
          setSubmitting(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false })); 
        }
      },
    });
  };


  if (authLoading || loading) return <Loader />;
  if (error && !course) return (
    <div className="text-[#DC2626] text-center p-8 text-xl font-medium flex items-center justify-center">
      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {error}
    </div>
  );

  if (!user || user.role !== 'instructor' || !course) return null;

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6 font-sans">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B3C53] text-center mb-4 tracking-tight">
            Manage Content for "{course.title}"
          </h1>
          <p className="text-base text-[#6B7280] text-center mb-8">
            Organize sections and lectures to build your course.
          </p>
        </motion.div>

        <motion.section
          className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-[#1B3C53] border-l-4 border-[#4A8292] pl-3 mb-4">
            Course Structure Preview
          </h2>
          <CourseCurriculum
            sections={course.sections}
            isEnrolledView={false}
            className="space-y-4"
            aria-label="Preview of course curriculum"
          />
        </motion.section>

        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-[#1B3C53] border-l-4 border-[#4A8292] pl-3 mb-4">
            Course Sections
          </h2>
          <div className="flex justify-end mb-4">
            <Button
              text="Add New Section"
              onClick={handleAddSectionClick}
              className="px-6 py-2 bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-md"
              aria-label="Add a new section"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Section
            </Button>
          </div>
          {course.sections.length === 0 ? (
            <div className="text-[#6B7280] text-base font-medium flex items-center justify-center py-6">
              <svg className="w-5 h-5 mr-2 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 006 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              No sections added yet. Start by adding one!
            </div>
          ) : (
            <div className="space-y-4">
              {course.sections
                .sort((a, b) => (Number.isInteger(a.order) ? a.order : 0) - (Number.isInteger(b.order) ? b.order : 0))
                .map((section) => (
                  <div
                    key={section._id}
                    className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB] shadow-sm"
                    role="region"
                    aria-label={`Section: ${section.title}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-[#1B3C53]">
                        {Number.isInteger(section.order) ? section.order + 1 : 1}. {section.title}
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          text="Add Lecture"
                          onClick={() => handleAddLectureClick(section._id)}
                          className="px-4 py-1 bg-[#4A8292] text-[#FFFFFF] hover:bg-[#5B9EB3] rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105"
                          aria-label={`Add lecture to ${section.title}`}
                        />
                        <Button
                          text="Edit"
                          onClick={() => handleEditSectionClick(section)}
                          className="px-4 py-1 border border-[#E5E7EB] text-[#1B3C53] hover:bg-[#F9FAFB] rounded-md text-sm font-medium transition-all duration-200"
                          aria-label={`Edit ${section.title}`}
                        />
                        <Button
                          text="Delete"
                          onClick={() => handleDeleteSectionConfirm(section._id, section.title)}
                          className="px-4 py-1 bg-[#DC2626] text-[#FFFFFF] hover:bg-[#B91C1C] rounded-md text-sm font-medium transition-all duration-200"
                          aria-label={`Delete ${section.title}`}
                        />
                      </div>
                    </div>
                    {section.lectures.length > 0 ? (
                      // List of lectures within the section
                      <ul className="space-y-2 ml-4">
                        {section.lectures
                          .sort((a, b) => (Number.isInteger(a.order) ? a.order : 0) - (Number.isInteger(b.order) ? b.order : 0))
                          .map((lecture) => (
                            <li
                              key={lecture._id}
                              className="flex items-center justify-between text-[#6B7280] text-sm p-2 hover:bg-[#F9FAFB] rounded-md transition-all duration-200"
                            >
                              <span className="flex-1 mr-4 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {Number.isInteger(lecture.order) ? lecture.order + 1 : 1}. {lecture.title} ({lecture.type})
                                {!lecture.isPublished && (
                                  <span className="ml-2 text-xs text-[#D97706] font-medium">[Draft]</span>
                                )}
                              </span>
                              <div className="flex space-x-2">
                                <Button
                                  text="Edit"
                                  onClick={() => handleEditLectureClick(lecture)}
                                  className="px-3 py-1 border border-[#E5E7EB] text-[#1B3C53] hover:bg-[#F9FAFB] rounded-md text-xs font-medium transition-all duration-200"
                                  aria-label={`Edit ${lecture.title}`}
                                />
                                <Button
                                  text="Delete"
                                  onClick={() => handleDeleteLectureConfirm(lecture._id, lecture.title)}
                                  className="px-3 py-1 bg-[#DC2626] text-[#FFFFFF] hover:bg-[#B91C1C] rounded-md text-xs font-medium transition-all duration-200"
                                  aria-label={`Delete ${lecture.title}`}
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      // Message when no lectures in a section
                      <p className="text-[#6B7280] text-sm ml-4 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 006 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        No lectures in this section yet.
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </motion.section>
        <Modal
          isOpen={showSectionForm}
          onClose={() => {
            setShowSectionForm(false);
            setError(null);
            setSubmitting(false);
          }}
          title={currentSection ? 'Edit Section' : 'Add New Section'}
          type="info"
          loading={submitting}
        >
          <form onSubmit={handleSectionFormSubmit} className="space-y-4">
            {error && (
              <p className="text-[#DC2626] text-sm text-center flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
            <div>
              <label htmlFor="sectionTitle" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Section Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sectionTitle"
                  name="title"
                  value={sectionFormData.title}
                  onChange={handleSectionFormChange}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                  required
                  disabled={submitting}
                  aria-describedby="sectionTitle-error"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div>
              <label htmlFor="sectionOrder" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Order (Position)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="sectionOrder"
                  name="order"
                  value={sectionFormData.order}
                  onChange={handleSectionFormChange}
                  min="0"
                  step="1"
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                  required
                  disabled={submitting}
                  aria-describedby="sectionOrder-error"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
            </div>
            <Button
              text={submitting ? 'Saving...' : 'Save Section'}
              type="submit"
              className="w-full px-6 py-2 bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-md"
              disabled={submitting}
              aria-label="Save section"
            >
              <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {submitting ? 'Saving...' : 'Save Section'}
            </Button>
          </form>
        </Modal>

        <Modal
          isOpen={showLectureForm}
          onClose={() => {
            setShowLectureForm(false);
            setError(null);
            setSubmitting(false);
          }}
          title={currentLecture ? 'Edit Lecture' : 'Add New Lecture'}
          type="info"
          loading={submitting}
        >
          <form onSubmit={handleLectureFormSubmit} className="space-y-4">
            {error && (
              <p className="text-[#DC2626] text-sm text-center flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
            <div>
              <label htmlFor="lectureTitle" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Lecture Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="lectureTitle"
                  name="title"
                  value={lectureFormData.title}
                  onChange={handleLectureFormChange}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                  required
                  disabled={submitting}
                  aria-describedby="lectureTitle-error"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div>
              <label htmlFor="lectureType" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Lecture Type
              </label>
              <div className="relative">
                <select
                  id="lectureType"
                  name="type"
                  value={lectureFormData.type}
                  onChange={handleLectureFormChange}
                  className="w-full pl-10 pr-8 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed appearance-none"
                  required
                  disabled={submitting || currentLecture} 
                  aria-describedby="lectureType-error"
                >
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {(lectureFormData.type === 'video' || lectureFormData.type === 'assignment') && (
              <div>
                <label htmlFor="contentUrl" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                  Content URL (Video/File Link)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="contentUrl"
                    name="contentUrl"
                    value={lectureFormData.contentUrl}
                    onChange={handleLectureFormChange}
                    placeholder="e.g., https://youtube.com/embed/..."
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                    required={lectureFormData.type === 'video' || lectureFormData.type === 'assignment'}
                    disabled={submitting}
                    aria-describedby="contentUrl-error"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                  </svg>
                </div>
                {lectureFormData.type === 'video' && lectureFormData.contentUrl && (
                  <div className="mt-4">
                    <VideoPlayer src={lectureFormData.contentUrl} />
                    <p className="text-[#6B7280] text-sm mt-2">Video preview above.</p>
                  </div>
                )}
              </div>
            )}
            {lectureFormData.type === 'text' && (
              <div>
                <label htmlFor="textContent" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                  Text Content
                </label>
                <div className="relative">
                  <textarea
                    id="textContent"
                    name="textContent"
                    rows="6"
                    value={lectureFormData.textContent}
                    onChange={handleLectureFormChange}
                    placeholder="Enter your lecture content here..."
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                    required={lectureFormData.type === 'text'}
                    disabled={submitting}
                    aria-describedby="textContent-error"
                  />
                  <svg className="absolute left-3 top-4 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h13M3 12h6m-6 4h6" />
                  </svg>
                </div>
              </div>
            )}
            {lectureFormData.type === 'video' && (
              <div>
                <label htmlFor="duration" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                  Duration (seconds)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={lectureFormData.duration}
                    onChange={handleLectureFormChange}
                    min="0"
                    step="1"
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                    required={lectureFormData.type === 'video'}
                    disabled={submitting}
                    aria-describedby="duration-error"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            )}
            {(lectureFormData.type === 'quiz' || lectureFormData.type === 'assignment') && !currentLecture && (
              <p className="text-[#D97706] text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Note: After creating this {lectureFormData.type} lecture, go to the Course Learning page to add questions (for Quiz) or define assignment details.
              </p>
            )}
            {currentLecture && lectureFormData.type === 'quiz' && currentLecture.quizId && (
              <div className="mt-4">
                <h4 className="text-base font-semibold text-[#1B3C53] mb-2">Quiz Preview/Link</h4>
                <QuizComponent quizId={currentLecture.quizId} onQuizComplete={() => {}} showModal={showModal} />
              </div>
            )}
            {currentLecture && lectureFormData.type === 'assignment' && currentLecture.assignmentSubmissionId && (
              <div className="mt-4">
                <h4 className="text-base font-semibold text-[#1B3C53] mb-2">Assignment Preview/Link</h4>
                <AssignmentComponent lectureId={currentLecture._id} onAssignmentComplete={() => {}} showModal={showModal} />
              </div>
            )}
            <div>
              <label htmlFor="lectureOrder" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Order (Position)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="lectureOrder"
                  name="order"
                  value={lectureFormData.order}
                  onChange={handleLectureFormChange}
                  min="0"
                  step="1"
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed"
                  required
                  disabled={submitting}
                  aria-describedby="lectureOrder-error"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
            </div>
            <div>
              <label className="flex items-center text-[#1B3C53] text-sm font-semibold">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={lectureFormData.isPublished}
                  onChange={handleLectureFormChange}
                  className="mr-2 accent-[#4A8292] focus:ring-[#4A8292]"
                  disabled={submitting}
                  aria-label="Publish lecture"
                />
                Published (Visible to students)
              </label>
            </div>
            <Button
              text={submitting ? 'Saving...' : 'Save Lecture'}
              type="submit"
              className="w-full px-6 py-2 bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-md"
              disabled={submitting}
              aria-label="Save lecture"
            >
              <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {submitting ? 'Saving...' : 'Save Lecture'}
            </Button>
          </form>
        </Modal>

        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            setSubmitting(false);
          }}
          title={`Confirm Delete ${confirmModal.itemType}`}
          message={`Are you sure you want to delete "${confirmModal.itemTitle}"? This will also delete all associated content (e.g., lectures in a section, quizzes/submissions in a lecture). This action cannot be undone.`}
          type="warning"
          loading={submitting}
        >
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              text="Cancel"
              onClick={() => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                setSubmitting(false);
              }}
              className="px-6 py-2 bg-[#E5E7EB] text-[#1B3C53] hover:bg-[#D1D5DB] rounded-md font-medium transition-all duration-200"
              aria-label="Cancel deletion"
            />
            <Button
              text="Delete"
              onClick={() => {
                confirmModal.onConfirm(); 
              }}
              className="px-6 py-2 bg-[#DC2626] text-[#FFFFFF] hover:bg-[#B91C1C] rounded-md font-medium transition-all duration-200 transform hover:scale-105"
              aria-label={`Confirm delete ${confirmModal.itemType}`}
              disabled={submitting}
            >
              <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default InstructorCourseContentPage;
