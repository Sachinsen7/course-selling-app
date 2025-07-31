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
        setCourses(data.courses || []);
        setPagination({
          page: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalResults: data.totalResults || 0,
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
    setIsSidebarOpen(false); // Close sidebar on filter apply for mobile/md
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="text-[#DC2626] text-center p-8 text-xl font-medium flex items-center justify-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6 font-sans">
      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <motion.section
          className="bg-gradient-to-r from-[#1B3C53] to-[#456882] text-[#FFFFFF] p-8 rounded-xl shadow-lg mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Explore Our Courses</h1>
          <p className="text-center text-[#FFFFFF]/80 text-base md:text-lg max-w-2xl mx-auto">
            Discover a wide range of courses to advance your skills and knowledge.
          </p>
          <div className="mt-6 max-w-xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </motion.section>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* Filter Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 md:w-80 bg-[#F9FAFB] p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out md:static md:transform-none md:block ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:w-1/4 md:sticky md:top-24 md:max-h-[calc(100vh-6rem)]`}
          >
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="text-xl font-semibold text-[#1B3C53]">Filters</h2>
              <button
                onClick={toggleSidebar}
                className="text-[#6B7280] hover:text-[#1B3C53] focus:outline-none"
                aria-label="Close filter sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterSidebar
              currentFilters={filters}
              onFilterChange={handleSidebarFilterChange}
              onClose={() => setIsSidebarOpen(false)}
            />
          </aside>

          {/* Overlay for Mobile/MD Sidebar */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-[#1B3C53]/50 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleSidebar}
              aria-hidden="true"
            />
          )}

          {/* Course List */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-[#1B3C53]">
                {pagination.totalResults} Courses Found
              </h2>
              <button
                className="md:hidden px-4 py-2 rounded-md bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A8292]"
                onClick={toggleSidebar}
                aria-label="Toggle filters"
              >
                Filters
              </button>
            </div>
            {courses.length === 0 ? (
              <p className="text-center text-[#6B7280] text-base md:text-lg mt-8 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 text-[#4A8292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No courses found matching your criteria.
              </p>
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded-md bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:ring-offset-2"
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className="text-[#1B3C53] font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 rounded-md bg-[#1B3C53] text-[#FFFFFF] hover:bg-[#456882] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:ring-offset-2"
                      aria-label="Next page"
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