import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { PUBLIC_ROUTES } from '../routes';

function About() {
  const teamMembers = [
    {
      name: 'John Doe',
      role: 'Founder & CEO',
      bio: 'John leads LearnSphere, focusing on innovative education solutions.',
    },
    {
      name: 'Jane Smith',
      role: 'Head of Education',
      bio: 'Jane curates our course offerings to ensure quality and relevance.',
    },
  ];

  const whyLearnSphere = [
    {
      title: 'Expert-Led Courses',
      desc: 'Learn from industry professionals with practical insights.',
      icon: 'fas fa-chalkboard-teacher',
    },
    {
      title: 'Flexible Learning',
      desc: 'Study at your pace with accessible, on-demand content.',
      icon: 'fas fa-laptop',
    },
    {
      title: 'Career Growth',
      desc: 'Gain skills and certificates to advance your career.',
      icon: 'fas fa-briefcase',
    },
  ];

  const testimonials = [
    {
      quote: 'The courses helped me switch to a tech career in months.',
      author: 'Alex B., Software Developer',
      rating: 5,
    },
    {
      quote: 'Easy-to-follow lessons and great instructor support.',
      author: 'Emma W., UI Designer',
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-background-main font-sans">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-r from-primary-main to-primary-light text-background-card py-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-md text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-background-card mb-sm">About LearnSphere</h1>
          <p className="text-md text-background-card/80 max-w-xl mx-auto">
            Learn from experts, grow your skills, and achieve your goals with our online courses.
          </p>
          <Link to={PUBLIC_ROUTES.courseListing}>
            <Button
              text="Browse Courses"
              className="mt-md px-lg py-sm bg-background-card text-background-main hover:bg-primary-light hover:text-background-card transition-all duration-200"
            />
          </Link>
        </div>
      </motion.section>

      {/* Mission */}
      <motion.section
        className="container mx-auto px-md py-lg max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-md text-center">Our Mission</h2>
        <p className="text-md text-text-secondary">
          LearnSphere makes high-quality education accessible to all, connecting learners with expert instructors to build skills and achieve success.
        </p>
      </motion.section>

      {/* Why LearnSphere */}
      <motion.section
        className="container mx-auto px-md py-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-md text-center">Why LearnSphere?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md max-w-4xl mx-auto">
          {whyLearnSphere.map((item, index) => (
            <motion.div
              key={index}
              className="bg-background-card p-md rounded-md shadow-sm border border-secondary-light hover:shadow-md transition-shadow duration-200"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <i className={`${item.icon} text-2xl text-primary-main mb-sm block text-center`}></i>
              <h3 className="text-lg font-semibold text-text-primary mb-sm text-center">{item.title}</h3>
              <p className="text-sm text-text-secondary text-center">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Team */}
      <motion.section
        className="container mx-auto px-md py-lg max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-md text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="bg-background-card p-sm rounded-md shadow-sm border border-secondary-light hover:shadow-md transition-shadow duration-200"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3 className="text-md font-semibold text-text-primary mb-xs">{member.name}</h3>
              <p className="text-sm text-text-secondary mb-xs">{member.role}</p>
              <p className="text-sm text-text-secondary">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="container mx-auto px-md py-lg bg-background-card rounded-md shadow-md border border-secondary-light"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-md text-center">What Learners Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="p-sm rounded-md border border-secondary-light hover:shadow-md transition-shadow duration-200"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex mb-sm">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${i < testimonial.rating ? 'text-accent-warning' : 'text-text-secondary'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-text-secondary italic mb-sm">"{testimonial.quote}"</p>
              <p className="text-sm font-semibold text-text-primary">{testimonial.author}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="container mx-auto px-md py-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-md">Join LearnSphere</h2>
        <p className="text-md text-text-secondary mb-md max-w-xl mx-auto">
          Start learning or share your expertise with our global community.
        </p>
        <div className="flex justify-center space-x-md">
          <Link to={PUBLIC_ROUTES.courseListing}>
            <Button
              text="Browse Courses"
              className="px-lg py-sm bg-primary-main text-background-card hover:bg-primary-light hover:shadow-md transition-all duration-200"
            />
          </Link>
          <Link to="/instructor">
            <Button
              text="Teach with Us"
              className="px-lg py-sm bg-background-card text-primary-main hover:bg-primary-light hover:text-background-card hover:shadow-md transition-all duration-200"
              variant="outline"
            />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

export default About;