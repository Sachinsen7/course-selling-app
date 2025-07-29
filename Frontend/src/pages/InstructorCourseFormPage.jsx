import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCourse, updateInstructorCourse, getInstructorCourses, getAllCategories } from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { PROTECTED_ROUTES } from '../routes';

function InstructorCourseFormPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, showModal } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    category: '',
    status: 'draft',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'instructor')) {
      navigate(PROTECTED_ROUTES.dashboard, { replace: true });
      showModal({
        isOpen: true,
        title: 'Access Denied',
        message: 'You must be an instructor to manage courses.',
        type: 'error',
      });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryData = await getAllCategories();
        setCategories(categoryData.categories || []);

        if (courseId) {
          setIsEditMode(true);
          const instructorCoursesData = await getInstructorCourses();
          const courseToEdit = instructorCoursesData.courses.find((c) => c._id === courseId);

          if (courseToEdit) {
            setFormData({
              title: courseToEdit.title,
              description: courseToEdit.description,
              imageUrl: courseToEdit.imageUrl,
              price: courseToEdit.price.toString(),
              category: courseToEdit.category?._id || '',
              status: courseToEdit.status,
            });
            if (categoryData.categories.length > 0 && !courseToEdit.category) {
              setFormData((prev) => ({ ...prev, category: categoryData.categories[0]._id }));
            }
          } else {
            setError("Course not found or you don't own it.");
          }
        } else {
          if (categoryData.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category: categoryData.categories[0]._id }));
          }
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError(err.message || 'Failed to load form data.');
        showModal({
          isOpen: true,
          title: 'Error',
          message: err.message || 'Failed to load form data.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && user.role === 'instructor') {
      fetchData();
    }
  }, [courseId, user, authLoading, navigate, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      if (/^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const dataToSubmit = { ...formData };
    dataToSubmit.price = Number(formData.price) || 0;

    if (!dataToSubmit.title || dataToSubmit.title.length < 5) {
      setError('Title must be at least 5 characters long.');
      setSubmitting(false);
      return;
    }
    if (!dataToSubmit.description || dataToSubmit.description.length < 20) {
      setError('Description must be at least 20 characters long.');
      setSubmitting(false);
      return;
    }
    if (!dataToSubmit.category) {
      setError('Please select a category.');
      setSubmitting(false);
      return;
    }
    if (dataToSubmit.price < 0) {
      setError('Price must be a non-negative number.');
      setSubmitting(false);
      return;
    }

    if (!dataToSubmit.imageUrl) {
      dataToSubmit.imageUrl = 'https://placehold.co/600x400/cccccc/333333?text=Course+Image';
    }

    try {
      let response;
      if (isEditMode) {
        response = await updateInstructorCourse(courseId, dataToSubmit);
        showModal({
          isOpen: true,
          title: 'Course Updated!',
          message: `${dataToSubmit.title} has been updated successfully.`,
          type: 'success',
        });
      } else {
        response = await createCourse(dataToSubmit);
        showModal({
          isOpen: true,
          title: 'Course Created!',
          message: `${dataToSubmit.title} has been created successfully.`,
          type: 'success',
        });
      }
      navigate(PROTECTED_ROUTES.instructor, { replace: true });
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to save course.');
      showModal({
        isOpen: true,
        title: 'Submission Failed',
        message: err.message || 'Could not save course.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <Loader />;
  if (error && !courseId) return <div className="text-[#DC2626] text-center p-8 text-xl font-medium">{error}</div>;

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-8 px-4 font-sans">
      <div className="container mx-auto max-w-3xl">

        <header className="relative mb-10">
          <h1 className="text-3xl font-bold text-[#1B3C53] text-center tracking-tight">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-[#6B7280] text-center mt-2 max-w-lg mx-auto">
            {isEditMode ? 'Update your course details to keep it engaging.' : 'Craft a new course to share your expertise.'}
          </p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-[#4A8292] rounded-full"></div>
        </header>


        {error && (
          <div className="mb-6 p-4 bg-[#FFF1F2] border-l-4 border-[#DC2626] text-[#DC2626] rounded-md flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-8">
          <fieldset className="bg-[#F9FAFB] p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
            <legend className="text-[#1B3C53] text-lg font-semibold px-2 -mt-8 bg-[#FFFFFF] w-fit mx-auto">
              Course Details
            </legend>
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="title" className="block text-[#1B3C53] text-sm font-medium mb-2">
                  Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Master React: From Basics to Advanced"
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#FFFFFF] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed transition-all duration-200"
                    required
                    disabled={submitting}
                    aria-describedby="title-error"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A8292]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="description" className="block text-[#1B3C53] text-sm font-medium mb-2">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your course in detail (min 20 characters)..."
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#FFFFFF] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed transition-all duration-200"
                    required
                    disabled={submitting}
                    aria-describedby="description-error"
                  />
                  <svg
                    className="absolute left-3 top-4 w-5 h-5 text-[#4A8292]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 4h13M3 8h13M3 12h6m-6 4h6"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="imageUrl" className="block text-[#1B3C53] text-sm font-medium mb-2">
                  Image URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="e.g., https://your-image-url.com/course.jpg"
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#FFFFFF] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed transition-all duration-200"
                    disabled={submitting}
                    aria-describedby="imageUrl-error"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A8292]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Pricing and Category Fieldset */}
          <fieldset className="bg-[#F9FAFB] p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
            <legend className="text-[#1B3C53] text-lg font-semibold px-2 -mt-8 bg-[#FFFFFF] w-fit mx-auto">
              Pricing & Category
            </legend>
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="price" className="block text-[#1B3C53] text-sm font-medium mb-2">
                  Price (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 999.99"
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] placeholder-[#6B7280] bg-[#FFFFFF] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed transition-all duration-200"
                    required
                    disabled={submitting}
                    aria-describedby="price-error"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A8292]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="category" className="block text-[#1B3C53] text-sm font-medium mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] bg-[#FFFFFF] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed transition-all duration-200 appearance-none"
                    required
                    disabled={submitting || categories.length === 0}
                    aria-describedby="category-error"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A8292]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {categories.length === 0 && (
                  <p className="text-[#D97706] text-xs mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    No categories available. Please ask an admin to create some.
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Status Fieldset */}
          <fieldset className="bg-[#F9FAFB] p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
            <legend className="text-[#1B3C53] text-lg font-semibold px-2 -mt-8 bg-[#FFFFFF] w-fit mx-auto">
              Course Status
            </legend>
            <div className="relative">
              <label htmlFor="status" className="block text-[#1B3C53] text-sm font-medium mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] text-[#1B3C53] bg-[#FFFFFF] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed transition-all duration-200 appearance-none"
                  required
                  disabled={submitting}
                  aria-describedby="status-error"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A8292]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12l2 2 4-4M7.835 4.697a3.5 3.5 0 005.33 0l.335-.334a3.5 3.5 0 015 5l-5.835 5.836a.5.5 0 01-.707 0L5.835 9.363a3.5 3.5 0 010-4.95l.335-.334a3.5 3.5 0 015 0"
                  />
                </svg>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </fieldset>


          <Button
            text={submitting ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
            type="submit"
            className="w-full px-6 py-3 bg-[#1B3C53] text-white hover:bg-[#456882] transition-all duration-200 ease-in-out transform hover:scale-105 rounded-md font-semibold text-base shadow-md"
            disabled={submitting || categories.length === 0}
            aria-label={isEditMode ? 'Update course details' : 'Create new course'}
          >
            <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {submitting ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
          </Button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        fieldset {
          animation: fadeIn 0.5s ease-in-out both;
        }
      `}</style>
    </div>
  );
}

export default InstructorCourseFormPage;