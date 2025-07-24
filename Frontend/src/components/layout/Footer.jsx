import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PUBLIC_ROUTES } from '../../routes';

function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setEmail('');
      setIsSubmitting(false);
      alert('Thank you for subscribing to LearnSphere’s newsletter!');
    }, 1000);
  };

  const courseCategories = [
    { name: 'Technology', path: `${PUBLIC_ROUTES.courseListing}?category=technology` },
    { name: 'Business', path: `${PUBLIC_ROUTES.courseListing}?category=business` },
    { name: 'Design', path: `${PUBLIC_ROUTES.courseListing}?category=design` },
    { name: 'Data Science', path: `${PUBLIC_ROUTES.courseListing}?category=data-science` },
    { name: 'Personal Development', path: `${PUBLIC_ROUTES.courseListing}?category=personal-development` },
  ];

  const companyLinks = [
    { name: 'About Us', path: PUBLIC_ROUTES.about },
    { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Help Center', path: '/help' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
  ];

  const socialLinks = [
    { name: 'Twitter/X', icon: 'fab fa-x-twitter', url: 'https://x.com/learnsphere' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', url: 'https://linkedin.com/company/learnsphere' },
    { name: 'GitHub', icon: 'fab fa-github', url: 'https://github.com/learnsphere' },
    { name: 'YouTube', icon: 'fab fa-youtube', url: 'https://youtube.com/learnsphere' },
  ];

  return (
    <footer className="bg-primary-main text-background-card pt-xl pb-lg font-sans">
      <div className="container mx-auto px-md">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Course Categories */}
          <div>
            <h3 className="text-xl font-bold text-background-card mb-md">Explore Courses</h3>
            <ul className="space-y-sm">
              {courseCategories.map((category) => (
                <motion.li
                  key={category.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={category.path}
                    className="text-background-card/80 hover:text-primary-light text-sm font-medium transition-colors duration-200"
                  >
                    {category.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xl font-bold text-background-card mb-md">About LearnSphere</h3>
            <ul className="space-y-sm">
              {companyLinks.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={link.path}
                    className="text-background-card/80 hover:text-primary-light text-sm font-medium transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-xl font-bold text-background-card mb-md">Stay Updated</h3>
            <p className="text-background-card/80 text-sm mb-md">
              Subscribe to our newsletter for the latest courses and updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-sm bg-background-card text-primary-main rounded-md border border-secondary-light focus:outline-none focus:ring-2 focus:ring-primary-light"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className={`w-full px-md py-sm bg-background-card text-primary-main rounded-md hover:bg-primary-light hover:text-background-card transition-colors duration-200 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold text-background-card mb-md">Connect With Us</h3>
            <div className="flex space-x-md">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background-card/80 hover:text-primary-light transition-colors duration-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className={`${social.icon} text-xl`}></i>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-xl pt-md border-t border-secondary-light text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-background-card/80 font-medium">
            © {new Date().getFullYear()} LearnSphere. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;