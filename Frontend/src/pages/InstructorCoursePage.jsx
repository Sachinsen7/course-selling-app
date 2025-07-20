// src/pages/InstructorCourseFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCourse, updateInstructorCourse, getInstructorCourses, getAllCategories, getCourseById } from '../services/api';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { PROTECTED_ROUTES } from '../routes';

function InstructorCourseFormPage() { // Renamed from InstructorCoursePage
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, showModal } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '', // Initialize as empty string for proper number input behavior
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
        title: "Access Denied",
        message: "You must be an instructor to manage courses.",
        type: "error",
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
          const courseToEdit = instructorCoursesData.courses.find(c => c._id === courseId);

          if (courseToEdit) {
            setFormData({
              title: courseToEdit.title,
              description: courseToEdit.description,
              imageUrl: courseToEdit.imageUrl,
              price: courseToEdit.price.toString(), // Convert number to string for input value
              category: courseToEdit.category?._id || '',
              status: courseToEdit.status,
            });
            if (categoryData.categories.length > 0 && !courseToEdit.category) {
              setFormData(prev => ({ ...prev, category: categoryData.categories[0]._id }));
            }
          } else {
            setError("Course not found or you don't own it.");
          }
        } else {
          if (categoryData.categories.length > 0) {
            setFormData(prev => ({ ...prev, category: categoryData.categories[0]._id }));
          }
        }
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError(err.message || "Failed to load form data.");
        showModal({
          isOpen: true,
          title: "Error",
          message: err.message || "Failed to load form data.",
          type: "error",
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
    // For price, allow empty string or valid numbers/decimals
    if (name === 'price') {
      // Regex to allow only numbers and a single decimal point
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

    // Prepare data for submission, converting price to number here
    const dataToSubmit = { ...formData };
    // Convert price to number. If it's an empty string, it becomes 0.
    dataToSubmit.price = Number(formData.price) || 0; // Use 0 if conversion results in NaN or is empty

    // Frontend validation to match backend Zod schema requirements
    if (!dataToSubmit.title || dataToSubmit.title.length < 5) {
        setError("Title must be at least 5 characters long.");
        setSubmitting(false);
        return;
    }
    if (!dataToSubmit.description || dataToSubmit.description.length < 20) {
        setError("Description must be at least 20 characters long.");
        setSubmitting(false);
        return;
    }
    if (!dataToSubmit.category) {
        setError("Please select a category.");
        setSubmitting(false);
        return;
    }
    if (dataToSubmit.price < 0) { // Check for negative price after conversion
        setError("Price must be a non-negative number.");
        setSubmitting(false);
        return;
    }
    // Ensure imageUrl is not empty if it's not provided by user
    if (!dataToSubmit.imageUrl) {
        dataToSubmit.imageUrl = 'https://placehold.co/600x400/cccccc/333333?text=Course+Image';
    }


    try {
      let response;
      if (isEditMode) {
        response = await updateInstructorCourse(courseId, dataToSubmit);
        showModal({
          isOpen: true,
          title: "Course Updated!",
          message: `${dataToSubmit.title} has been updated successfully.`,
          type: "success",
        });
      } else {
        response = await createCourse(dataToSubmit);
        showModal({
          isOpen: true,
          title: "Course Created!",
          message: `${dataToSubmit.title} has been created successfully.`,
          type: "success",
        });
      }
      navigate(PROTECTED_ROUTES.instructor, { replace: true });
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to save course.");
      showModal({
        isOpen: true,
        title: "Submission Failed",
        message: err.message || "Could not save course.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <Loader />;
  if (error && !courseId) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-text-primary text-center mb-xl">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-text-secondary text-center mb-lg">
          {isEditMode ? 'Update the details of your course.' : 'Fill in the details to create a new course.'}
        </p>

        {error && <p className="text-accent-error text-center mb-md">{error}</p>}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-md">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-text-primary text-sm font-semibold mb-sm">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to React"
              className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-text-primary text-sm font-semibold mb-sm">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your course in detail (at least 20 characters)..."
              className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
              disabled={submitting}
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-text-primary text-sm font-semibold mb-sm">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="e.g., https://example.com/course-thumbnail.jpg"
              className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              disabled={submitting}
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-text-primary text-sm font-semibold mb-sm">Price (₹)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
              disabled={submitting}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-text-primary text-sm font-semibold mb-sm">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
              disabled={submitting || categories.length === 0}
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
                <p className="text-accent-warning text-xs mt-1">No categories available. Please ask an admin to create some.</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-text-primary text-sm font-semibold mb-sm">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-md py-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
              disabled={submitting}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <Button
            text={submitting ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course')}
            type="submit"
            className="w-full px-xl py-md text-lg"
            disabled={submitting || categories.length === 0}
          />
        </form>
      </div>
    </div>
  );
}

export default InstructorCourseFormPage;
