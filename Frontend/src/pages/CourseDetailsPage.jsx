import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, getEnrolledCourseDetails, enrollInCourse, addReview, getReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import CourseCurriculum from '../components/course/CourseCurriculum'; 
import Review from '../components/course/Review'; 
import InstructorProfile from '../components/InstructorProfile'; 
import { PROTECTED_ROUTES } from '../routes';

function CourseDetailsPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, showModal } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        let courseData = null;
        let enrolledStatus = false;

        if (isAuthenticated) {
          try {
            const enrolledResponse = await getEnrolledCourseDetails(courseId);
            courseData = enrolledResponse.course;
            enrolledStatus = true;
          } catch (enrollmentError) {
            console.warn("Not enrolled or error fetching enrolled details, falling back to public:", enrollmentError.message);
            const publicResponse = await getCourseById(courseId);
            courseData = publicResponse.course;
            enrolledStatus = false;
          }
        } else {
          const publicResponse = await getCourseById(courseId);
          courseData = publicResponse.course;
          enrolledStatus = false;
        }

        if (!courseData) {
          setError("Course not found or not available.");
          setLoading(false);
          return;
        }
        setCourse(courseData);
        setIsEnrolled(enrolledStatus);

        const reviewData = await getReviews(courseId);
        setReviews(reviewData.reviews || []);

      } catch (generalError) {
        console.error("Error fetching course details:", generalError);
        setError(generalError.message || "Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, isAuthenticated, showModal]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      showModal({
        isOpen: true,
        title: "Login Required",
        message: "You need to log in to enroll in a course.",
        type: "info",
      });
      navigate('/login');
      return;
    }

    try {
      await enrollInCourse(courseId);
      showModal({
        isOpen: true,
        title: "Enrollment Successful!",
        message: "You have successfully enrolled in the course.",
        type: "success",
      });
      setIsEnrolled(true);
      navigate(`${PROTECTED_ROUTES.courseLearning.replace(':id', courseId)}`, { replace: true });
    } catch (err) {
      showModal({
        isOpen: true,
        title: "Enrollment Failed",
        message: err.message || "Could not enroll in course.",
        type: "error",
      });
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    // Check if user is logged in, is enrolled, and is a learner (not an instructor)
    if (!isAuthenticated || !isEnrolled || user?.role !== 'learner') {
      showModal({
        isOpen: true,
        title: "Permission Denied",
        message: "You must be an enrolled learner to add a review.",
        type: "error",
      });
      return;
    }
    if (!newReviewText.trim()) {
      showModal({
        isOpen: true,
        title: "Invalid Input",
        message: "Review comment cannot be empty.",
        type: "warning",
      });
      return;
    }

    setReviewLoading(true);
    try {
      await addReview(courseId, { rating: newReviewRating, comment: newReviewText });
      const reviewData = await getReviews(courseId); // Re-fetch all reviews
      setReviews(reviewData.reviews);
      setNewReviewText('');
      setNewReviewRating(5);
      showModal({
        isOpen: true,
        title: "Review Added!",
        message: "Your review has been successfully added.",
        type: "success",
      });
    } catch (err) {
      showModal({
        isOpen: true,
        title: "Failed to Add Review",
        message: err.message || "Could not add your review.",
        type: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto bg-background-card p-xl rounded-lg shadow-md border border-gray-100">
        {/* Course Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-lg mb-xl">
          <img
            src={course.imageUrl || 'https://placehold.co/600x400/F9F3EF/1B3C53?text=Course+Image'}
            alt={course.title}
            className="w-full md:w-1/3 rounded-lg shadow-md object-cover mb-md md:mb-0"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-text-primary mb-sm">{course.title}</h1>
            <p className="text-lg text-text-secondary mb-md">{course.description}</p>
            <div className="flex items-center justify-center md:justify-start space-x-md mb-md">
              <span className="text-xl font-bold text-primary-main">
                {course.price === 0 ? 'Free' : `$${course.price?.toFixed(2)}`}
              </span>
              <span className="text-text-secondary text-md">
                Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'} ({course.numberOfReviews || 0} reviews)
              </span>
            </div>
            
            {/* Display Instructor Profile component */}
            {course.creatorId && <InstructorProfile instructor={course.creatorId} />}

            {!isEnrolled ? (
              <Button
                text={course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                onClick={handleEnroll}
                className="mt-md px-lg py-md text-lg"
              />
            ) : (
              <Link to={`${PROTECTED_ROUTES.courseLearning.replace(':id', courseId)}`}>
                <Button text="Go to Course" className="mt-md px-lg py-md text-lg" />
              </Link>
            )}
          </div>
        </div>

        {/* Course Curriculum - Using the CourseCurriculum component */}
        <div className="mb-xl">
          <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">Course Curriculum</h2>
          <CourseCurriculum sections={course.sections} />
        </div>

        {/* Course Reviews - Using the Review component */}
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">Student Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-text-secondary text-lg mb-lg">No reviews yet. Be the first to review this course!</p>
          ) : (
            <div className="space-y-md mb-lg">
              {reviews.map((review) => (
                <Review key={review._id} review={review} />
              ))}
            </div>
          )}

          {/* Add Review Form */}
          {isAuthenticated && isEnrolled && user?.role === 'learner' && (
            <div className="bg-background-main p-md rounded-md shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-text-primary mb-md">Add Your Review</h3>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label htmlFor="rating" className="block text-text-primary text-sm font-semibold mb-2">
                    Rating (1-5):
                  </label>
                  <input
                    type="number"
                    id="rating"
                    min="1"
                    max="5"
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                    required
                    disabled={reviewLoading}
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="block text-text-primary text-sm font-semibold mb-2">
                    Your Comment:
                  </label>
                  <textarea
                    id="comment"
                    rows="4"
                    placeholder="Share your thoughts about this course..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                    required
                    disabled={reviewLoading}
                  />
                </div>
                <Button
                  text={reviewLoading ? 'Submitting...' : 'Submit Review'}
                  type="submit"
                  className="px-lg py-md"
                  disabled={reviewLoading}
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsPage;
