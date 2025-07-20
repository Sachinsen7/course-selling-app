import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/api';
import CourseCard from '../components/course/CourseCard';
import Loader from '../components/common/Loader';
import SearchBar from '../components/user/SearchBar';

function CourseListingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalResults: 0 });

  useEffect(() => {
    const fetchAllCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCourses({ ...filters, page: pagination.page });
        setCourses(data.courses);
        setPagination({
          page: data.currentPage,
          totalPages: data.totalPages,
          totalResults: data.totalResults,
        });
      } catch (err) {
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllCourses();
  }, [filters, pagination.page]);

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, q: query }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-lg">All Courses</h1>
        
        {/* Search Bar */}
        <div className="mb-lg">
          <SearchBar onSearch={handleSearch} />
        </div>

        {courses.length === 0 ? (
          <p className="text-center text-text-secondary text-lg mt-8">No courses found matching your criteria.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-md mt-xl">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-md bg-primary-main text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                >
                  Previous
                </button>
                <span className="text-text-primary">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-md bg-primary-main text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CourseListingPage;
