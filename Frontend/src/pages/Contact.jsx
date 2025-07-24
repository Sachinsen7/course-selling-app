import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { showModal } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call (replace with POST /api/contact)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showModal({
        isOpen: true,
        title: 'Message Sent',
        message: 'We’ve received your message and will respond soon.',
        type: 'success',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      showModal({
        isOpen: true,
        title: 'Submission Failed',
        message: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'Go to the course listing, select a course, and click "Enroll Now" or "Buy Now." Log in or sign up to proceed.',
    },
    {
      question: 'Can I teach on LearnSphere?',
      answer: 'Yes, register as an instructor and submit your course for review via the Instructor Dashboard.',
    },
    {
      question: 'What is the refund policy?',
      answer: 'We provide a 30-day refund. Email support@learnsphere.com to request one.',
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
          <h1 className="text-3xl md:text-4xl font-bold text-background-card mb-sm">Contact Us</h1>
          <p className="text-md text-background-card/80 max-w-xl mx-auto">
            Need help or have a question? Send us a message, and we’ll respond within 24 hours.
          </p>
        </div>
      </motion.section>

      {/* Contact Form */}
      <motion.section
        className="container mx-auto px-md py-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-lg mx-auto bg-background-card p-md rounded-lg shadow-md border border-secondary-light">
          <h2 className="text-2xl font-bold text-text-primary mb-md text-center">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label htmlFor="name" className="block text-text-primary text-sm font-semibold mb-xs">
                Name
              </label>
              <motion.input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-text-primary transition-all duration-200"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-text-primary text-sm font-semibold mb-xs">
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-text-primary transition-all duration-200"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-text-primary text-sm font-semibold mb-xs">
                Subject
              </label>
              <motion.input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-text-primary transition-all duration-200"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-text-primary text-sm font-semibold mb-xs">
                Message
              </label>
              <motion.textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-sm border border-secondary-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-text-primary transition-all duration-200"
                required
                disabled={submitting}
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <Button
              text={submitting ? 'Sending...' : 'Send Message'}
              type="submit"
              className="w-full px-lg py-sm bg-primary-main text-background-card hover:bg-primary-light hover:shadow-md transition-all duration-200"
              disabled={submitting}
            />
          </form>
        </div>
      </motion.section>

      {/* FAQs */}
      <motion.section
        className="container mx-auto px-md py-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-md text-center">Frequently Asked Questions</h2>
        <div className="max-w-lg mx-auto space-y-sm">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-background-card p-sm rounded-md shadow-sm border border-secondary-light hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <button
                className="flex justify-between items-center w-full text-sm font-semibold text-text-primary px-sm py-xs"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <motion.span
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-text-secondary text-sm px-sm py-xs"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

export default Contact;