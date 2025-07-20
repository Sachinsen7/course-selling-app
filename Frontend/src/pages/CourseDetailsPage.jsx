import React from 'react'
import { useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import { PROTECTED_ROUTES } from '../routes'
import { addReview, enrollInCourse, getEnrolledCourseDetails, getReviews } from '../services/api'



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
      setLoading(true)
      setError(null)

      try {
        let courseData;
        if(isAuthenticated){
          try {
            const enrollData = await getEnrolledCourseDetails(courseId)
            courseData = enrollData.course
            setIsEnrolled(true)
          } catch (enrollmentError) {
            const publicData = await getCourseById(courseId);
            courseData = publicData.courses[0]; 
            setIsEnrolled(false);
          }
        } else {
          const publicData = await getCourseById(courseId);
          courseData = publicData.courses[0];
          setIsEnrolled(false);
        }
        
        if (!courseData) {
          setError("Course not found.");
          setLoading(false);
          return;
        }
        setCourse(courseData);

        const reviewsData = await getReviews(courseId)
        setReviews(reviewsData.reviews || [])
      } catch (error) {
        console.error("Error fetching course details:", err);
        setError(err.message || "Failed to load course details."); 
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, isAuthenticated, showModal])


  // enroll in course

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
    if (!isAuthenticated || !isEnrolled || user.role === 'instructor') { 
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
      const updatedReviews = await getReviews(courseId); 
      setReviews(updatedReviews.reviews);
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
  if (error) return <div className="text-accent-error text-center p-spacing-lg text-lg">{error}</div>;
  if (!course) return null;


  return (
     <div className="min-h-screen bg-background-main p-spacing-lg font-sans">
        <div className="container mx-auto bg-background-card p-spacing-xl rounded-lg shadow-md">
        {/* Course Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-spacing-lg mb-spacing-xl">
            <img
              src={course.imageUrl || 'https://placehold.co/600x400/cccccc/333333?text=Course+Image'}
              alt={course.title}
              className="w-full md:w-1/3 rounded-lg shadow-md object-cover mb-spacing-md md:mb-0"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-text-primary mb-spacing-sm">{course.title}</h1>
              <p className="text-lg text-text-secondary mb-spacing-md">{course.description}</p>
              <div className="flex items-center justify-center md:justify-start space-x-spacing-md mb-spacing-md">
                <span className="text-xl font-bold text-primary-main">
                  {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                </span>
                <span className="text-text-secondary text-md">
                  Rating: {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'} ({course.numberOfReviews || 0} reviews)
                </span>
              </div>
              <p className="text-text-primary text-md mb-spacing-md">
                Instructor: {course.creatorId?.firstName} {course.creatorId?.lastName}
              </p>

              {!isEnrolled ? (
                <Button
                  text={course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                  onClick={handleEnroll}
                  className="mt-spacing-md px-lg py-md text-lg"
                />
              ) : (
                <Link to={`${PROTECTED_ROUTES.courseLearning.replace(':id', courseId)}`}>
                  <Button text="Go to Course" className="mt-spacing-md px-lg py-md text-lg" />
                </Link>
              )}
            </div>
          </div>

        {/* Course Curriculum */}
        <div className="mb-spacing-xl">
            <h2 className="text-3xl font-bold text-text-primary mb-spacing-md border-b pb-spacing-sm">Course Curriculum</h2>
          
            {course.sections && course.sections.length > 0 ? (
              <div className="space-y-spacing-md">
                  {course.sections.map((section) => (
                      <div key={section._id} className="bg-background-main p-spacing-md rounded-md shadow-sm border border-gray-100">
                          <h3 className="text-xl font-semibold text-text-primary mb-spacing-sm">{section.title}</h3>
                          {section.lectures && section.lectures.length > 0 ? (
                              <ul className="space-y-2">
                                {section.lectures.map((lecture) => (
                                  <li key={lecture._id} className="flex justify-between items-center text-text-secondary">
                                    <span>{lecture.order}. {lecture.title} ({lecture.type})</span>
                                    {isEnrolled && lecture.isCompleted && (
                                      <span className="text-accent-success text-sm">Completed</span>
                                    )}
                                    {isEnrolled && !lecture.isCompleted && (
                                        <span className="text-primary-main text-sm">Not Completed</span>
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
                ) : (
                <p className="text-text-secondary text-lg">No curriculum available yet.</p>
              )}
        </div>

        {/* Course Reviews */}
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-spacing-md border-b pb-spacing-sm">Student Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-text-secondary text-lg mb-spacing-lg">No reviews yet. Be the first to review this course!</p>
          ) : (
            <div className="space-y-spacing-md mb-spacing-lg">
              {reviews.map((review) => (
                <div key={review._id} className="bg-background-main p-spacing-md rounded-md shadow-sm border border-gray-100">
                  <div className="flex items-center mb-2">
                    <img
                      src={review.userId?.profilePicture || 'https://placehold.co/40x40/cccccc/333333?text=U'}
                      alt={review.userId?.firstName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold text-text-primary">{review.userId?.firstName} {review.userId?.lastName}</p>
                      <p className="text-sm text-text-secondary">Rating: {review.rating} / 5</p>
                    </div>
                  </div>
                  <p className="text-text-primary">{review.comment}</p>
                  <p className="text-xs text-text-secondary mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Review Form */}
          {isAuthenticated && isEnrolled && user.role === 'learner' && (
            <div className="bg-background-main p-spacing-md rounded-md shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-text-primary mb-spacing-md">Add Your Review</h3>
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
  )
}

export default CourseDetailsPage