import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, selectAuthLoading } from '../Redux/slices/authSlice'
import { showModal } from '../Redux/slices/uiSlice'
import { getPurchasedCourses, getCourseProgress } from '../services/api'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from '../routes'


function UserDashboard() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const authLoading = useSelector(selectAuthLoading)

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseProgressMap, setCourseProgressMap] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEnrolledCourses();
    }
  }, [user, authLoading]);

    const fetchEnrolledCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPurchasedCourses();
      setEnrolledCourses(data.courses);

      const progressPromises = data.courses.map(async (course) => {
        try {
          const progressData = await getCourseProgress(course._id);
          return { courseId: course._id, progress: progressData.courseProgress };
        } catch (progressErr) {
          console.error(`Failed to fetch progress for course ${course._id}:`, progressErr);
          return { courseId: course._id, progress: 'N/A' }; 
        }
      });
      const results = await Promise.all(progressPromises);
      const newProgressMap = results.reduce((acc, item) => {
        acc[item.courseId] = item.progress;
        return acc;
      }, {});
      setCourseProgressMap(newProgressMap);

    } catch (err) {
      setError(err.message || "Failed to load your enrolled courses.");
      showModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to load your enrolled courses.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;
  if (!user) return null; 


  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-lg">
          {user.role === 'instructor' ? 'Instructor & Learner Dashboard' : 'Learner Dashboard'}
        </h1>
        <p className="text-lg text-text-secondary text-center mb-xl">
          Welcome, {user.firstName || user.email}! Here are your enrolled courses.
        </p>

        <h2 className="text-3xl font-bold text-text-primary mb-md border-b pb-sm">My Enrolled Courses</h2>
        {enrolledCourses.length === 0 ? (
          <p className="text-center text-text-secondary text-lg mt-8">
            You haven't enrolled in any courses yet. <Link to={PUBLIC_ROUTES.courseListing} className="text-primary-main hover:underline">Browse courses</Link> to get started!
          </p>
        ) : (
          <div className="space-y-md">
            {enrolledCourses.map((course) => (
              <div key={course._id} className="bg-background-card p-md rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center border border-gray-100">
                <div className="flex-1 text-center md:text-left mb-sm md:mb-0">
                  <h3 className="text-xl font-semibold text-text-primary">{course.title}</h3>
                  <p className="text-text-secondary text-sm">Instructor: {course.creatorId?.firstName} {course.creatorId?.lastName}</p>
                  <p className="text-text-secondary text-sm">
                    Progress: {courseProgressMap[course._id] !== undefined ? `${courseProgressMap[course._id]}%` : 'Loading...'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link to={PROTECTED_ROUTES.courseLearning(course._id)}>
                    <Button text="Continue Learning" className="w-full sm:w-auto" />
                  </Link>
                  <Link to={PUBLIC_ROUTES.courseDetail(course._id)}>
                    <Button text="View Details" variant="outline" className="w-full sm:w-auto" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard