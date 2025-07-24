import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCourses } from '../services/api';
import CourseCard from '../components/course/CourseCard';
import Loader from '../components/common/Loader';
import SearchBar from '../components/user/SearchBar';
import FilterSidebar from '../components/FilterSidebar';

function CourseListingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        setError(err.message || 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllCourses();
  }, [filters, pagination.page]);

  const handleSearch = (query) => {
    setFilters((prev) => ({ ...prev, q: query }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSidebarFilterChange = (newSidebarFilters) => {
    setFilters((prev) => ({ ...prev, ...newSidebarFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-lg text-lg">{error}</div>;

  return (
    <div className="min-h-screen bg-background-main p-lg font-sans">
      <div className="container mx-auto">
        {/* Hero Section */}
        <motion.section
          className="bg-gradient-to-r from-primary-main to-primary-light text-background-card p-xl rounded-lg shadow-md mb-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-md">Explore Our Courses</h1>
          <p className="text-center text-background-card/80 text-lg max-w-2xl mx-auto">
            Discover a wide range of courses to advance your skills and knowledge.
          </p>
          <div className="mt-md max-w-xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </motion.section>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row lg:space-x-lg">
          {/* Filter Sidebar (Sticky on Desktop, Modal on Mobile) */}
          <aside
            className={`lg:w-1/4 mb-lg lg:mb-0 lg:sticky lg:top-24 ${
              isSidebarOpen ? 'block' : 'hidden'
            } lg:block`}
          >
            <FilterSidebar
              currentFilters={filters}
              onFilterChange={handleSidebarFilterChange}
              onClose={() => setIsSidebarOpen(false)}
            />
          </aside>

          {/* Course List */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-md">
              <h2 className="text-2xl font-semibold text-text-primary">
                {pagination.totalResults} Courses Found
              </h2>
              <button
                className="lg:hidden px-md py-sm rounded-md bg-primary-main text-background-card hover:bg-primary-light transition-colors"
                onClick={toggleSidebar}
              >
                Filters
              </button>
            </div>
            {courses.length === 0 ? (
              <p className="text-center text-text-secondary text-lg mt-lg">
                No courses found matching your criteria.
              </p>
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {courses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-md mt-xl">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-md py-sm rounded-md bg-primary-main text-background-card hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2"
                    >
                      Previous
                    </button>
                    <span className="text-text-primary font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-md py-sm rounded-md bg-primary-main text-background-card hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default CourseListingPage;