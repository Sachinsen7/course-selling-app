import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "../components/course/CourseCard";
import SearchBar from "../components/user/SearchBar"; 
import Loader from "../components/common/Loader"; 
import { getCourses } from "../services/api";
import { useToast } from "../components/notifications/toasts"; 

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast(); 

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses({ featured: true, limit: 6 });
        setCourses(data.courses);
      } catch (err) {
        toast({
          title: "Error fetching courses",
          description: err.message,
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [toast]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background-main font-inter">
      <motion.section
        className="container mx-auto p-spacing-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SearchBar /> 
        <h1 className="text-3xl font-bold text-text-primary text-center mb-spacing-lg">
          Welcome to LearnSphere
        </h1>
        {courses.length === 0 ? (
          <p className="text-center text-text-secondary text-lg mt-8">No featured courses available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} /> 
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

export default Home;
