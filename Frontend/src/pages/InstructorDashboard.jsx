import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInstructorCourses, deleteInstructorCourse, getCourseById } from '../services/api'; 
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Model'; 
import { PUBLIC_ROUTES } from '../routes';

function InstructorDashboard() {
  const { user, loading: authLoading, showModal } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    courseIdToDelete: null,
    courseTitleToDelete: '',
  });

  useEffect(() => {
    if (!authLoading && user && user.role === 'instructor') {
      fetchInstructorCourses();
    } else if (!authLoading && user && user.role !== 'instructor') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const fetchInstructorCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstructorCourses();
      setCourses(data.courses);
    } catch (err) {
      setError(err.message || "Failed to load your courses.");
      showModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to load your courses.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to open the confirmation modal
  const openConfirmDeleteModal = (courseId, courseTitle) => {
    setConfirmModal({
      isOpen: true,
      courseIdToDelete: courseId,
      courseTitleToDelete: courseTitle,
    });
  };

  // Function to handle the actual deletion after confirmation
  const confirmAndDeleteCourse = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false }); 
    setLoading(true);
    try {
      await deleteInstructorCourse(confirmModal.courseIdToDelete);
      showModal({
        isOpen: true,
        title: "Course Deleted",
        message: `"${confirmModal.courseTitleToDelete}" has been successfully deleted.`,
        type: "success",
      });
      fetchInstructorCourses(); 
    } catch (err) {
      showModal({
        isOpen: true,
        title: "Deletion Failed",
        message: err.message || "Failed to delete the course.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!user || user.role !== 'instructor') return null;

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-lg">Instructor Dashboard</h1>
        <p className="text-lg text-text-secondary text-center mb-xl">Manage your courses and content.</p>

        <div className="mb-xl text-center">
          <Link to="/instructor/course/new">
            <Button text="Create New Course" className="px-lg py-md" />
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">Your Courses</h2>
        {courses.length === 0 ? (
          <p className="text-center text-text-secondary text-lg mt-8">You haven't created any courses yet.</p>
        ) : (
          <div className="space-y-md">
            {courses.map((course) => (
              <div key={course._id} className="bg-background-card p-md rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center border border-gray-100">
                <div className="flex-1 text-center md:text-left mb-sm md:mb-0">
                  <h3 className="text-xl font-semibold text-text-primary">{course.title}</h3>
                  <p className="text-text-secondary text-sm">Status: <span className={`font-medium ${course.status === 'published' ? 'text-accent-success' : 'text-accent-warning'}`}>{course.status}</span></p>
                  <p className="text-text-secondary text-sm">Price: {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link to={PUBLIC_ROUTES.courseDetail.replace(':id', course._id)}>
                    <Button text="View" variant="outline" className="w-full sm:w-auto" />
                  </Link>
                  <Link to={`/instructor/course/edit/${course._id}`}>
                    <Button text="Edit" variant="secondary" className="w-full sm:w-auto" />
                  </Link>
                  <Button
                    text="Delete"
                    onClick={() => openConfirmDeleteModal(course._id, course.title)}
                    className="bg-accent-error hover:bg-red-700 text-white w-full sm:w-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the course "${confirmModal.courseTitleToDelete}"? This action cannot be undone.`}
        type="warning"
      >
        <div className="flex justify-center space-x-md mt-4">
          <Button
            text="Cancel"
            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            className="bg-gray-300 text-gray-800 hover:bg-gray-400"
          />
          <Button
            text="Delete"
            onClick={confirmAndDeleteCourse}
            className="bg-accent-error hover:bg-red-700"
          />
        </div>
      </Modal>
    </div>
  );
}

export default InstructorDashboard;
