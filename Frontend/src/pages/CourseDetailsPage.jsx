import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCourseById, getEnrolledCourseDetails, enrollInCourse, addReview, getReviews, getCourses } from '../services/api';
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
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSort, setReviewSort] = useState('recent');

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


        const totalLectures = courseData.sections.reduce((sum, s) => sum + s.lectures.length, 0);
        const duration = courseData.sections.reduce((sum, s) => sum + s.lectures.reduce((lSum, l) => lSum + (l.duration || 0), 0), 0) / 3600; 


        const reviewData = await getReviews(courseId);
        const averageRating = reviewData.reviews.length
          ? reviewData.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewData.reviews.length
          : 0;

        setCourse({
          ...courseData,
          totalLectures,
          duration: duration.toFixed(1),
          averageRating: averageRating.toFixed(1),
          numberOfReviews: reviewData.reviews.length,
          level: courseData.level || 'All Levels', 
          lastUpdated: courseData.lastUpdated || 'N/A',
          imageUrl: courseData.imageUrl || 'https://via.placeholder.com/300x200/F8FAFC/1E293B?text=Course+Image',
          videoPreviewUrl: courseData.videoPreviewUrl || '', 
          learningObjectives: courseData.learningObjectives || [
            'Learn key concepts and skills',
            'Apply knowledge practically',
            'Gain industry insights',
          ], 
          requirements: courseData.requirements || ['Basic computer skills', 'Internet access'], 
          targetAudience: courseData.targetAudience || ['Beginners', 'Professionals'], 
        });
        setIsEnrolled(enrolledStatus);
        setReviews(reviewData.reviews || []);
        setRatingDistribution(reviewData.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

        // Fetch related courses
        const relatedResponse = await getCourses({ category: courseData.category, limit: 3 });
        setRelatedCourses(relatedResponse.courses.filter(c => c._id !== courseId));
      } catch (generalError) {
        console.error("Error fetching course details:", generalError);
        setError(generalError.message || "Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, isAuthenticated]);

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
      const reviewData = await getReviews(courseId);
      setReviews(reviewData.reviews);
      setRatingDistribution(reviewData.ratingDistribution);
      setCourse({
        ...course,
        averageRating: reviewData.reviews.length
          ? reviewData.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewData.reviews.length
          : 0,
        numberOfReviews: reviewData.reviews.length,
      });
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

  const sortedReviews = () => {
    if (reviewSort === 'highest') {
      return [...reviews].sort((a, b) => b.rating - a.rating);
    }
    return [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-background-main font-sans">
      {/* Hero Section */}
      <motion.section
        className="bg-primary-main text-text-primary py-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-md">
          <div className="max-w-4xl">
            {course.numberOfReviews > 100 && (
              <span className="inline-block bg-accent-warning text-background-card text-sm font-semibold px-md py-xs rounded mb-sm">
                Bestseller
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-sm">{course.title}</h1>
            <p className="text-md text-text-secondary mb-md">{course.description}</p>
            <div className="flex items-center space-x-md mb-md">
              <span className="text-xl font-semibold text-accent-warning">
                {course.averageRating || 'N/A'} ★
                <span className="text-sm text-text-secondary ml-sm">
                  ({course.numberOfReviews || 0} reviews)
                </span>
              </span>
              <span className="text-sm text-text-secondary">
                {course.totalLectures || 0} lectures • {course.duration || 0}h • {course.level}
              </span>
              <span className="text-sm text-text-secondary">Updated {course.lastUpdated}</span>
            </div>
            <p className="text-sm text-text-secondary mb-md">
              Created by{' '}
              <span className="text-primary-light">
                {course.creatorId?.firstName} {course.creatorId?.lastName}
              </span>
            </p>
            {course.category && (
              <span className="inline-block bg-background-card text-primary-main text-sm font-semibold px-md py-xs rounded mb-md">
                {course.category}
              </span>
            )}
            <div className="flex items-center space-x-md">
              <span className="text-2xl font-bold text-text-primary">
                {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
              </span>
              {!isEnrolled ? (
                <Button
                  text={course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                  onClick={handleEnroll}
                  className="px-lg py-sm bg-secondary-main text-background-card hover:bg-secondary-light hover:shadow-md transition-all duration-200"
                />
              ) : (
                <Link to={`${PROTECTED_ROUTES.courseLearning.replace(':id', courseId)}`}>
                  <Button
                    text="Go to Course"
                    className="px-lg py-sm bg-secondary-main text-background-card hover:bg-secondary-light hover:shadow-md transition-all duration-200"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Mobile CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-card shadow-md p-sm z-10">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-lg font-bold text-text-primary">
            {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
          </span>
          {!isEnrolled ? (
            <Button
              text={course.price === 0 ? 'Enroll Now' : 'Buy Now'}
              onClick={handleEnroll}
              className="px-md py-sm bg-secondary-main text-background-card hover:bg-secondary-light transition-all duration-200"
            />
          ) : (
            <Link to={`${PROTECTED_ROUTES.courseLearning.replace(':id', courseId)}`}>
              <Button
                text="Go to Course"
                className="px-md py-sm bg-secondary-main text-background-card hover:bg-secondary-light transition-all duration-200"
              />
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg flex flex-col lg:flex-row lg:space-x-lg">
        <div className="flex-1 max-w-4xl">
          {/* Video Preview */}
          {course.videoPreviewUrl ? (
            <motion.section
              className="mb-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">Course Preview</h2>
              <div className="relative aspect-w-16 aspect-h-9">
                <iframe
                  src={course.videoPreviewUrl}
                  title="Course Preview"
                  className="w-full h-64 rounded-md"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.section>
          ) : (
            <motion.section
              className="mb-lg bg-background-card p-md rounded-md shadow-sm border border-secondary-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">Course Preview</h2>
              <img
                src={course.imageUrl}
                alt="Course Preview"
                className="w-full h-64 object-cover rounded-md"
              />
            </motion.section>
          )}

          {/* What You'll Learn */}
          {course.learningObjectives?.length > 0 && (
            <motion.section
              className="mb-lg bg-background-card p-md rounded-md shadow-sm border border-secondary-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">What You'll Learn</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {course.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start text-sm text-text-secondary">
                    <i className="fas fa-check text-primary-main mr-sm mt-xs"></i>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <motion.section
              className="mb-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">Requirements</h2>
              <ul className="space-y-sm">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start text-sm text-text-secondary">
                    <i className="fas fa-circle text-primary-main mr-sm mt-xs text-xs"></i>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Course Description */}
          {course.description && (
            <motion.section
              className="mb-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">Course Description</h2>
              <p className="text-sm text-text-secondary">{course.description}</p>
            </motion.section>
          )}

          {/* Who This Course Is For */}
          {course.targetAudience?.length > 0 && (
            <motion.section
              className="mb-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">Who This Course Is For</h2>
              <ul className="space-y-sm">
                {course.targetAudience.map((audience, index) => (
                  <li key={index} className="flex items-start text-sm text-text-secondary">
                    <i className="fas fa-user text-primary-main mr-sm mt-xs"></i>
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Instructor Profile */}
          {course.creatorId && (
            <motion.section
              className="mb-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">Instructor</h2>
              <InstructorProfile instructor={course.creatorId} />
            </motion.section>
          )}

          {/* Course Curriculum */}
          <motion.section
            className="mb-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-md">Course Curriculum</h2>
            <p className="text-sm text-text-secondary mb-md">
              {course.totalLectures} lectures • {course.duration}h total length
            </p>
            <CourseCurriculum sections={course.sections} previewMode={!isEnrolled} />
          </motion.section>

          {/* Student Reviews */}
          <motion.section
            className="mb-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-md">Student Reviews</h2>
            {ratingDistribution && (
              <div className="mb-md bg-background-card p-md rounded-md shadow-sm border border-secondary-light">
                <h3 className="text-lg font-semibold text-text-primary mb-sm">Rating Breakdown</h3>
                <div className="space-y-sm">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <span className="text-sm text-text-secondary w-12">{star} stars</span>
                      <div className="flex-1 bg-secondary-light h-2 rounded-full">
                        <div
                          className="bg-primary-main h-2 rounded-full"
                          style={{
                            width: `${
                              ratingDistribution[star]
                                ? (ratingDistribution[star] / (course.numberOfReviews || 1)) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-text-secondary ml-sm">
                        {ratingDistribution[star] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mb-md">
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="p-sm border border-secondary-light rounded-md text-sm text-text-primary"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
              </select>
            </div>
            {reviews.length === 0 ? (
              <p className="text-text-secondary text-sm mb-lg">No reviews yet. Be the first to review this course!</p>
            ) : (
              <div className="space-y-md mb-lg">
                {sortedReviews().map((review) => (
                  <Review key={review._id} review={review} />
                ))}
              </div>
            )}
            {isAuthenticated && isEnrolled && user?.role === 'learner' && (
              <div className="bg-background-card p-md rounded-md shadow-sm border border-secondary-light">
                <h3 className="text-lg font-semibold text-text-primary mb-md">Add Your Review</h3>
                <form onSubmit={handleAddReview} className="space-y-md">
                  <div>
                    <label className="block text-text-primary text-sm font-semibold mb-sm">
                      Rating (1-5):
                    </label>
                    <div className="flex space-x-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className={`text-2xl ${
                            newReviewRating >= star ? 'text-accent-warning' : 'text-text-secondary'
                          } hover:text-accent-warning transition-colors`}
                          disabled={reviewLoading}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ★
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-text-primary text-sm font-semibold mb-sm">
                      Your Comment:
                    </label>
                    <textarea
                      id="comment"
                      rows="4"
                      placeholder="Share your thoughts about this course..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full p-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-text-primary"
                      required
                      disabled={reviewLoading}
                    />
                  </div>
                  <Button
                    text={reviewLoading ? 'Submitting...' : 'Submit Review'}
                    type="submit"
                    className="px-lg py-sm bg-primary-main text-background-card hover:bg-primary-light hover:shadow-md transition-all duration-200"
                    disabled={reviewLoading}
                  />
                </form>
              </div>
            )}
          </motion.section>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <motion.section
              className="mb-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-md">Related Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {relatedCourses.map((relatedCourse) => (
                  <Link
                    key={relatedCourse._id}
                    to={`/course/${relatedCourse._id}`}
                    className="bg-background-card p-md rounded-md shadow-sm border border-secondary-light hover:shadow-md transition-all duration-200"
                  >
                    <img
                      src={relatedCourse.imageUrl || 'https://via.placeholder.com/300x200/F8FAFC/1E293B?text=Course+Image'}
                      alt={relatedCourse.title}
                      className="w-full h-32 object-cover rounded-md mb-sm"
                    />
                    <h3 className="text-lg font-semibold text-text-primary mb-xs">{relatedCourse.title}</h3>
                    <p className="text-sm text-text-secondary mb-sm truncate">{relatedCourse.description}</p>
                    <p className="text-sm text-text-secondary">
                      {relatedCourse.price === 0 ? 'Free' : `$${relatedCourse.price.toFixed(2)}`}
                    </p>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Sticky Sidebar */}
        <motion.aside
          className="lg:sticky lg:top-24 lg:w-80 lg:ml-lg hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-background-card p-md rounded-md shadow-md border border-secondary-light">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-48 object-cover rounded-md mb-md"
            />
            <div className="text-center">
              <span className="text-xl font-bold text-text-primary mb-sm block">
                {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
              </span>
              {!isEnrolled ? (
                <Button
                  text={course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                  onClick={handleEnroll}
                  className="w-full px-lg py-sm bg-secondary-main text-background-card hover:bg-secondary-light hover:shadow-md transition-all duration-200"
                />
              ) : (
                <Link to={`${PROTECTED_ROUTES.courseLearning.replace(':id', courseId)}`}>
                  <Button
                    text="Go to Course"
                    className="w-full px-lg py-sm bg-secondary-main text-background-card hover:bg-secondary-light hover:shadow-md transition-all duration-200"
                  />
                </Link>
              )}
              {isEnrolled && (
                <div className="mt-md">
                  <p className="text-text-secondary text-sm mb-sm">Course Progress</p>
                  <div className="w-full bg-secondary-light rounded-full h-2.5">
                    <div
                      className="bg-primary-main h-2.5 rounded-full"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <ul className="mt-md text-sm text-text-secondary space-y-sm">
                <li className="flex justify-between">
                  <span>Duration</span>
                  <span>{course.duration || 0} hours</span>
                </li>
                <li className="flex justify-between">
                  <span>Lectures</span>
                  <span>{course.totalLectures || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span>Level</span>
                  <span>{course.level}</span>
                </li>
                <li className="flex justify-between">
                  <span>Updated</span>
                  <span>{course.lastUpdated}</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

export default CourseDetailsPage;