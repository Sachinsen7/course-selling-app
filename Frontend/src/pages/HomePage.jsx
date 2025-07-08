import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CourseCard from '../components/course/CourseCard';
import SearchBar from '../components/user/SearchBar';
import Loader from '../components/common/Loader';
import { getCourses } from '../services/api';

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses({ featured: true });
        setCourses(data.courses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-background-main">
      <Navbar />
      <motion.section
        className="container mx-auto p-spacing-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SearchBar />
        <h1 className="text-3xl font-sans font-bold text-text-primary text-center mb-spacing-lg">
          Welcome to LearnSphere
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </motion.section>
      <Footer />
    </div>
  );
}

Home.propTypes = {};

export default Home;